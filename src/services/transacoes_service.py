from datetime import datetime, date
import re
from src.database.database import execute_query
import fitz  # PyMuPDF 
from src.services.ai_assessor_service import categorizar_descricao_transacao, extrair_transacoes_de_texto_com_ia
from src.models.db import db
from src.models.financial import Transaction, Category
from src.models.extended_modules import BankAccount, CreditCard, CreditCardTransaction, CreditCardCategory
from src.services.ocr_service import extract_text_from_url
from src.utils.storage import upload_image_from_url
from src.utils.formatters import format_currency_brl

def criar_fatura(numero_usuario, valor, descricao, cartao):
    """
    Grava o lançamento na tabela de transações do cartão de crédito
    """
    cartao_obj = CreditCard.query.filter_by(
        user_id=numero_usuario,
        name=cartao['nome'],
        last_digits=cartao['ultimos_quatro']
    ).first()

    if not cartao_obj:
        raise ValueError(f"Cartão não encontrado: {cartao['nome']} ({cartao['ultimos_quatro']})")

    categoria = CreditCardCategory.query.filter_by(name="Outros").first()
    if not categoria:
        raise ValueError("Categoria de cartão 'Outros' não encontrada.")

    nova_transacao = CreditCardTransaction(
        user_id=numero_usuario,
        credit_card_id=cartao_obj.id,
        category_id=categoria.id,
        description=descricao,
        value=float(valor),
        date=datetime.now().date(),
        installments=1,
        current_installment=1,
        is_recurring=False,
        created_at=datetime.now()
    )
    db.session.add(nova_transacao)

    if cartao_obj.available_limit is None:
        cartao_obj.available_limit = cartao_obj.limit
    cartao_obj.available_limit -= float(valor)
    if cartao_obj.available_limit < 0:
        cartao_obj.available_limit = 0
    db.session.commit()


# --- NOVAS FUNÇÕES ADICIONADAS ABAIXO ---

def buscar_transacoes_pendentes(user_id) -> list:
    """
    Busca todas as transações de um usuário com o status 'pendente'.
    """
    query = """
        SELECT 
            id, 
            description,
            value,
            type
        FROM 
            transactions
        WHERE 
            user_id = :user_id AND
            status = 'pendente'
        ORDER BY 
            date ASC
    """
    params = {'user_id': user_id}
    resultado = execute_query(query, params)
    return resultado if isinstance(resultado, list) else []

def confirmar_transacao_por_id(transaction_id, user_id):
    """
    Atualiza o status de uma transação específica para 'confirmada',
    garantindo que ela pertence ao usuário correto.
    """
    query = """
        UPDATE transactions
        SET status = 'confirmada'
        WHERE id = :transaction_id AND user_id = :user_id
    """
    params = {
        'transaction_id': transaction_id,
        'user_id': user_id
    }
    try:
        # Executa a query de atualização sem esperar um retorno de dados
        execute_query(query, params)
        # Se a query foi executada sem levantar uma exceção, consideramos sucesso
        return True
    except Exception as e:
        print(f"Erro ao executar a query de confirmação: {e}")
        return False


def buscar_transacoes_por_status(user_id, status, data_inicio, data_fim, tipo='ambos') -> list:
    """
    Busca transações de um usuário com um status específico e, opcionalmente,
    por tipo ('entrada', 'saida', ou 'ambos').
    """
    query = """
        SELECT
            t.description,
            t.value,
            c.name as category_name,
            t.date,
            t.type -- Adicionado para sabermos se é entrada ou saída
        FROM
            transactions t
        JOIN
            categories c ON t.category_id = c.id
        WHERE
            t.user_id = :user_id AND
            t.status = :status AND
            t.date BETWEEN :data_inicio AND :data_fim
    """
    params = {
        'user_id': user_id,
        'status': status,
        'data_inicio': data_inicio,
        'data_fim': data_fim
    }

    # Adiciona o filtro de tipo dinamicamente
    if tipo == 'entrada':
        query += " AND t.type = 'entrada'"
    elif tipo == 'saida':
        query += " AND t.type = 'saida'"

    query += " ORDER BY t.date DESC"
    
    resultado = execute_query(query, params)
    return resultado if isinstance(resultado, list) else []


def processar_extrato_pdf(user_id, pdf_file_stream):
    """
    Processa um PDF de extrato, extrai transações usando IA, as categoriza
    e as salva como pendentes no banco de dados.
    """
    try:
        documento = fitz.open(stream=pdf_file_stream.read(), filetype="pdf")
        texto_completo = "".join(pagina.get_text() for pagina in documento)

        # --- A MÁGICA ACONTECE AQUI ---
        # 1. Chama a IA para extrair as transações do texto
        print("INFO: Chamando IA para extrair transações do texto do extrato...")
        transacoes_extraidas = extrair_transacoes_de_texto_com_ia(texto_completo)

        if not transacoes_extraidas:
            return {"status": "sucesso", "mensagem": "Importação concluída! 0 lançamentos encontrados no extrato."}

        novos_lancamentos = []
        categoria_outros_saida = Category.query.filter_by(user_id=user_id, name='Outros', type='saida').first()
        categoria_outros_entrada = Category.query.filter_by(user_id=user_id, name='Outros', type='entrada').first()

        # 2. Itera sobre a lista de transações que a IA retornou
        for transacao in transacoes_extraidas:
            valor = float(transacao.get('valor', 0))
            descricao = transacao.get('descricao', 'Sem descrição')
            data_str = transacao.get('data')

            if valor == 0 or not data_str:
                continue # Pula se a transação for inválida

            tipo_transacao = 'entrada' if valor > 0 else 'saida'

            # 3. Usa a outra função de IA para categorizar a descrição
            nome_categoria_ia = categorizar_descricao_transacao(user_id, descricao)

            categoria_final = Category.query.filter_by(user_id=user_id, name=nome_categoria_ia, type=tipo_transacao).first()

            if categoria_final:
                categoria_id_final = categoria_final.id
            else:
                cat_padrao = categoria_outros_entrada if tipo_transacao == 'entrada' else categoria_outros_saida
                categoria_id_final = cat_padrao.id if cat_padrao else None

            novo_lancamento = Transaction(
                user_id=user_id,
                date=datetime.strptime(data_str, '%Y-%m-%d').date(),
                type=tipo_transacao,
                category_id=categoria_id_final,
                value=abs(valor), # Salva sempre o valor positivo
                description=f"[Importado] {descricao}",
                status='pendente',
                format='variavel',      # Define o formato como 'variável'
                payment_form='a_vista'  # Define a forma de pagamento como 'à vista'
            )
            novos_lancamentos.append(novo_lancamento)

        if novos_lancamentos:
            db.session.add_all(novos_lancamentos)
            db.session.commit()

        return {
            "status": "sucesso",
            "mensagem": f"Importação concluída! {len(novos_lancamentos)} lançamentos adicionados como pendentes."
        }

    except Exception as e:
        print(f"ERRO CRÍTICO ao processar o arquivo PDF com IA: {e}")
        return {"status": "erro", "mensagem": "Ocorreu um erro inesperado ao processar o extrato. Tente novamente."}

def processar_comprovante_imagem(user_id, image_url):
    """
    Orquestra o processamento completo de uma imagem de comprovante.
    1. Salva a imagem no Cloudinary.
    2. Extrai texto com OCR (Google Vision).
    3. Extrai dados da transação com IA (Gemini).
    4. Categoriza a transação com IA (Gemini).
    5. Salva a transação como 'pendente' no banco.
    """
    print(f"Iniciando processamento de comprovante para user_id: {user_id}")
    
    permanent_url = None # Inicializa a variável
    
    try:
        # --- Passo 1: Salvar Imagem Permanentemente (Segurança) ---
        # Salva antes de processar, para garantir que temos o comprovante
        permanent_url = upload_image_from_url(image_url, folder_name="comprovantes")
        if not permanent_url:
            print("FALHA: Erro ao salvar imagem no Cloudinary.")
            # Se falhar aqui, ainda podemos tentar processar, mas não salvaremos a URL
            pass # Continua o fluxo mesmo assim

        # --- Passo 2: Ler Imagem (OCR) ---
        raw_text = extract_text_from_url(image_url)
        if not raw_text:
            print("FALHA: OCR não encontrou texto na imagem.")
            return {"status": "erro", "mensagem": "Não consegui ler nenhum texto nesse comprovante. 🧾 Tente uma foto melhor, por favor."}

        # --- Passo 3: Extrair Dados (IA) ---
        # Reutiliza a função do extrato de PDF
        transacoes_extraidas = extrair_transacoes_de_texto_com_ia(raw_text)
        
        if not transacoes_extraidas:
            print("FALHA: IA não identificou uma transação no texto do OCR.")
            return {"status": "info", "mensagem": "Recebi seu comprovante, mas não consegui identificar um lançamento claro nele. Vou deixar passar por enquanto."}
        
        # Pega a primeira transação (comprovantes geralmente são de 1 item)
        transacao_ia = transacoes_extraidas[0]
        valor = float(transacao_ia.get('valor', 0))
        descricao = transacao_ia.get('descricao', 'Sem descrição')
        data_str = transacao_ia.get('data')
        conta_origem_ia = transacao_ia.get('conta_origem')

        if valor == 0 or not data_str:
            print("FALHA: IA extraiu dados inválidos (valor R$ 0 ou sem data).")
            return {"status": "info", "mensagem": "Entendi o comprovante, mas não achei o valor ou a data. Pode me dizer qual é?"}

        # --- Passo 4: Categorizar e Criar o Menu Numérico ---
        tipo_transacao = 'entrada' if valor > 0 else 'saida'
        nome_categoria_ia = categorizar_descricao_transacao(user_id, descricao)

        categoria_final = Category.query.filter(
            Category.user_id == user_id, Category.name.ilike(nome_categoria_ia), Category.type == tipo_transacao
        ).first()

        if not categoria_final:
            categoria_final = Category.query.filter_by(user_id=user_id, name='Outros', type=tipo_transacao).first()
            if not categoria_final:
                 return {"status": "erro", "mensagem": "Categoria 'Outros' não encontrada."}

        bank_account_id_final = None
        nome_banco_encontrado = ""
        conta_banco_exata = None
        precisa_perguntar = False
        opcoes_contas_str = ""

        if conta_origem_ia:
            contas_banco = BankAccount.query.filter(
                BankAccount.user_id == user_id, BankAccount.bank_name.ilike(f"%{conta_origem_ia}%")
            ).all()

            if len(contas_banco) == 1:
                conta_banco_exata = contas_banco[0]
                bank_account_id_final = conta_banco_exata.id
                nome_banco_encontrado = conta_banco_exata.bank_name
            elif len(contas_banco) > 1:
                precisa_perguntar = True
                lista_opcoes = []
                # Gera a lista: 1 - PicPay (final 2345)
                for i, c in enumerate(contas_banco, 1):
                    final_conta = c.account_number[-4:] if c.account_number else 'XXXX'
                    lista_opcoes.append(f"*{i}* - {c.bank_name} (final {final_conta})")
                opcoes_contas_str = "\n".join(lista_opcoes)

        # --- Passo 5: Salvar Congelado e Armazenar Opções ---
        status_transacao = 'aguardando_conta' if precisa_perguntar else 'confirmada'
        descricao_salvar = f"[Comprovante] {descricao}"
        
        # Se precisar perguntar, escondemos o banco na descrição para o Python lembrar depois
        if precisa_perguntar:
            descricao_salvar += f" | AI_BANK:{conta_origem_ia}"

        novo_lancamento = Transaction(
            user_id=user_id,
            date=datetime.strptime(data_str, '%Y-%m-%d').date(),
            type=tipo_transacao,
            category_id=categoria_final.id,
            value=abs(valor),
            description=descricao_salvar,
            status=status_transacao, 
            format='variavel',
            payment_form='a_vista',
            receipt_image_url=permanent_url,
            bank_account_id=bank_account_id_final
        )
        db.session.add(novo_lancamento)

        # Abate o saldo só se tiver certeza
        if not precisa_perguntar and bank_account_id_final and conta_banco_exata:
            if tipo_transacao == 'entrada':
                conta_banco_exata.current_balance += float(abs(valor))
            elif tipo_transacao == 'saida':
                conta_banco_exata.current_balance -= float(abs(valor))

        db.session.commit()
        valor_formatado = format_currency_brl(abs(valor))
        
        if precisa_perguntar:
            return {"status": "sucesso", "mensagem": f"🧾 Identifiquei um comprovante de *{valor_formatado}* ({descricao}).\n\n🤔 Mas notei que você tem mais de uma conta para esse banco:\n\n{opcoes_contas_str}\n\nResponda apenas com o *número da opção* (ex: 1) para eu finalizar o lançamento!"}
        else:
            msg_conta = f" no banco *{nome_banco_encontrado}*" if bank_account_id_final else ""
            return {"status": "sucesso", "mensagem": f"Legal! 🧾 Comprovante processado. O lançamento de *{valor_formatado}*{msg_conta} já está *confirmado* na sua plataforma."}

    except Exception as e:
        db.session.rollback()
        print(f"ERRO CRÍTICO ao processar comprovante de imagem: {e}")
        return {"status": "erro", "mensagem": "Ocorreu um erro inesperado ao processar seu comprovante. A equipe já foi notificada."}

def vincular_conta_ultima_transacao(user_id, identificador_ou_opcao):
    """
    Vincula uma conta bancária à transação recente que ficou sem vínculo ou pendente de seleção.
    Suporta:
    - Transações com status 'aguardando_conta' (comprovantes onde múltiplos bancos coincidiam).
    - Transações com status 'confirmada' mas bank_account_id=None.
    - Seleção por número de opção (ex: '1', '2'), dígitos finais da conta (ex: '2345'),
      número da conta, ou nome do banco (ex: 'Nubank', 'Inter').
    Atualiza o saldo bancário correspondente (débito para saída, crédito para entrada).
    """
    try:
        identificador_str = str(identificador_ou_opcao).strip() if identificador_ou_opcao is not None else ""
        if not identificador_str:
            return {"status": "erro", "mensagem": "Por favor, informe o número da opção ou os dígitos da conta bancária."}

        # 1. Busca transação que necessita de vínculo (prioridade para 'aguardando_conta', depois confirmada sem conta)
        transacao = Transaction.query.filter_by(
            user_id=user_id,
            status='aguardando_conta'
        ).order_by(Transaction.created_at.desc()).first()

        if not transacao:
            transacao = Transaction.query.filter_by(
                user_id=user_id,
                bank_account_id=None,
                status='confirmada'
            ).order_by(Transaction.created_at.desc()).first()

        if not transacao:
            return {"status": "erro", "mensagem": "Não encontrei nenhuma transação recente aguardando vínculo de conta."}

        conta_escolhida = None

        # 2. Se houver metadado oculto AI_BANK na descrição, processa primeiro
        banco_ia = None
        if transacao.description and " | AI_BANK:" in transacao.description:
            partes = transacao.description.split(" | AI_BANK:")
            descricao_limpa = partes[0]
            banco_ia = partes[1].strip()
            transacao.description = descricao_limpa

            # Tenta filtrar contas que coincidem com a sugestão da IA
            contas_banco = BankAccount.query.filter(
                BankAccount.user_id == user_id,
                BankAccount.bank_name.ilike(f"%{banco_ia}%")
            ).all()

            try:
                indice = int(identificador_str) - 1
                if 0 <= indice < len(contas_banco):
                    conta_escolhida = contas_banco[indice]
            except ValueError:
                pass

        # 3. Se ainda não encontrou, busca em todas as contas ativas do usuário
        todas_contas = BankAccount.query.filter_by(user_id=user_id, is_active=True).all()
        if not todas_contas:
            todas_contas = BankAccount.query.filter_by(user_id=user_id).all()

        if not conta_escolhida:
            # 3a. Tenta match por índice direto na lista de contas ativas (se o usuário mandou só número de opção 1, 2, etc.)
            try:
                idx = int(identificador_str) - 1
                if 0 <= idx < len(todas_contas) and len(identificador_str) <= 2:
                    conta_escolhida = todas_contas[idx]
            except ValueError:
                pass

        if not conta_escolhida:
            # 3b. Tenta match por dígitos finais da conta (ex: '2345')
            numeros = re.sub(r'[^0-9]', '', identificador_str)
            if numeros:
                for c in todas_contas:
                    if c.account_number and (c.account_number.endswith(numeros) or numeros in c.account_number):
                        conta_escolhida = c
                        break

        if not conta_escolhida:
            # 3c. Tenta match por nome do banco (ex: "Nubank", "Inter", "Bradesco")
            termo_limpo = identificador_str.lower().replace("final", "").replace("conta", "").replace("banco", "").strip()
            if termo_limpo:
                for c in todas_contas:
                    if termo_limpo in c.bank_name.lower():
                        conta_escolhida = c
                        break

        if not conta_escolhida:
            return {
                "status": "erro",
                "mensagem": f"Não consegui identificar a conta a partir de '{identificador_str}'. Pode me informar o número da opção ou os 4 últimos dígitos dela?"
            }

        # 4. Vincula, confirma e atualiza saldo
        transacao.bank_account_id = conta_escolhida.id
        transacao.status = 'confirmada'

        valor_float = float(transacao.value)
        if transacao.type == 'entrada':
            conta_escolhida.current_balance += valor_float
        elif transacao.type == 'saida':
            conta_escolhida.current_balance -= valor_float

        db.session.commit()

        val_fmt = format_currency_brl(valor_float)
        return {
            "status": "sucesso",
            "mensagem": f"Pronto! Vinculei o lançamento de {val_fmt} na conta '{conta_escolhida.bank_name}' e já atualizei o saldo lá. ✅"
        }

    except Exception as e:
        db.session.rollback()
        print(f"Erro CRÍTICO ao vincular conta: {e}")
        return {"status": "erro", "mensagem": f"Erro interno ao vincular conta: {e}"}


def processar_comprovante_bytes(user_id, file_bytes, filename=None, content_type=None):
    """
    Processa um comprovante enviado diretamente via bytes/upload no Vision Web.
    1. Faz upload para o Cloudinary (ou salva localmente na pasta static/comprovantes).
    2. Extrai texto via OCR (PyMuPDF para PDF, Google Vision / Gemini Multimodal para imagem).
    3. Extrai dados financeiros estruturados com IA (FreeLLMAPI -> Groq -> Gemini).
    4. Categoriza e vincula conta bancária.
    5. Registra no banco de dados e retorna o recibo digital formatado.
    """
    import os
    print(f"🧾 [VISION OCR] Processando comprovante para user_id={user_id}, filename={filename}, bytes={len(file_bytes)}")
    permanent_url = None

    try:
        # 1. Salvar no Cloudinary (ou armazenamento local)
        if os.getenv("CLOUDINARY_CLOUD_NAME"):
            try:
                import cloudinary
                import cloudinary.uploader
                upload_res = cloudinary.uploader.upload(
                    file_bytes,
                    folder="comprovantes",
                    resource_type="auto"
                )
                permanent_url = upload_res.get('secure_url')
            except Exception as e:
                print(f"⚠️ Aviso Cloudinary: {e}")

        if not permanent_url:
            try:
                import uuid
                ext = "jpg"
                if filename and '.' in filename:
                    ext = filename.rsplit('.', 1)[-1].lower()
                elif content_type and 'pdf' in str(content_type).lower():
                    ext = "pdf"
                local_name = f"comp_{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
                dir_path = os.path.join(os.getcwd(), "src", "static", "comprovantes")
                os.makedirs(dir_path, exist_ok=True)
                with open(os.path.join(dir_path, local_name), "wb") as f:
                    f.write(file_bytes)
                permanent_url = f"/static/comprovantes/{local_name}"
            except Exception as e:
                print(f"⚠️ Aviso ao salvar arquivo local: {e}")

        # 2. Leitura OCR (PDF vs Imagem)
        is_pdf = (filename and filename.lower().endswith('.pdf')) or (content_type and 'pdf' in str(content_type).lower())
        raw_text = ""

        if is_pdf:
            try:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                raw_text = "\n".join(pagina.get_text() for pagina in doc).strip()
            except Exception as e:
                print(f"⚠️ Erro ao ler PDF com PyMuPDF: {e}")

        if not raw_text and not is_pdf:
            # Tentativa 1: Google Cloud Vision
            try:
                from google.cloud import vision
                client = vision.ImageAnnotatorClient()
                image = vision.Image(content=file_bytes)
                response_vision = client.text_detection(image=image)  # pyrefly: ignore[missing-attribute]
                if response_vision.full_text_annotation:
                    raw_text = response_vision.full_text_annotation.text.strip()
            except Exception as e:
                print(f"⚠️ Google Vision OCR indisponível ou falhou: {e}")

            # Tentativa 2: Gemini Vision multimodal
            if not raw_text:
                try:
                    import google.generativeai as genai
                    from PIL import Image
                    import io
                    pil_img = Image.open(io.BytesIO(file_bytes))
                    model_gem = genai.GenerativeModel('gemini-flash-latest')
                    res_gem = model_gem.generate_content([
                        pil_img,
                        "Transcreva fielmente todo o texto presente neste comprovante financeiro brasileiro (valores, datas, destinatário, pagador, banco):"
                    ])
                    if res_gem and res_gem.text:
                        raw_text = res_gem.text.strip()
                except Exception as e:
                    print(f"⚠️ Gemini Vision OCR falhou: {e}")

        if not raw_text:
            return {
                "status": "erro",
                "mensagem": "Não consegui ler o texto deste comprovante. 🧾 Tente enviar uma foto mais nítida ou em formato PDF/imagem."
            }

        # 3. Extrair dados da transação com IA
        transacoes_extraidas = extrair_transacoes_de_texto_com_ia(raw_text)
        if not transacoes_extraidas:
            return {
                "status": "info",
                "mensagem": "Recebi seu comprovante, mas não consegui identificar um lançamento claro nele. Pode me informar o valor e descrição por mensagem?"
            }

        transacao_ia = transacoes_extraidas[0]
        valor = float(transacao_ia.get('valor', 0))
        descricao = transacao_ia.get('descricao', 'Comprovante')
        data_str = transacao_ia.get('data') or datetime.now().strftime('%Y-%m-%d')
        conta_origem_ia = transacao_ia.get('conta_origem')

        if valor == 0:
            return {
                "status": "info",
                "mensagem": "Entendi o comprovante, mas o valor identificado foi R$ 0,00. Pode me dizer o valor correto?"
            }

        # 4. Categorizar
        tipo_transacao = 'entrada' if valor > 0 else 'saida'
        nome_categoria_ia = categorizar_descricao_transacao(user_id, descricao)

        categoria_final = Category.query.filter(
            Category.user_id == user_id,
            Category.name.ilike(nome_categoria_ia),
            Category.type == tipo_transacao
        ).first()

        if not categoria_final:
            categoria_final = Category.query.filter_by(user_id=user_id, name='Outros', type=tipo_transacao).first()
            if not categoria_final:
                categoria_final = Category(user_id=user_id, name='Outros', type=tipo_transacao)
                db.session.add(categoria_final)
                db.session.flush()

        # 5. Vinculação de Conta Bancária
        bank_account_id_final = None
        nome_banco_encontrado = ""
        conta_banco_exata = None
        precisa_perguntar = False
        opcoes_contas_str = ""

        if conta_origem_ia:
            contas_banco = BankAccount.query.filter(
                BankAccount.user_id == user_id,
                BankAccount.bank_name.ilike(f"%{conta_origem_ia}%")
            ).all()

            if len(contas_banco) == 1:
                conta_banco_exata = contas_banco[0]
                bank_account_id_final = conta_banco_exata.id
                nome_banco_encontrado = conta_banco_exata.bank_name
            elif len(contas_banco) > 1:
                precisa_perguntar = True
                lista_opcoes = []
                for i, c in enumerate(contas_banco, 1):
                    final_conta = c.account_number[-4:] if c.account_number else 'XXXX'
                    lista_opcoes.append(f"*{i}* - {c.bank_name} (final {final_conta})")
                opcoes_contas_str = "\n".join(lista_opcoes)

        status_transacao = 'aguardando_conta' if precisa_perguntar else 'confirmada'
        descricao_salvar = f"[Comprovante] {descricao}"
        if precisa_perguntar:
            descricao_salvar += f" | AI_BANK:{conta_origem_ia}"

        try:
            data_parsed = datetime.strptime(data_str, '%Y-%m-%d').date()
        except Exception:
            data_parsed = date.today()

        novo_lancamento = Transaction(
            user_id=user_id,
            date=data_parsed,
            type=tipo_transacao,
            category_id=categoria_final.id,
            value=abs(valor),
            description=descricao_salvar,
            status=status_transacao,
            format='variavel',
            payment_form='a_vista',
            receipt_image_url=permanent_url,
            bank_account_id=bank_account_id_final
        )
        db.session.add(novo_lancamento)

        if not precisa_perguntar and bank_account_id_final and conta_banco_exata:
            if tipo_transacao == 'entrada':
                conta_banco_exata.current_balance += float(abs(valor))
            elif tipo_transacao == 'saida':
                conta_banco_exata.current_balance -= float(abs(valor))

        db.session.commit()
        valor_formatado = format_currency_brl(abs(valor))

        recibo_visual = {
            "title": "Comprovante Registrado",
            "description": descricao,
            "value": abs(valor),
            "type_trans": tipo_transacao,
            "category": categoria_final.name,
            "bank_account": nome_banco_encontrado or None,
            "timestamp": datetime.now().strftime("%d/%m/%Y às %H:%M"),
            "receipt_image_url": permanent_url
        }

        if precisa_perguntar:
            msg = (
                f"🧾 Identifiquei seu comprovante de **{valor_formatado}** ({descricao}).\n\n"
                f"🤔 Notei que você possui mais de uma conta para esse banco:\n\n{opcoes_contas_str}\n\n"
                "Responda apenas com o *número da opção* para eu finalizar o vínculo com sua conta bancária!"
            )
            return {
                "status": "sucesso",
                "mensagem": msg,
                "transacao": recibo_visual,
                "precisa_perguntar": True
            }
        else:
            msg_conta = f" no banco **{nome_banco_encontrado}**" if bank_account_id_final else ""
            msg = f"Legal! 🧾 Comprovante processado. O lançamento de **{valor_formatado}** ({descricao}){msg_conta} já está **confirmado** na sua plataforma."
            return {
                "status": "sucesso",
                "mensagem": msg,
                "transacao": recibo_visual,
                "precisa_perguntar": False
            }

    except Exception as e:
        db.session.rollback()
        print(f"ERRO CRÍTICO ao processar comprovante de arquivo: {e}")
        return {
            "status": "erro",
            "mensagem": f"Ocorreu um erro inesperado ao processar seu comprovante: {e}"
        }


# ==============================================================================
# FUNÇÕES DE GESTÃO DO ASSISTENTE VISION (EDIÇÃO, EXCLUSÃO E ESTORNO)
# ==============================================================================

def localizar_transacao_usuario(user_id, termo_busca=None, transacao_id=None):
    """
    Localiza uma transação do usuário pelo ID ou por busca textual / semântica / último lançamento.
    """
    if transacao_id:
        return Transaction.query.filter_by(id=transacao_id, user_id=user_id).first()

    query = Transaction.query.filter_by(user_id=user_id)

    if not termo_busca:
        return query.order_by(Transaction.id.desc()).first()

    termo = str(termo_busca).strip().lower()

    if any(k in termo for k in ['ultimo', 'último', 'ultima', 'última', 'recente']):
        termo_limpo = re.sub(r'\b(o|a|os|as|meu|minha|ultimo|último|ultima|última|lancamento|lançamento|gasto|despesa|receita)\b', '', termo, flags=re.IGNORECASE).strip()
        if termo_limpo:
            tx = query.filter(Transaction.description.ilike(f'%{termo_limpo}%')).order_by(Transaction.id.desc()).first()
            if tx:
                return tx
        return query.order_by(Transaction.id.desc()).first()

    # Tenta achar por valor numérico exato
    try:
        val_str = termo.replace('r$', '').replace('R$', '').replace(' ', '').replace(',', '.')
        val_num = float(val_str)
        tx = query.filter(Transaction.value == val_num).order_by(Transaction.id.desc()).first()
        if tx:
            return tx
    except ValueError:
        pass

    # Busca por descrição parcial
    tx = query.filter(Transaction.description.ilike(f'%{termo}%')).order_by(Transaction.id.desc()).first()
    if tx:
        return tx

    return query.order_by(Transaction.id.desc()).first()


def editar_transacao_assistente(user_id, termo_busca=None, novo_valor=None, nova_descricao=None, nova_categoria=None, nova_data=None):
    """
    Edita uma transação existente via linguagem natural.
    Reajusta saldo bancário se a transação estiver confirmada e o valor tiver sido alterado.
    """
    tx = localizar_transacao_usuario(user_id, termo_busca)
    if not tx:
        return {"status": "erro", "mensagem": "Não encontrei nenhum lançamento recente para editar."}

    val_antigo = tx.value

    if nova_descricao:
        tx.description = nova_descricao

    if nova_data:
        try:
            tx.date = datetime.strptime(nova_data, '%Y-%m-%d').date()
        except (ValueError, TypeError):
            pass

    if nova_categoria:
        cat = Category.query.filter(Category.user_id == user_id, Category.name.ilike(f'%{nova_categoria}%')).first()
        if cat:
            tx.category_id = cat.id

    if novo_valor is not None:
        try:
            val_novo = abs(float(novo_valor))
            dif = val_novo - val_antigo

            if tx.status == 'confirmada' and tx.bank_account_id:
                conta = BankAccount.query.filter_by(id=tx.bank_account_id, user_id=user_id).first()
                if conta:
                    if tx.type == 'saida':
                        conta.current_balance -= dif
                    elif tx.type == 'entrada':
                        conta.current_balance += dif

            tx.value = val_novo
        except Exception as e:
            print(f"Erro ao converter novo valor: {e}")

    try:
        db.session.commit()
        val_fmt = format_currency_brl(tx.value)
        return {
            "status": "sucesso",
            "mensagem": f"Transação atualizada com sucesso! *{tx.description}* agora está em *{val_fmt}* ({tx.category.name if tx.category else 'Geral'}).",
            "transacao": tx.to_dict()
        }
    except Exception as e:
        db.session.rollback()
        return {"status": "erro", "mensagem": f"Erro ao salvar alterações no banco: {e}"}


def excluir_transacao_assistente(user_id, termo_busca=None):
    """
    Exclui ou estorna uma transação via linguagem natural.
    Estorna o saldo da conta bancária se o lançamento já estava confirmado!
    """
    tx = localizar_transacao_usuario(user_id, termo_busca)
    if not tx:
        return {"status": "erro", "mensagem": "Não encontrei nenhum lançamento compatível para excluir."}

    desc = tx.description
    val = tx.value
    tipo = tx.type
    val_fmt = format_currency_brl(val)

    msg_estorno = ""
    if tx.status == 'confirmada' and tx.bank_account_id:
        conta = BankAccount.query.filter_by(id=tx.bank_account_id, user_id=user_id).first()
        if conta:
            if tipo == 'saida':
                conta.current_balance += val
                msg_estorno = f" e o valor de *{val_fmt}* foi estornado de volta para o saldo de *{conta.bank_name}*"
            elif tipo == 'entrada':
                conta.current_balance -= val
                msg_estorno = f" e a entrada de *{val_fmt}* foi estornada da conta *{conta.bank_name}*"

    try:
        db.session.delete(tx)
        db.session.commit()
        return {
            "status": "sucesso",
            "mensagem": f"🗑️ Lançamento *{desc}* de *{val_fmt}* excluído com sucesso{msg_estorno}."
        }
    except Exception as e:
        db.session.rollback()
        return {"status": "erro", "mensagem": f"Erro ao excluir lançamento: {e}"}