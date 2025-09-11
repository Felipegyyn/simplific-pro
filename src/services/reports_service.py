from datetime import date
from collections import defaultdict
from src.services.transacoes_service import buscar_transacoes_por_periodo, format_currency_brl


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

# Adicione esta função ao final de transacoes_service.py
