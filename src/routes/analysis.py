# src/routes/analysis.py

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import func, extract

from src.models.db import db
from src.models.user import User
from src.models.financial import Transaction, Category, Planning
from src.routes.user import active_user_required

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/analysis/dre', methods=['GET'])
@jwt_required()
@active_user_required
def get_dre_report():
    """
    Gera um relatório de Demonstração do Resultado do Exercício (DRE)
    para um determinado ano e mês.
    """
    user_id = get_jwt_identity()
    
    try:
        # Pega os filtros da URL. Se não forem fornecidos, usa o ano e mês atuais.
        year = int(request.args.get('year', datetime.now().year))
        month = int(request.args.get('month', datetime.now().month))
    except (ValueError, TypeError):
        return jsonify({'error': 'Parâmetros de ano/mês inválidos'}), 400

    # 1. Busca todas as transações confirmadas para o período
    transactions = db.session.query(
        Transaction.value,
        Category.type,
        Category.name.label('category_name')
    ).join(Category).filter(
        Transaction.user_id == user_id,
        Transaction.status == 'confirmada',
        extract('year', Transaction.date) == year,
        extract('month', Transaction.date) == month
    ).all()

    # 2. Processa os dados para a estrutura da DRE
    total_receitas = 0
    receitas_por_categoria = {}
    total_despesas = 0
    despesas_por_categoria = {}

    for t in transactions:
        if t.type == 'entrada':
            total_receitas += t.value
            receitas_por_categoria[t.category_name] = receitas_por_categoria.get(t.category_name, 0) + t.value
        elif t.type == 'saida':
            total_despesas += t.value
            despesas_por_categoria[t.category_name] = despesas_por_categoria.get(t.category_name, 0) + t.value
            
    resultado_liquido = total_receitas - total_despesas

    # 3. Monta a resposta final no formato que o frontend vai precisar
    response_data = {
        'summary': {
            'total_receitas': float(total_receitas),
            'total_despesas': float(total_despesas),
            'resultado_liquido': float(resultado_liquido)
        },
        'details': {
            'receitas': [{'category': name, 'value': float(value)} for name, value in receitas_por_categoria.items()],
            'despesas': [{'category': name, 'value': float(value)} for name, value in despesas_por_categoria.items()]
        }
    }
    
    return jsonify(response_data)

# Em src/routes/analysis.py, cole este bloco no final do arquivo

@analysis_bp.route('/analysis/cash-flow', methods=['GET'])
@jwt_required()
@active_user_required
def get_cash_flow_report():
    """
    Gera um relatório de Fluxo de Caixa Analítico (Planejado vs. Realizado)
    para um ano específico, agrupado por categoria e mês.
    """
    user_id = get_jwt_identity()

    try:
        year = int(request.args.get('year', datetime.now().year))
        # O tipo do relatório (entrada/saida) pode ser um filtro futuro
        report_type = request.args.get('type', 'saida') 
    except (ValueError, TypeError):
        return jsonify({'error': 'Parâmetro de ano inválido'}), 400

    # 1. Query para buscar dados PLANEJADOS
    planned_data = db.session.query(
        Category.name.label('category_name'),
        extract('month', Planning.date).label('month'),
        func.sum(Planning.value).label('total_planned')
    ).join(Category).filter(
        Planning.user_id == user_id,
        Planning.type == report_type,
        extract('year', Planning.date) == year
    ).group_by(Category.name, extract('month', Planning.date)).all()

    # 2. Query para buscar dados REALIZADOS (transações confirmadas)
    realized_data = db.session.query(
        Category.name.label('category_name'),
        extract('month', Transaction.date).label('month'),
        func.sum(Transaction.value).label('total_realized')
    ).join(Category).filter(
        Transaction.user_id == user_id,
        Transaction.status == 'confirmada',
        Transaction.type == report_type,
        extract('year', Transaction.date) == year
    ).group_by(Category.name, extract('month', Transaction.date)).all()

    # 3. Consolida os dados em uma estrutura fácil para o frontend
    analysis_data = {}

    for row in planned_data:
        category = row.category_name
        month = int(row.month)
        if category not in analysis_data:
            analysis_data[category] = [{'month': i, 'planned': 0, 'realized': 0} for i in range(1, 13)]
        analysis_data[category][month - 1]['planned'] = float(row.total_planned)

    for row in realized_data:
        category = row.category_name
        month = int(row.month)
        if category not in analysis_data:
            # Caso uma categoria tenha gastos mas não planejamento
            analysis_data[category] = [{'month': i, 'planned': 0, 'realized': 0} for i in range(1, 13)]
        analysis_data[category][month - 1]['realized'] = float(row.total_realized)

    # 4. Formata a resposta final
    response = [
        {'category': category, 'monthly_data': monthly_data}
        for category, monthly_data in analysis_data.items()
    ]

    return jsonify(response)