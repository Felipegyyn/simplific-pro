from datetime import date, timedelta
from collections import defaultdict
from src.database.database import execute_query
from src.utils.formatters import format_currency_brl
from src.models.db import db
from src.models.financial import Transaction, Category
from sqlalchemy import func, case

# ▼▼▼ SUBSTITUA TODA A FUNÇÃO 'get_financial_summary_for_ai' POR ESTA ▼▼▼

def get_financial_summary_for_ai(user_id):
    """
    Gera um resumo CONCISO do status financeiro do mês atual para a IA,
    focando em totais e principais gastos para economizar tokens.
    """
    hoje = date.today()
    inicio_mes = hoje.replace(day=1)
    
    # 1. Busca os totais de Receitas e Despesas com uma única query eficiente
    totals = db.session.query(
        func.sum(case((Transaction.type == 'entrada', Transaction.value), else_=0)).label('total_revenue'),
        func.sum(case((Transaction.type == 'saida', Transaction.value), else_=0)).label('total_expense')
    ).filter(
        Transaction.user_id == user_id,
        Transaction.date.between(inicio_mes, hoje),
        Transaction.status == 'confirmada'
    ).one()

    total_receitas = totals.total_revenue or 0
    total_despesas = totals.total_expense or 0
    
    if total_receitas == 0 and total_despesas == 0:
        return "Resumo do Mês: Nenhuma transação registrada este mês."

    # 2. Busca as 3 categorias com os maiores gastos
    top_expenses = db.session.query(
        Category.name,
        func.sum(Transaction.value).label('total')
    ).join(Category, Transaction.category_id == Category.id).filter(
        Transaction.user_id == user_id,
        Transaction.date.between(inicio_mes, hoje),
        Transaction.type == 'saida',
        Transaction.status == 'confirmada'
    ).group_by(Category.name).order_by(func.sum(Transaction.value).desc()).limit(3).all()
    
    top_categorias_texto = ", ".join([f"{cat} ({format_currency_brl(val)})" for cat, val in top_expenses])

    # 3. Monta o resumo final, agora muito mais curto e direto
    resumo = (
        f"Resumo do Mês: "
        f"Receitas totais de {format_currency_brl(total_receitas)}. "
        f"Despesas totais de {format_currency_brl(total_despesas)}. "
        f"Saldo do período: {format_currency_brl(total_receitas - total_despesas)}. "
        f"Principais gastos do mês: {top_categorias_texto if top_categorias_texto else 'Nenhuma despesa registrada'}."
    )
    
    return resumo
# ▲▲▲ FIM DO BLOCO DE SUBSTITUIÇÃO ▲▲▲

# --- NOVA FUNÇÃO ADICIONADA ABAIXO ---

def buscar_transacoes_por_periodo(user_id, data_inicio, data_fim, tipo_consulta):
    """
    Busca transações de um usuário em um determinado período e tipo.
    """
    base_query = """
        SELECT 
            t.value, 
            t.description,
            t.type, 
            c.name as category_name
        FROM 
            transactions t
        JOIN 
            categories c ON t.category_id = c.id
        WHERE 
            t.user_id = :user_id AND
            t.date BETWEEN :data_inicio AND :data_fim
    """
    
    params = {
        'user_id': user_id,
        'data_inicio': data_inicio,
        'data_fim': data_fim
    }

    if tipo_consulta == 'despesas':
        base_query += " AND t.type = 'saida'"
    elif tipo_consulta == 'receitas':
        base_query += " AND t.type = 'entrada'"
    
    base_query += " ORDER BY t.date DESC"

    resultado = execute_query(base_query, params)
    
    return resultado


# ▼▼▼ SUBSTITUA TODA A FUNÇÃO 'get_planning_summary_for_ai' POR ESTA ▼▼▼

def get_planning_summary_for_ai(user_id):
    """
    Gera um resumo CONCISO do planejamento (Orçado vs. Realizado) para a IA,
    focando nos totais e nas 3 categorias mais críticas.
    """
    hoje = date.today()
    inicio_mes = hoje.replace(day=1)
    
    # A função 'buscar_resumo_planejamento' já é eficiente, vamos continuar usando-a.
    resumo_planejamento = buscar_resumo_planejamento(user_id, inicio_mes, hoje)

    if not resumo_planejamento:
        return "Planejamento do Mês: Nenhum orçamento definido para o período atual."

    # 1. Calcula os totais gerais.
    total_orcado = sum(item['orcado'] for item in resumo_planejamento)
    total_realizado = sum(item['realizado'] for item in resumo_planejamento)

    # 2. Encontra as 3 categorias mais críticas (maior percentual gasto).
    #    A função sorted() com a chave 'lambda' e 'reverse=True' faz essa mágica.
    categorias_criticas = sorted(resumo_planejamento, key=lambda x: x['percentual'], reverse=True)[:3]
    
    resumos_criticos = []
    for item in categorias_criticas:
        # Adiciona um emoji para status visual rápido
        status_emoji = "🚨" if item['percentual'] >= 100 else "⚠️" if item['percentual'] > 80 else "✅"
        resumos_criticos.append(
            f"{item['categoria']} ({item['percentual']:.0f}% gasto {status_emoji})"
        )
    
    # 3. Monta o resumo final, muito mais curto.
    resumo_texto = (
        f"Planejamento do Mês: Orçamento total de {format_currency_brl(total_orcado)}, "
        f"com {format_currency_brl(total_realizado)} já gastos. "
        f"Categorias mais críticas: {', '.join(resumos_criticos) if resumos_criticos else 'Nenhuma despesa registrada'}."
    )
    
    return resumo_texto
# ▲▲▲ FIM DO BLOCO DE SUBSTITUIÇÃO ▲▲▲

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

    
