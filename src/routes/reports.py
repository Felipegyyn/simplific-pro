from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import func, extract
from src.models.db import db
from src.models.financial import Transaction, Category, Planning
from src.models.extended_modules import CreditCard, CreditCardTransaction
from flask import make_response
from src.models.extended import Goal, Investment, InvestmentTransaction
from src.routes.investments import get_historical_stock_price

reports_bp = Blueprint('reports', __name__)

def get_date_range_from_period(period_filter):
    """Função auxiliar para traduzir o filtro de período em datas."""
    today = datetime.now().date()
    if period_filter == 'last_month':
        start_date = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
        end_date = today.replace(day=1) - timedelta(days=1)
    elif period_filter == 'last_3_months':
        start_date = (today.replace(day=1) - timedelta(days=60)).replace(day=1)
        end_date = today
    elif period_filter == 'last_year':
        start_date = today.replace(year=today.year - 1)
        end_date = today
    else: # Padrão: 'last_6_months'
        start_date = (today.replace(day=1) - timedelta(days=150)).replace(day=1)
        end_date = today
    return start_date, end_date

# ▼▼▼ SUBSTITUA A FUNÇÃO get_overview_report INTEIRA POR ESTA ▼▼▼

@reports_bp.route('/reports/overview', methods=['GET'])
@jwt_required()
def get_overview_report():
    user_id = get_jwt_identity()

    # --- 1. Processar Filtros ---
    period = request.args.get('period', 'last_6_months')
    start_date, end_date = get_date_range_from_period(period)

    # --- 2. Query Base ---
    base_query = db.session.query(Transaction).join(Category).filter(
        Transaction.user_id == user_id,
        Transaction.status == 'confirmada',
        Transaction.date >= start_date,
        Transaction.date <= end_date
    )

    # --- 3. Calcular Cards de Resumo ---
    total_receitas = base_query.filter(Category.type == 'entrada').with_entities(func.sum(Transaction.value)).scalar() or 0
    total_despesas = base_query.filter(Category.type == 'saida').with_entities(func.sum(Transaction.value)).scalar() or 0
    saldo_liquido = total_receitas - total_despesas

    # --- 4. Calcular Gráfico "Evolução Mensal" ---
    evolucao_query = base_query.with_entities(
        func.date_trunc('month', Transaction.date).label('month'),
        Category.type,
        func.sum(Transaction.value).label('total')
    ).group_by('month', Category.type).order_by('month').all()

    evolucao_data = {}
    for row in evolucao_query:
        month_str = row.month.strftime('%b')
        if month_str not in evolucao_data:
            evolucao_data[month_str] = {'month': month_str, 'receitas': 0, 'despesas': 0}
        
        if row.type == 'entrada':
            evolucao_data[month_str]['receitas'] = float(row.total)
        else:
            evolucao_data[month_str]['despesas'] = float(row.total)
    
    final_evolucao = sorted(
        [{**data, 'saldo': data['receitas'] - data['despesas']} for data in evolucao_data.values()],
        key=lambda x: datetime.strptime(x['month'], '%b')
    )

    # ▼▼▼ NOVO BLOCO: CÁLCULO DOS CARDS ADICIONAIS ▼▼▼
    positive_months_count = 0
    total_months = len(final_evolucao)
    highest_spending_month = 'N/A'
    average_growth = 0.0

    if total_months > 0:
        # Meses Positivos
        positive_months_count = sum(1 for month_data in final_evolucao if month_data['saldo'] > 0)

        # Maior Gasto
        # Usamos uma função anônima (lambda) para encontrar o mês com a maior despesa
        month_with_max_expense = max(final_evolucao, key=lambda x: x['despesas'])
        highest_spending_month = month_with_max_expense['month']

        # Crescimento Médio do Saldo
        monthly_growth_rates = []
        if total_months > 1:
            for i in range(1, total_months):
                prev_saldo = final_evolucao[i-1]['saldo']
                current_saldo = final_evolucao[i]['saldo']
                if prev_saldo != 0:
                    growth = ((current_saldo - prev_saldo) / abs(prev_saldo)) * 100
                    monthly_growth_rates.append(growth)
            
            if monthly_growth_rates:
                average_growth = sum(monthly_growth_rates) / len(monthly_growth_rates)
    # ▲▲▲ FIM DO NOVO BLOCO ▲▲▲

    # --- 5. Demais Cálculos (Categorias, Cartões, etc.) ---
    # ... (o resto da sua função continua igual até a resposta final)
    distribuicao_query = base_query.filter(Category.type == 'saida').with_entities(
        Category.name, func.sum(Transaction.value).label('total')
    ).group_by(Category.name).all()
    total_despesas_dist = sum(item.total for item in distribuicao_query)
    distribuicao_data = [{'name': item.name, 'value': float(item.total), 'percentage': round((item.total / total_despesas_dist) * 100) if total_despesas_dist > 0 else 0} for item in distribuicao_query]
    cards = CreditCard.query.filter_by(user_id=user_id, is_active=True).all()
    cartoes_data = []
    for card in cards:
        gastos_query = db.session.query(func.sum(CreditCardTransaction.value)).filter(CreditCardTransaction.credit_card_id == card.id, CreditCardTransaction.date >= start_date, CreditCardTransaction.date <= end_date).scalar() or 0
        cartoes_data.append({'name': card.name, 'limit': card.limit, 'spent': float(gastos_query), 'available': card.limit - float(gastos_query)})
    current_month = datetime.now().month
    current_year = datetime.now().year
    orcamento_query = db.session.query(Planning).join(Category).filter(Planning.user_id == user_id, Category.type == 'saida', extract('month', Planning.date) == current_month, extract('year', Planning.date) == current_year).with_entities(Category.name, func.sum(Planning.value).label('total')).group_by(Category.name).all()
    orcamento_data = [{'category': item.name, 'budget': float(item.total)} for item in orcamento_query]


    # --- 8. Montar a Resposta Final (ATUALIZADA) ---
    response = {
        'summary': {
            'totalReceitas': float(total_receitas),
            'totalDespesas': float(total_despesas),
            'saldoLiquido': float(saldo_liquido),
            # ▼▼▼ DADOS ATUALIZADOS ▼▼▼
            'positiveMonths': positive_months_count,
            'totalMonths': total_months,
            'averageGrowth': average_growth,
            'highestSpendingMonth': highest_spending_month
        },
        'charts': {
            'cashFlow': final_evolucao,
            'categoryBreakdown': distribuicao_data,
            'creditCardUsage': cartoes_data,
            'budgetDistribution': orcamento_data
        }
    }
    return jsonify(response)

# ▼▼▼ SUBSTITUA A FUNÇÃO get_investment_performance_report PELA VERSÃO FINAL ABAIXO ▼▼▼

@reports_bp.route('/reports/investment-performance', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_investment_performance_report():
    """
    Endpoint dedicado para o relatório avançado de investimentos.
    Calcula a evolução HISTÓRICA do valor da carteira e a rentabilidade mês a mês.
    """
    # --- Interceptador para a requisição preflight de CORS ---
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,OPTIONS")
        return response

    # --- Lógica principal para a requisição GET ---
    user_id = get_jwt_identity()
    
    try:
        year = int(request.args.get('year', datetime.now().year))
        
        investments = Investment.query.filter_by(user_id=user_id).all()
        transactions = InvestmentTransaction.query.filter_by(user_id=user_id).all()

        report_data = []
        meses_pt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        year_suffix = str(year)[-2:]
        
        # Cache simples para preços históricos para evitar chamadas repetidas
        price_cache = {}

        for month_index in range(12):
            current_month = month_index + 1
            
            if current_month == 12:
                last_day_of_month = datetime(year, 12, 31).date()
            else:
                last_day_of_month = datetime(year, current_month + 1, 1).date() - timedelta(days=1)

            total_value_in_month = 0.0
            total_invested_in_month = 0.0

            for t in transactions:
                if t.date <= last_day_of_month:
                    if t.transaction_type == 'aporte':
                        total_invested_in_month += t.value
                    elif t.transaction_type == 'resgate':
                        total_invested_in_month -= t.value
            
            if total_invested_in_month == 0:
                for inv in investments:
                    if inv.purchase_date <= last_day_of_month:
                        total_invested_in_month += inv.initial_value

            for inv in investments:
                if inv.purchase_date <= last_day_of_month:
                    value_for_month = 0
                    if inv.expected_monthly_yield:
                        monthly_rate = inv.expected_monthly_yield / 100
                        months_passed = (last_day_of_month.year - inv.purchase_date.year) * 12 + last_day_of_month.month - inv.purchase_date.month
                        value_for_month = inv.initial_value * ((1 + monthly_rate) ** max(0, months_passed))
                    
                    # ▼▼▼ LÓGICA CORRIGIDA PARA ATIVOS DE RENDA VARIÁVEL ▼▼▼
                    elif inv.ticker:
                        cache_key = f"{inv.ticker}-{last_day_of_month}"
                        if cache_key in price_cache:
                            price_on_date = price_cache[cache_key]
                        else:
                            price_on_date = get_historical_stock_price(inv.ticker, last_day_of_month)
                            price_cache[cache_key] = price_on_date

                        if price_on_date:
                            value_for_month = price_on_date * inv.quantity
                        else:
                            # Fallback: Se não achar o preço do mês, usa o valor atual para não deixar um buraco no gráfico
                            value_for_month = inv.current_value
                    # ▲▲▲ FIM DA LÓGICA CORRIGIDA ▲▲▲
                    
                    else: # Fallback para investimentos sem ticker e sem rendimento
                        value_for_month = inv.current_value

                    total_value_in_month += value_for_month

            profitability = 0
            if total_invested_in_month > 0:
                profitability = ((total_value_in_month - total_invested_in_month) / total_invested_in_month) * 100

            report_data.append({
                'mes': f"{meses_pt[month_index]}/{year_suffix}",
                'valor': round(total_value_in_month, 2),
                'rentabilidade': round(profitability, 2)
            })

        return jsonify(report_data)

    except ValueError:
        return jsonify({"error": "Ano inválido"}), 400
    except Exception as e:
        print(f"Erro inesperado no relatório de investimentos: {e}")
        return jsonify({"error": "Ocorreu um erro interno ao gerar o relatório."}), 500

# ▼▼▼ ADICIONE ESTA NOVA ROTA AO FINAL DO ARQUIVO reports.py ▼▼▼

@reports_bp.route('/reports/goals-summary', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_goals_report():
    """
    Endpoint para fornecer um resumo e a lista de todas as metas do usuário.
    """
    # --- Interceptador para a requisição preflight de CORS ---
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,OPTIONS")
        return response

    # --- Lógica principal para a requisição GET ---
    user_id = get_jwt_identity()
    
    try:
        # Busca todas as metas ativas do usuário
        goals = Goal.query.filter_by(user_id=user_id, is_active=True).all()
        
        # --- Cálculos para o Resumo ---
        total_goals = len(goals)
        completed_goals = sum(1 for goal in goals if goal.is_completed)
        total_saved = sum(goal.current_value for goal in goals)
        total_target = sum(goal.target_value for goal in goals)
        
        # Calcula o progresso médio de todas as metas
        average_progress = 0
        if total_goals > 0:
            total_progress_sum = sum(goal.progress_percentage for goal in goals)
            average_progress = total_progress_sum / total_goals
            
        # Prepara a lista de metas para o frontend
        goals_list = [goal.to_dict() for goal in goals]

        # --- Monta a Resposta Final ---
        response_data = {
            'summary': {
                'totalGoals': total_goals,
                'completedGoals': completed_goals,
                'averageProgress': average_progress,
                'totalSaved': total_saved,
                'totalTarget': total_target
            },
            'goalsList': goals_list
        }
        
        return jsonify(response_data)

    except Exception as e:
        print(f"Erro inesperado no relatório de metas: {e}")
        return jsonify({"error": "Ocorreu um erro interno ao gerar o relatório de metas."}), 500