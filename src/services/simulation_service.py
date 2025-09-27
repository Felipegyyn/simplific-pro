# src/services/simulation_service.py

from datetime import date
from dateutil.relativedelta import relativedelta
from src.services.reports_service import get_financial_summary_for_ai # Para analisar o impacto

def _simular_financiamento(user_id, valor_total, prazo_meses, taxa_juros_mensal):
    """
    Calcula os detalhes de um financiamento usando a Tabela Price.
    """
    # Converte a taxa de juros percentual para decimal
    taxa_decimal = taxa_juros_mensal / 100
    
    # Fórmula do valor da parcela (M = P * [r(1+r)^n] / [(1+r)^n – 1])
    if taxa_decimal > 0:
        valor_parcela = valor_total * (taxa_decimal * (1 + taxa_decimal)**prazo_meses) / ((1 + taxa_decimal)**prazo_meses - 1)
    else:
        # Se não houver juros, é uma simples divisão
        valor_parcela = valor_total / prazo_meses

    total_pago = valor_parcela * prazo_meses
    total_juros = total_pago - valor_total

    # Análise de Impacto: Busca as despesas mensais atuais do usuário
    resumo_financeiro = get_financial_summary_for_ai(user_id)
    # Extrai o valor das despesas do texto de resumo (uma forma simples de obter o dado)
    try:
        despesas_atuais_str = resumo_financeiro.split("Despesas totais de R$ ")[1].split(".")[0].replace('.', '').replace(',', '.')
        despesas_atuais = float(despesas_atuais_str)
    except (IndexError, ValueError):
        despesas_atuais = 0 # Se não encontrar, assume zero

    impacto_percentual = (valor_parcela / despesas_atuais) * 100 if despesas_atuais > 0 else 100

    # Retorna um dicionário com todos os resultados calculados
    return {
        'tipo_resultado': 'financiamento',
        'valor_parcela': valor_parcela,
        'total_pago': total_pago,
        'total_juros': total_juros,
        'impacto_percentual_despesas': impacto_percentual
    }

def _simular_projecao_investimento(user_id, aporte_mensal, prazo_anos, taxa_juros_mensal):
    """
    Calcula o valor futuro de um investimento com aportes mensais.
    """
    taxa_decimal = taxa_juros_mensal / 100
    prazo_meses = prazo_anos * 12

    # Fórmula do Valor Futuro de uma anuidade (FV = PMT * [((1+r)^n - 1) / r])
    if taxa_decimal > 0:
        valor_futuro = aporte_mensal * (((1 + taxa_decimal)**prazo_meses - 1) / taxa_decimal)
    else:
        # Se não houver juros, é apenas a soma dos aportes
        valor_futuro = aporte_mensal * prazo_meses

    total_investido = aporte_mensal * prazo_meses
    total_juros = valor_futuro - total_investido

    return {
        'tipo_resultado': 'projecao_investimento',
        'valor_futuro': valor_futuro,
        'total_investido': total_investido,
        'total_juros': total_juros
    }

def run_financial_simulation(user_id, simulation_data):
    """
    Função principal que recebe os dados da IA e direciona para a simulação correta.
    """
    tipo_simulacao = simulation_data.get('tipo_simulacao')

    if tipo_simulacao == 'financiamento':
        return _simular_financiamento(
            user_id,
            simulation_data.get('valor_total'),
            simulation_data.get('prazo_meses'),
            simulation_data.get('taxa_juros_mensal')
        )
    elif tipo_simulacao == 'projecao_investimento':
        return _simular_projecao_investimento(
            user_id,
            simulation_data.get('aporte_mensal'),
            simulation_data.get('prazo_anos'),
            simulation_data.get('taxa_juros_mensal')
        )
    
    # Retorna uma mensagem de erro se a IA enviar um tipo de simulação desconhecido
    return {'error': 'Tipo de simulação não suportado.'}