from datetime import date, timedelta
from collections import defaultdict
from src.database.database import execute_query
from src.utils.formatters import format_currency_brl


def get_financial_summary_for_ai(user_id):
    """Gera um resumo textual do status financeiro do mês atual para a IA."""
    hoje = date.today()
    inicio_mes = hoje.replace(day=1)
    
    # Reutiliza a função existente para buscar transações
    transacoes = buscar_transacoes_por_periodo(user_id, inicio_mes, hoje, 'ambos')

    if not transacoes:
        return "Resumo do Mês: Nenhuma transação registrada este mês."

    total_receitas = sum(t['value'] for t in transacoes if t['type'] == 'entrada')
    total_despesas = sum(t['value'] for t in transacoes if t['type'] == 'saida')
    
    despesas_por_categoria = defaultdict(float)
    for t in transacoes:
        if t['type'] == 'saida':
            despesas_por_categoria[t['category_name']] += t['value']

    # Pega as 3 categorias com maiores gastos
    top_categorias = sorted(despesas_por_categoria.items(), key=lambda item: item[1], reverse=True)[:3]
    top_categorias_texto = ", ".join([f"{cat} (R$ {val:.2f})" for cat, val in top_categorias])

    resumo = (
        f"Resumo do Mês: "
        f"Receitas totais de {format_currency_brl(total_receitas)}. "
        f"Despesas totais de {format_currency_brl(total_despesas)}. "
        f"Saldo do período: {format_currency_brl(total_receitas - total_despesas)}. "
        f"Principais gastos: {top_categorias_texto if top_categorias_texto else 'Nenhuma despesa registrada'}."
    )
    
    return resumo

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

