from src.database.database import execute_query
from datetime import datetime, date, timedelta
import fitz  # PyMuPDF 
from src.services.ai_assessor_service import categorizar_descricao_transacao, extrair_transacoes_de_texto_com_ia # <-- Nova importação da IA
from src.models.db import db
from collections import defaultdict
import re
from src.models.financial import Transaction, Category
from src.models.extended_modules import BankAccount
from src.models.extended_modules import CreditCard, CreditCardTransaction, CreditCardCategory
from sqlalchemy import func, case
# ▼▼▼ ADICIONE ESTAS NOVAS IMPORTAÇÕES ▼▼▼
from src.services.ocr_service import extract_text_from_url
from src.utils.storage import upload_image_from_url
from src.utils.formatters import format_currency_brl # Importe seu formatador de moeda
# ▲▲▲ FIM DAS NOVAS IMPORTAÇÕES ▲▲▲

def criar_fatura(numero_usuario, valor, descricao, cartao):
    """
    Grava o lançamento na tabela de transações do cartão de crédito
    """
    # ... (O código desta função permanece o mesmo)
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
        date=datetime.utcnow().date(),
        installments=1,
        current_installment=1,
        is_recurring=False,
        created_at=datetime.utcnow()
    )
    db.session.add(nova_transacao)

    if cartao_obj.available_limit is None:
        cartao_obj.available_limit = cartao_obj.limit
    cartao_obj.available_limit -= float(valor)
    if cartao_obj.available_limit < 0:
        cartao_obj.available_limit = 0
    db.session.commit()


# --- NOVAS FUNÇÕES ADICIONADAS ABAIXO ---

def buscar_transacoes_pendentes(user_id):
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
    return resultado

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


def buscar_transacoes_por_status(user_id, status, data_inicio, data_fim, tipo='ambos'):
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
    
    return execute_query(query, params)


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
                categoria_id_final = categoria_outros_entrada.id if tipo_transacao == 'entrada' else categoria_outros_saida.id

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

# Em: src/services/transacoes_service.py

# ... (função processar_extrato_pdf e outras) ...


# ▼▼▼ COLE A NOVA FUNÇÃO ABAIXO ▼▼▼

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

        if valor == 0 or not data_str:
            print("FALHA: IA extraiu dados inválidos (valor R$ 0 ou sem data).")
            return {"status": "info", "mensagem": "Entendi o comprovante, mas não achei o valor ou a data. Pode me dizer qual é?"}

        # ... (código anterior da função processar_comprovante_imagem continua igual até a extração das variáveis) ...

        # Pega a primeira transação (comprovantes geralmente são de 1 item)
        transacao_ia = transacoes_extraidas[0]
        valor = float(transacao_ia.get('valor', 0))
        descricao = transacao_ia.get('descricao', 'Sem descrição')
        data_str = transacao_ia.get('data')
        conta_origem_ia = transacao_ia.get('conta_origem') # <-- NOVO: Pega o banco identificado pela IA

        if valor == 0 or not data_str:
            print("FALHA: IA extraiu dados inválidos (valor R$ 0 ou sem data).")
            return {"status": "info", "mensagem": "Entendi o comprovante, mas não achei o valor ou a data. Pode me dizer qual é?"}

        # --- Passo 4: Categorizar (IA) e Buscar Conta Bancária ---
        tipo_transacao = 'entrada' if valor > 0 else 'saida'
        nome_categoria_ia = categorizar_descricao_transacao(user_id, descricao)

        # Busca o ID da Categoria no banco
        categoria_final = Category.query.filter(
            Category.user_id == user_id,
            Category.name.ilike(nome_categoria_ia),
            Category.type == tipo_transacao
        ).first()

        # Fallback para categoria "Outros"
        if not categoria_final:
            categoria_final = Category.query.filter_by(user_id=user_id, name='Outros', type=tipo_transacao).first()
            if not categoria_final:
                 return {"status": "erro", "mensagem": "Não encontrei sua categoria 'Outros'. Por favor, verifique suas categorias na plataforma."}

        # ▼▼▼ NOVA LÓGICA: BUSCA DE MÚLTIPLAS CONTAS BANCÁRIAS ▼▼▼
        bank_account_id_final = None
        nome_banco_encontrado = ""
        conta_banco_exata = None
        precisa_perguntar = False
        opcoes_contas_str = ""

        if conta_origem_ia:
            print(f"INFO: IA identificou possível conta de origem: '{conta_origem_ia}'")
            # Faz a busca flexível e traz TODAS as contas que batem com o nome
            contas_banco = BankAccount.query.filter(
                BankAccount.user_id == user_id,
                BankAccount.bank_name.ilike(f"%{conta_origem_ia}%")
            ).all()

            if len(contas_banco) == 1:
                # 1. ACHOU SÓ UMA CONTA: Fluxo normal e automático!
                conta_banco_exata = contas_banco[0]
                bank_account_id_final = conta_banco_exata.id
                nome_banco_encontrado = conta_banco_exata.bank_name
                print(f"SUCESSO: Conta única vinculada: {nome_banco_encontrado}")

            elif len(contas_banco) > 1:
                # 2. ACHOU MAIS DE UMA CONTA: Aciona o alerta!
                print(f"AVISO: Múltiplas contas encontradas para o banco '{conta_origem_ia}'.")
                precisa_perguntar = True
                
                # Monta um textinho com as opções para enviar no WhatsApp
                nomes_contas = [f"{c.bank_name} (final {c.account_number[-4:] if c.account_number else 'X'})" for c in contas_banco]
                opcoes_contas_str = " ou ".join(nomes_contas)
                
                # Deixamos bank_account_id_final como None para não chutar a conta errada e bagunçar o saldo

            else:
                # 3. NÃO ACHOU NENHUMA CONTA: Segue a vida sem vincular
                print(f"AVISO: O banco '{conta_origem_ia}' foi lido, mas o usuário não tem essa conta.")
        # ▲▲▲ FIM DA NOVA LÓGICA ▲▲▲

        # --- Passo 5: Salvar no Banco E Atualizar Saldo ---
        novo_lancamento = Transaction(
            user_id=user_id,
            date=datetime.strptime(data_str, '%Y-%m-%d').date(),
            type=tipo_transacao,
            category_id=categoria_final.id,
            value=abs(valor),
            description=f"[Comprovante] {descricao}",
            status='confirmada',
            format='variavel',
            payment_form='a_vista',
            receipt_image_url=permanent_url,
            bank_account_id=bank_account_id_final # Fica preenchido ou None dependendo da checagem
        )
        
        db.session.add(novo_lancamento)

        # Atualiza o saldo SOMENTE se tivermos certeza absoluta de qual conta é (1 match exato)
        if bank_account_id_final and conta_banco_exata:
            if tipo_transacao == 'entrada':
                conta_banco_exata.current_balance += float(abs(valor))
            elif tipo_transacao == 'saida':
                conta_banco_exata.current_balance -= float(abs(valor))

        db.session.commit()
        print(f"SUCESSO: Lançamento criado (ID: {novo_lancamento.id})")
        
        valor_formatado = format_currency_brl(abs(valor))
        
        # --- RESPOSTA DINÂMICA PARA O USUÁRIO ---
        if precisa_perguntar:
            return {
                "status": "sucesso",
                "mensagem": f"Legal! 🧾 Salvei o lançamento de *{valor_formatado}* ({descricao}). \n\n🤔 Mas notei que você tem mais de uma conta para esse banco ({opcoes_contas_str}). Por segurança, deixei sem vínculo. Qual delas você quer usar para eu atualizar?"
            }
        else:
            msg_conta = f" no banco *{nome_banco_encontrado}*" if bank_account_id_final else ""
            return {
                "status": "sucesso",
                "mensagem": f"Legal! 🧾 Comprovante processado. O lançamento de *{valor_formatado}*{msg_conta} já está *confirmado* na sua plataforma."
            }

    except Exception as e:
        db.session.rollback()
        print(f"ERRO CRÍTICO ao processar comprovante de imagem: {e}")
        return {"status": "erro", "mensagem": "Ocorreu um erro inesperado ao processar seu comprovante. A equipe já foi notificada."}