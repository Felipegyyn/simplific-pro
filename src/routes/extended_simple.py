from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from src.models.user import User
from src.models.db import db
from src.models.financial import Category
from src.routes.user import active_user_required
from src.models.extended import Goal, ScheduleEvent
from src.models.extended_modules import CreditCard, CreditCardTransaction


extended_bp = Blueprint('extended', __name__)

# ============ GOALS ROUTES ============

@extended_bp.route('/goals', methods=['GET', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_goals():
    user_id = get_jwt_identity()
    goals = Goal.query.filter_by(user_id=user_id).all()
    return jsonify([goal.to_dict() for goal in goals])

@extended_bp.route('/goals', methods=['POST', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def create_goal():
    user_id = get_jwt_identity()
    data = request.json

    name = data.get('name')
    target_value = data.get('target_value')
    current_value = data.get('current_value', 0.0)
    target_date_str = data.get('target_date')

    if not name or not target_value or not target_date_str:
        return jsonify({'error': 'Nome, valor alvo e data alvo são obrigatórios'}), 400

    try:
        target_value = float(target_value)
        current_value = float(current_value)
        target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Valor ou data inválidos'}), 400

    goal = Goal(
        user_id=user_id,
        name=name,
        target_value=target_value,
        current_value=current_value,
        target_date=target_date,
        created_at=datetime.utcnow()
    )

    db.session.add(goal)
    db.session.commit()

    return jsonify(goal.to_dict()), 201

@extended_bp.route('/goals/<int:goal_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def delete_goal(goal_id):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()

    if not goal:
        return jsonify({'error': 'Meta não encontrada'}), 404

    db.session.delete(goal)
    db.session.commit()

    return '', 204

# ============ CREDIT CARDS ROUTES ============

@extended_bp.route('/credit-cards', methods=['GET', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_credit_cards():
    user_id = get_jwt_identity()
    cards = CreditCard.query.filter_by(user_id=user_id).all()
    return jsonify([card.to_dict() for card in cards])

@extended_bp.route('/credit-cards', methods=['POST', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def create_credit_card():
    user_id = get_jwt_identity()
    data = request.json

    name = data.get('name')
    limit_value = data.get('limit_value')
    closing_day = data.get('closing_day')
    due_day = data.get('due_day')

    if not name or not limit_value or not closing_day or not due_day:
        return jsonify({'error': 'Todos os campos obrigatórios devem ser preenchidos'}), 400

    try:
        limit_value = float(limit_value)
        closing_day = int(closing_day)
        due_day = int(due_day)
    except ValueError:
        return jsonify({'error': 'Valores inválidos'}), 400

    card = CreditCard(
        user_id=user_id,
        name=name,
        limit_value=limit_value,
        current_limit=limit_value,  # inicialmente, o limite atual é o total
        closing_day=closing_day,
        due_day=due_day,
        created_at=datetime.utcnow()
    )

    db.session.add(card)
    db.session.commit()

    return jsonify(card.to_dict()), 201

@extended_bp.route('/credit-cards/<int:card_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def delete_credit_card(card_id):
    user_id = get_jwt_identity()
    card = CreditCard.query.filter_by(id=card_id, user_id=user_id).first()

    if not card:
        return jsonify({'error': 'Cartão não encontrado'}), 404

    db.session.delete(card)
    db.session.commit()

    return '', 204

# ============ CREDIT CARD TRANSACTIONS ROUTES ============

@extended_bp.route('/credit-cards/<int:card_id>/transactions', methods=['GET', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_credit_card_transactions(card_id):
    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()

    card = CreditCard.query.filter_by(id=card_id, user_id=user_id).first()
    if not card:
        return jsonify({'error': 'Cartão não encontrado'}), 404

    transactions = CreditCardTransaction.query.filter_by(credit_card_id=card_id).all()
    return jsonify([tx.to_dict() for tx in transactions])

@extended_bp.route('/credit-cards/<int:card_id>/transactions', methods=['POST', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def create_credit_card_transaction(card_id):
    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()
    card = CreditCard.query.filter_by(id=card_id, user_id=user_id).first()

    if not card:
        return jsonify({'error': 'Cartão não encontrado'}), 404

    data = request.json

    description = data.get('description')
    value = data.get('value')
    date_str = data.get('date')
    category_id = data.get('category_id')

    if not description or not value or not date_str or not category_id:
        return jsonify({'error': 'Descrição, valor, data e categoria são obrigatórios'}), 400

    try:
        value = float(value)
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Valor ou data inválidos'}), 400

    # Update card current limit
    if card.available_limit - value < 0:
        return jsonify({'error': 'Limite insuficiente no cartão'}), 400

    card.available_limit -= value

    tx = CreditCardTransaction(
        credit_card_id=card.id,
        user_id=user_id,
        category_id=category_id,
        description=description,
        value=value,
        date=date,
        created_at=datetime.utcnow()
    )

    db.session.add(tx)
    db.session.commit()

    return jsonify(tx.to_dict()), 201

# ============ SCHEDULE ROUTES ============

@extended_bp.route('/schedule', methods=['GET', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_schedule_events():
    user_id = get_jwt_identity()
    events = ScheduleEvent.query.filter_by(user_id=user_id).order_by(ScheduleEvent.date.asc()).all()
    return jsonify([event.to_dict() for event in events])

@extended_bp.route('/schedule', methods=['POST', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def create_schedule_event():
    user_id = get_jwt_identity()
    data = request.json

    title = data.get('title')
    description = data.get('description', '')
    date_str = data.get('date')
    time_str = data.get('time')
    type = data.get('type')
    priority = data.get('priority', 'medium')

    if not title or not date_str or not type:
        return jsonify({'error': 'Título, data e tipo são obrigatórios'}), 400

    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Data inválida'}), 400

    event = ScheduleEvent(
        user_id=user_id,
        title=title,
        description=description,
        date=date,
        time=time_str,
        type=type,
        priority=priority,
        created_at=datetime.utcnow()
    )

    db.session.add(event)
    db.session.commit()

    return jsonify(event.to_dict()), 201

@extended_bp.route('/schedule/<int:event_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def delete_schedule_event(event_id):
    user_id = get_jwt_identity()
    event = ScheduleEvent.query.filter_by(id=event_id, user_id=user_id).first()

    if not event:
        return jsonify({'error': 'Evento não encontrado'}), 404

    db.session.delete(event)
    db.session.commit()

    return '', 204



