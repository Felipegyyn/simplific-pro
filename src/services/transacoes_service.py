from src.database.database import execute_query
from datetime import datetime, date, timedelta
import fitz  # PyMuPDF 
from src.services.ai_assessor_service import categorizar_descricao_transacao # <-- Nova importação da IA
from src.models.db import db
from collections import defaultdict
import re
from src.models.financial import Transaction, Category
from src.models.extended_modules import CreditCard, CreditCardTransaction, CreditCardCategory

def criar_lancamento(user_id, tipo, categoria_id, valor, descricao, formato='Variável', status='confirmada'):
    """
    Grava o lançamento na tabela de transações
    """
    # ... (O código desta função permanece o mesmo)
    query = """
        INSERT INTO transactions (user_id, date, type, category_id, value, description, format, payment_form, status)
        VALUES (:user_id, :date, :type, :category_id, :value, :description, :format, :payment_form, :status)
    """
    params = {
        'user_id': user_id,
        'date': datetime.now().date(),
        'type': tipo,
        'category_id': categoria_id,
        'value': valor,
        'description': descricao,
        'format': formato,
        'payment_form': 'À vista',
        'status': 'confirmada'
    }
    execute_query(query, params)


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

# --- NOVO MOTOR DE ANÁLISE DE PLANEJAMENTO ADICIONADO ABAIXO ---

# Em src/services/transacoes_service.py
# Substitua a função inteira por esta versão final e corrigida

def buscar_resumo_planejamento(user_id, data_inicio, data_fim):
    """
    Busca planejamentos e transações de um período, calcula o realizado
    e retorna um resumo consolidado por categoria.
    """
    # --- LÓGICA DE DATA CORRIGIDA ---
    # 1. Calcula o primeiro e o último dia do mês de referência
    primeiro_dia_mes = data_inicio.replace(day=1)
    if primeiro_dia_mes.month == 12:
        ultimo_dia_mes = primeiro_dia_mes.replace(year=primeiro_dia_mes.year + 1, month=1, day=1) - timedelta(days=1)
    else:
        ultimo_dia_mes = primeiro_dia_mes.replace(month=primeiro_dia_mes.month + 1, day=1) - timedelta(days=1)
    
    # 2. Busca os planejamentos (orçamentos) para o MÊS INTEIRO
    query_plannings = """
        SELECT
            c.name as category_name,
            SUM(p.value) as orcado
        FROM
            planning p
        JOIN
            categories c ON p.category_id = c.id
        WHERE
            p.user_id = :user_id AND
            p.date BETWEEN :primeiro_dia AND :ultimo_dia AND
            p.type = 'saida'
        GROUP BY
            c.name
    """
    params_planning = {
        'user_id': user_id,
        'primeiro_dia': primeiro_dia_mes,
        'ultimo_dia': ultimo_dia_mes
    }
    planejamentos = execute_query(query_plannings, params_planning)

    # 3. Busca as transações (gastos) para o período até a data atual (esta parte já estava correta)
    query_transactions = """
        SELECT
            c.name as category_name,
            SUM(t.value) as realizado
        FROM
            transactions t
        JOIN
            categories c ON t.category_id = c.id
        WHERE
            t.user_id = :user_id AND
            t.date BETWEEN :data_inicio AND :data_fim AND
            t.type = 'saida' AND
            t.status = 'confirmada'
        GROUP BY
            c.name
    """
    params_transactions = {
        'user_id': user_id,
        'data_inicio': data_inicio,
        'data_fim': data_fim
    }
    transacoes = execute_query(query_transactions, params_transactions)

    # 4. Consolida os dados (lógica existente e correta)
    resumo = {}
    for p in planejamentos:
        resumo[p['category_name']] = {'orcado': p['orcado'], 'realizado': 0}

    for t in transacoes:
        if t['category_name'] in resumo:
            resumo[t['category_name']]['realizado'] = t['realizado']
        else:
            resumo[t['category_name']] = {'orcado': 0, 'realizado': t['realizado']}
            
    # 5. Formata a lista final (lógica existente e correta)
    resultado_final = []
    for nome_categoria, valores in resumo.items():
        orcado = valores['orcado']
        realizado = valores['realizado']
        percentual = (realizado / orcado) * 100 if orcado > 0 else (100 if realizado > 0 else 0)
        resultado_final.append({
            'categoria': nome_categoria,
            'orcado': orcado,
            'realizado': realizado,
            'percentual': percentual
        })
        
    return resultado_final


def get_planning_summary_for_ai(user_id):
    """Gera um resumo textual do planejamento financeiro (Orçado vs. Realizado) para a IA."""
    hoje = date.today()
    inicio_mes = hoje.replace(day=1)
    
    # Reutiliza a função que já existe para buscar os dados consolidados
    resumo_planejamento = buscar_resumo_planejamento(user_id, inicio_mes, hoje)

    if not resumo_planejamento:
        return "Planejamento do Mês: Nenhum orçamento definido para o período atual."

    resumos = []
    total_orcado = 0
    total_realizado = 0

    for item in resumo_planejamento:
        total_orcado += item['orcado']
        total_realizado += item['realizado']
        status = "Extrapolado!" if item['realizado'] > item['orcado'] else "Ok"
        resumos.append(
            f"{item['categoria']} (Gasto: R$ {item['realizado']:.2f} / Orçado: R$ {item['orcado']:.2f} - Status: {status})"
        )
    
    resumo_texto = (
        f"Planejamento do Mês: Orçamento total de R$ {total_orcado:.2f}, com R$ {total_realizado:.2f} já gastos. "
        f"Status por categoria: {'; '.join(resumos)}."
    )
    return resumo_texto

# Adicione esta nova função ao final de transacoes_service.py

# Em src/services/transacoes_service.py
# Substitua a função inteira por esta versão

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

# ▼▼▼ COLE TODO ESTE BLOCO NO FINAL DO ARQUIVO 'transacoes_service.py' ▼▼▼

from datetime import date, timedelta
from sqlalchemy import func, case
from src.models.financial import Transaction, Category

def gerar_resumo_semanal(user_id):
    """
    Calcula o resumo financeiro da última semana completa (Segunda a Domingo) para um usuário.
    """
    hoje = date.today()
    # A linha abaixo calcula o início da semana passada (a última segunda-feira)
    # Ex: se hoje for qua, 28/ago, ele voltará para seg, 19/ago
    inicio_semana = hoje - timedelta(days=hoje.weekday() + 7) 
    
    # O fim da semana passada (o último domingo)
    fim_semana = inicio_semana + timedelta(days=6)

    print(f"DEBUG: Gerando resumo para User ID {user_id} no período de {inicio_semana} a {fim_semana}")

    # 1. Busca os totais de entrada e saída com uma única query no banco
    totais = db.session.query(
        func.sum(case((Transaction.type == 'entrada', Transaction.value), else_=0)).label('total_entradas'),
        func.sum(case((Transaction.type == 'saida', Transaction.value), else_=0)).label('total_saidas')
    ).filter(
        Transaction.user_id == user_id,
        Transaction.status == 'confirmada', # Apenas transações confirmadas
        Transaction.date.between(inicio_semana, fim_semana)
    ).first()

    total_entradas = totais.total_entradas if totais.total_entradas is not None else 0
    total_saidas = totais.total_saidas if totais.total_saidas is not None else 0
    saldo_semanal = total_entradas - total_saidas

    # Se não houve nenhum gasto, retornamos um objeto indicando isso
    if total_saidas == 0:
        return {
            "has_activity": False
        }

    # 2. Busca a categoria com o maior gasto no período
    gastos_por_categoria = db.session.query(
        Category.name,
        func.sum(Transaction.value).label('total')
    ).join(Category, Transaction.category_id == Category.id).filter(
        Transaction.user_id == user_id,
        Transaction.status == 'confirmada',
        Transaction.type == 'saida',
        Transaction.date.between(inicio_semana, fim_semana)
    ).group_by(Category.name).order_by(func.sum(Transaction.value).desc()).first()

    # Define a categoria principal ou um valor padrão
    categoria_principal = gastos_por_categoria.name if gastos_por_categoria else "Diversos"

    return {
        "has_activity": True,
        "total_gasto": float(total_saidas),
        "saldo": float(saldo_semanal),
        "categoria_principal": categoria_principal
    }
# ▲▲▲ FIM DO BLOCO PARA COPIAR ▲▲▲

# ▼▼▼ SUBSTITUA A FUNÇÃO 'processar_extrato_pdf' INTEIRA POR ESTA ▼▼▼

def processar_extrato_pdf(user_id, pdf_file_stream):
    """
    Processa um PDF de extrato, extrai transações, as categoriza com IA
    e as salva como pendentes no banco de dados.
    """
    try:
        documento = fitz.open(stream=pdf_file_stream.read(), filetype="pdf")
        texto_completo = "".join(pagina.get_text() for pagina in documento)
        
        # Expressão Regular (Regex) para encontrar transações no texto
        # Padrão: DD/MM/AAAA (ou DD/MM) Descrição longa... 1.234,56
        regex = r"(\d{2}/\d{2}(?:/\d{4})?)\s+(.*?)\s+([\d\.,]+(?:,\d{2}))\s*(D|C)?\n"
        
        transacoes_encontradas = re.finditer(regex, texto_completo)
        
        novos_lancamentos = []
        contador_total = 0
        contador_nao_categorizado = 0
        
        # Busca a categoria 'Outros' do usuário para usar como fallback
        categoria_outros = Category.query.filter_by(user_id=user_id, name='Outros', type='saida').first()
        if not categoria_outros:
            # Se não existir, você pode querer criar ou simplesmente retornar um erro
            return {"status": "erro", "mensagem": "Categoria 'Outros' do tipo 'saida' não encontrada. Crie-a antes de importar."}

        for match in transacoes_encontradas:
            data_str, descricao, valor_str = match.groups()[:3]
            
            # Limpeza dos dados extraídos
            descricao = ' '.join(descricao.split())
            valor = float(valor_str.replace('.', '').replace(',', '.'))
            
            # Tenta adivinhar o ano e formata a data
            try:
                if len(data_str) <= 5: # Formato DD/MM
                    data_transacao = datetime.strptime(f"{data_str}/{datetime.now().year}", '%d/%m/%Y').date()
                else: # Formato DD/MM/AAAA
                    data_transacao = datetime.strptime(data_str, '%d/%m/%Y').date()
            except ValueError:
                continue # Pula transação se a data for inválida

            # Ignora linhas que são cabeçalhos ou totais
            if "SALDO" in descricao.upper() or valor == 0:
                continue

            # Chama a IA para categorizar a descrição
            print(f"Categorizando com IA a descrição: '{descricao}'")
            nome_categoria_ia = categorizar_descricao_transacao(user_id, descricao)
            
            # Busca o ID da categoria que a IA retornou
            categoria_final = Category.query.filter_by(user_id=user_id, name=nome_categoria_ia, type='saida').first()
            
            if not categoria_final:
                categoria_id_final = categoria_outros.id
                contador_nao_categorizado += 1
            else:
                categoria_id_final = categoria_final.id

            # Cria o objeto de transação (sem salvar ainda)
            novo_lancamento = Transaction(
                user_id=user_id,
                date=data_transacao,
                type='saida', # Assumindo que a maioria são despesas, pode ser melhorado
                category_id=categoria_id_final,
                value=valor,
                description=f"[Importado] {descricao}",
                status='pendente' # Importante: sempre como pendente!
            )
            novos_lancamentos.append(novo_lancamento)
            contador_total += 1
            
        if novos_lancamentos:
            db.session.add_all(novos_lancamentos)
            db.session.commit()

        return {
            "status": "sucesso",
            "total_importado": contador_total,
            "nao_categorizado": contador_nao_categorizado,
            "mensagem": f"Importação concluída! {contador_total} lançamentos adicionados como pendentes."
        }

    except Exception as e:
        print(f"ERRO CRÍTICO ao processar o arquivo PDF: {e}")
        return {"status": "erro", "mensagem": "O arquivo enviado não parece ser um PDF válido ou está corrompido."}