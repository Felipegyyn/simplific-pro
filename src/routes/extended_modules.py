from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User
from src.models.db import db
from src.models.financial import Category
from src.models.extended_modules import CreditCard, CreditCardTransaction, Goal, GoalContribution, Investment, ScheduleItem
from datetime import datetime, date, time
from dateutil.relativedelta import relativedelta

extended_bp = Blueprint('extended', __name__)

# ============ CREDIT CARDS ROUTES ============

@extended_bp.route('/api/credit-cards', methods=['GET'])
@jwt_required()
def get_credit_cards():
    try:
        user_id = get_jwt_identity()
        cards = CreditCard.query.filter_by(user_id=user_id, is_active=True).all()
        return jsonify([card.to_dict() for card in cards])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@extended_bp.route('/api/credit-cards', methods=['POST'])
@jwt_required()
def create_credit_card():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['name', 'limit', 'closing_day', 'due_day']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        if not (1 <= data['closing_day'] <= 31):
            return jsonify({'error': 'Dia de fechamento deve estar entre 1 e 31'}), 400
            
        if not (1 <= data['due_day'] <= 31):
            return jsonify({'error': 'Dia de vencimento deve estar entre 1 e 31'}), 400
        
        card = CreditCard(
            user_id=user_id,
            name=data['name'],
            limit=float(data['limit']),
            closing_day=int(data['closing_day']),
            due_day=int(data['due_day'])
        )
        
        db.session.add(card)
        db.session.commit()
        
        return jsonify(card.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@extended_bp.route('/api/credit-cards/<int:card_id>/balance', methods=['GET'])
@jwt_required()
def get_card_balance(card_id):
    try:
        user_id = get_jwt_identity()
        card = CreditCard.query.filter_by(id=card_id, user_id=user_id).first()
        
        if not card:
            return jsonify({'error': 'Cartão não encontrado'}), 404
        
        today = date.today()
        start_date = today - relativedelta(days=30)
        
        transactions = CreditCardTransaction.query.filter(
            CreditCardTransaction.credit_card_id == card_id,
            CreditCardTransaction.date >= start_date,
            CreditCardTransaction.date <= today
        ).all()
        
        current_balance = sum(t.value for t in transactions)
        available_limit = card.limit - current_balance
        
        return jsonify({
            'card_name': card.name,
            'limit': card.limit,
            'current_balance': current_balance,
            'available_limit': available_limit,
            'usage_percentage': (current_balance / card.limit * 100) if card.limit > 0 else 0
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ GOALS ROUTES ============

@extended_bp.route('/api/goals', methods=['GET'])
@jwt_required()
def get_goals():
    try:
        user_id = get_jwt_identity()
        is_active = request.args.get('is_active', 'true').lower() == 'true'
        category = request.args.get('category')
        
        query = Goal.query.filter_by(user_id=user_id, is_active=is_active)
        
        if category:
            query = query.filter_by(category=category)
        
        goals = query.order_by(Goal.created_at.desc()).all()
        return jsonify([goal.to_dict() for goal in goals])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@extended_bp.route('/api/goals', methods=['POST'])
@jwt_required()
def create_goal():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['name', 'target_value', 'category']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        valid_categories = ['saving', 'investment', 'purchase', 'debt']
        if data['category'] not in valid_categories:
            return jsonify({'error': f'Categoria deve ser uma de: {", ".join(valid_categories)}'}), 400
        
        goal = Goal(
            user_id=user_id,
            name=data['name'],
            description=data.get('description', ''),
            target_value=float(data['target_value']),
            current_value=float(data.get('current_value', 0)),
            target_date=datetime.strptime(data['target_date'], '%Y-%m-%d').date() if data.get('target_date') else None,
            category=data['category']
        )
        
        db.session.add(goal)
        db.session.commit()
        
        return jsonify(goal.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@extended_bp.route('/api/goals/<int:goal_id>/contributions', methods=['POST'])
@jwt_required()
def add_goal_contribution(goal_id):
    try:
        user_id = get_jwt_identity()
        goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
        
        if not goal:
            return jsonify({'error': 'Meta não encontrada'}), 404
        
        data = request.get_json()
        
        if 'value' not in data:
            return jsonify({'error': 'Campo value é obrigatório'}), 400
        
        contribution = GoalContribution(
            goal_id=goal_id,
            value=float(data['value']),
            description=data.get('description', ''),
            date=datetime.strptime(data['date'], '%Y-%m-%d').date() if data.get('date') else date.today()
        )
        
        goal.current_value += contribution.value
        
        db.session.add(contribution)
        db.session.commit()
        
        return jsonify(contribution.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ============ INVESTMENTS ROUTES ============

@extended_bp.route('/api/investments', methods=['GET'])
@jwt_required()
def get_investments():
    try:
        user_id = get_jwt_identity()
        is_active = request.args.get('is_active', 'true').lower() == 'true'
        investment_type = request.args.get('type')
        
        query = Investment.query.filter_by(user_id=user_id, is_active=is_active)
        
        if investment_type:
            query = query.filter_by(type=investment_type)
        
        investments = query.order_by(Investment.created_at.desc()).all()
        return jsonify([investment.to_dict() for investment in investments])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@extended_bp.route('/api/investments', methods=['POST'])
@jwt_required()
def create_investment():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['name', 'type', 'initial_value', 'current_value', 'purchase_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        valid_types = ['stock', 'fund', 'bond', 'crypto', 'savings']
        if data['type'] not in valid_types:
            return jsonify({'error': f'Tipo deve ser um de: {", ".join(valid_types)}'}), 400
        
        investment = Investment(
            user_id=user_id,
            name=data['name'],
            type=data['type'],
            initial_value=float(data['initial_value']),
            current_value=float(data['current_value']),
            quantity=float(data.get('quantity', 1.0)),
            purchase_date=datetime.strptime(data['purchase_date'], '%Y-%m-%d').date()
        )
        
        db.session.add(investment)
        db.session.commit()
        
        return jsonify(investment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@extended_bp.route('/api/investments/summary', methods=['GET'])
@jwt_required()
def get_investments_summary():
    try:
        user_id = get_jwt_identity()
        investments = Investment.query.filter_by(user_id=user_id, is_active=True).all()
        
        total_invested = sum(inv.initial_value for inv in investments)
        total_current = sum(inv.current_value for inv in investments)
        total_profit_loss = total_current - total_invested
        total_percentage = ((total_profit_loss / total_invested) * 100) if total_invested > 0 else 0
        
        by_type = {}
        for inv in investments:
            if inv.type not in by_type:
                by_type[inv.type] = {
                    'count': 0,
                    'total_invested': 0,
                    'total_current': 0,
                    'profit_loss': 0
                }
            by_type[inv.type]['count'] += 1
            by_type[inv.type]['total_invested'] += inv.initial_value
            by_type[inv.type]['total_current'] += inv.current_value
            by_type[inv.type]['profit_loss'] += inv.profit_loss
        
        return jsonify({
            'total_invested': total_invested,
            'total_current': total_current,
            'total_profit_loss': total_profit_loss,
            'total_percentage': total_percentage,
            'by_type': by_type,
            'count': len(investments)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ SCHEDULE ROUTES ============

@extended_bp.route('/api/schedule', methods=['GET'])
@jwt_required()
def get_schedule_items():
    try:
        user_id = get_jwt_identity()
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        item_type = request.args.get('type')
        is_completed = request.args.get('is_completed')
        
        query = ScheduleItem.query.filter_by(user_id=user_id)
        
        if start_date:
            query = query.filter(ScheduleItem.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
        if end_date:
            query = query.filter(ScheduleItem.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
        if item_type:
            query = query.filter_by(type=item_type)
        if is_completed is not None:
            query = query.filter_by(is_completed=is_completed.lower() == 'true')
        
        items = query.order_by(ScheduleItem.date.asc(), ScheduleItem.time.asc()).all()
        return jsonify([item.to_dict() for item in items])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@extended_bp.route('/api/schedule', methods=['POST'])
@jwt_required()
def create_schedule_item():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['title', 'date', 'type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        valid_types = ['payment', 'income', 'reminder', 'meeting']
        if data['type'] not in valid_types:
            return jsonify({'error': f'Tipo deve ser um de: {", ".join(valid_types)}'}), 400
        
        valid_priorities = ['low', 'medium', 'high']
        priority = data.get('priority', 'medium')
        if priority not in valid_priorities:
            return jsonify({'error': f'Prioridade deve ser uma de: {", ".join(valid_priorities)}'}), 400
        
        item = ScheduleItem(
            user_id=user_id,
            title=data['title'],
            description=data.get('description', ''),
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            time=datetime.strptime(data['time'], '%H:%M').time() if data.get('time') else None,
            type=data['type'],
            priority=priority,
            is_recurring=bool(data.get('is_recurring', False)),
            recurring_type=data.get('recurring_type')
        )
        
        db.session.add(item)
        db.session.commit()
        
        return jsonify(item.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@extended_bp.route('/api/schedule/<int:item_id>/complete', methods=['PUT'])
@jwt_required()
def complete_schedule_item(item_id):
    try:
        user_id = get_jwt_identity()
        item = ScheduleItem.query.filter_by(id=item_id, user_id=user_id).first()
        
        if not item:
            return jsonify({'error': 'Item não encontrado'}), 404
        
        item.is_completed = True
        db.session.commit()
        
        return jsonify(item.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ============ DASHBOARD DATA ROUTES ============

@extended_bp.route('/api/dashboard/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    try:
        user_id = get_jwt_identity()
        year = request.args.get('year', str(date.today().year))
        month = request.args.get('month')
        
        # Buscar dados dos módulos existentes
        from src.models.financial import Transaction, Planning
        
        # Filtros de data
        start_date = date(int(year), 1, 1)
        end_date = date(int(year), 12, 31)
        
        if month and month != 'all':
            start_date = date(int(year), int(month), 1)
            if int(month) == 12:
                end_date = date(int(year) + 1, 1, 1) - relativedelta(days=1)
            else:
                end_date = date(int(year), int(month) + 1, 1) - relativedelta(days=1)
        
        # Transações
        transactions = Transaction.query.filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).all()
        
        # Planejamentos
        plannings = Planning.query.filter(
            Planning.user_id == user_id,
            Planning.date >= start_date,
            Planning.date <= end_date
        ).all()
        
        # Metas
        goals = Goal.query.filter_by(user_id=user_id, is_active=True).all()
        
        # Investimentos
        investments = Investment.query.filter_by(user_id=user_id, is_active=True).all()
        
        # Calcular resumo
        entradas = sum(t.value for t in transactions if t.type == 'entrada' and t.status == 'confirmado')
        saidas = sum(t.value for t in transactions if t.type == 'saida' and t.status == 'confirmado')
        saldo = entradas - saidas
        
        entradas_pendentes = sum(t.value for t in transactions if t.type == 'entrada' and t.status == 'a_confirmar')
        saidas_pendentes = sum(t.value for t in transactions if t.type == 'saida' and t.status == 'a_confirmar')
        
        planejado = sum(p.value for p in plannings)
        diferenca = entradas - planejado
        
        # Metas
        total_metas = len(goals)
        metas_concluidas = len([g for g in goals if g.is_completed])
        percentual_metas = (metas_concluidas / total_metas * 100) if total_metas > 0 else 0
        
        # Investimentos
        total_investido = sum(inv.initial_value for inv in investments)
        valor_atual_investimentos = sum(inv.current_value for inv in investments)
        rentabilidade = ((valor_atual_investimentos - total_investido) / total_investido * 100) if total_investido > 0 else 0
        
        return jsonify({
            'realizado': {
                'entradas': entradas,
                'saidas': saidas,
                'saldo': saldo
            },
            'pendente': {
                'entradas': entradas_pendentes,
                'saidas': saidas_pendentes
            },
            'planejado_vs_realizado': {
                'planejado': planejado,
                'realizado': entradas,
                'diferenca': diferenca
            },
            'metas': {
                'total': total_metas,
                'concluidas': metas_concluidas,
                'percentual': percentual_metas
            },
            'investimentos': {
                'total_investido': total_investido,
                'valor_atual': valor_atual_investimentos,
                'rentabilidade': rentabilidade
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

