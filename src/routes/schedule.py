from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.routes.user import active_user_required
from datetime import datetime
from src.models.db import db
from src.models.extended import ScheduleEvent

schedule_bp = Blueprint('schedule', __name__)

@schedule_bp.route('/schedule', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_schedule_events():
    user_id = get_jwt_identity()
    events = ScheduleEvent.query.filter_by(user_id=user_id).all()
    return jsonify([event.to_dict() for event in events])

# ▼▼▼ SUBSTITUA A FUNÇÃO create_schedule_event POR ESTA ▼▼▼

@schedule_bp.route('/schedule', methods=['POST'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def create_schedule_event():
    user_id = get_jwt_identity()
    data = request.json

    # 1. Captura todos os campos do formulário (com os nomes corretos)
    title = data.get('title')
    description = data.get('description')
    date_str = data.get('event_date') # <-- Corrigido de 'date' para 'event_date'
    time_str = data.get('event_time')
    event_type = data.get('type')
    priority = data.get('priority')
    amount = data.get('amount')
    category = data.get('category')

    # 2. Validação mais completa
    if not title or not date_str or not event_type:
        return jsonify({'error': 'Título, data e tipo são obrigatórios'}), 400

    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Data inválida'}), 400

    # 3. Cria o objeto ScheduleEvent com todos os campos
    # (É crucial que o seu modelo `ScheduleEvent` no banco de dados tenha essas colunas)
    event = ScheduleEvent(
        user_id=user_id,
        title=title,
        description=description,
        date=date,
        time=time_str,
        type=event_type,
        priority=priority,
        value=float(amount) if amount else None, # Salva o valor (amount) se ele existir
        category=category
    )

    db.session.add(event)
    db.session.commit()

    # Adicionei um 'success: True' para alinhar com a checagem no frontend
    return jsonify({'success': True, 'event': event.to_dict()}), 201

# ▼▼▼ SUBSTITUA A FUNÇÃO update_schedule_event PELA VERSÃO ABAIXO ▼▼▼
@schedule_bp.route('/schedule/<int:event_id>', methods=['PUT'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def update_schedule_event(event_id):
    user_id = get_jwt_identity()
    event = ScheduleEvent.query.filter_by(id=event_id, user_id=user_id).first()

    if not event:
        return jsonify({'error': 'Evento não encontrado'}), 404

    data = request.json
    
    # Lógica de atualização flexível
    if 'title' in data:
        event.title = data['title']
    if 'description' in data:
        event.description = data['description']
    if 'event_date' in data:
        try:
            event.date = datetime.strptime(data['event_date'], '%Y-%m-%d').date()
        except (ValueError, TypeError):
            return jsonify({'error': 'Formato de data inválido'}), 400
    if 'event_time' in data:
        event.time = data['event_time']
    if 'type' in data:
        event.type = data['type']
    if 'priority' in data:
        event.priority = data['priority']
    if 'amount' in data:
        event.value = float(data['amount']) if data['amount'] is not None else None
    if 'category' in data:
        event.category = data['category']
    if 'status' in data and data['status'] == 'concluido':
        event.is_completed = True
    
    db.session.commit()
    return jsonify(event.to_dict()), 200

@schedule_bp.route('/schedule/<int:event_id>', methods=['DELETE'])
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
