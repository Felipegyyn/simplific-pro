from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.routes.user import active_user_required
from datetime import datetime, timedelta
from src.models.db import db
from src.models.extended import ScheduleEvent
from src.models.user import User
from flask import redirect, url_for
from src.services.google_calendar_service import get_google_auth_flow, add_event_to_google, delete_event_from_google
import os

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

    # ▼▼▼ INTEGRAÇÃO GOOGLE ▼▼▼
    # Tenta sincronizar com o Google se o usuário tiver token
    user = User.query.get(user_id)
    if user.google_calendar_token:
        print("Sincronizando com Google Calendar...")
        
        google_id = add_event_to_google(
        user, 
        event, 
        attendee_email=attendee_email, 
        create_meet=create_meet
    )
    # ------------------------

        
        if google_id:
            event.google_event_id = google_id
            db.session.commit()
    # ▲▲▲ FIM INTEGRAÇÃO ▲▲▲

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

    if event.google_event_id:
        user = User.query.get(user_id)
        delete_event_from_google(user, event.google_event_id)

    db.session.delete(event)
    db.session.commit()

    return '', 204


# --- ROTAS DE AUTENTICAÇÃO GOOGLE ---

@schedule_bp.route('/schedule/google/auth', methods=['GET'])
@jwt_required()
def google_auth():
    """Inicia o fluxo de login com o Google."""
    user_id = get_jwt_identity()

    # Cria o fluxo
    flow = get_google_auth_flow()

    # Gera a URL de autorização
    # state=user_id passa o ID do usuário para sabermos quem é na volta
    authorization_url, state = flow.authorization_url(
        access_type='offline',      # Pede acesso para quando user estiver offline
        prompt='consent',           # <--- OBRIGATÓRIO: Força o Google a gerar o Refresh Token
        include_granted_scopes='true',
        state=str(user_id) 
    )

    return jsonify({'auth_url': authorization_url})

@schedule_bp.route('/schedule/google/callback', methods=['GET'])
def google_callback():
    """Recebe o usuário de volta do Google com o código."""
    code = request.args.get('code')
    state = request.args.get('state') # Este é o user_id que passamos antes

    if not code or not state:
        return "Erro: Código ou estado ausente.", 400

    try:
        # Troca o código por tokens
        flow = get_google_auth_flow()
        flow.fetch_token(code=code)
        credentials = flow.credentials

        # Salva no banco
        user = User.query.get(int(state))
        if user:
            user.google_calendar_token = credentials.token
            user.google_calendar_refresh_token = credentials.refresh_token
            db.session.commit()

            # Redireciona de volta para o Frontend
            frontend_url = os.getenv("FRONTEND_URL", "https://simplificpro.com")
            return redirect(f"{frontend_url}/#/schedule?google_connected=success")

        return "Usuário não encontrado.", 404

    except Exception as e:
        print(f"Erro no callback do Google: {e}")
        return f"Erro na integração: {str(e)}", 500

# Em src/routes/schedule.py

# ... (outras rotas) ...

@schedule_bp.route('/schedule/feed/<int:user_id>/calendar.ics')
def calendar_feed(user_id):
    """Gera um arquivo ICS compatível com Apple/Outlook."""
    from src.models.extended import ScheduleEvent
    from datetime import datetime
    
    events = ScheduleEvent.query.filter_by(user_id=user_id).all()
    
    # Cabeçalho do arquivo ICS
    ics_content = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Simplific Pro//Finance Schedule//PT",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:Simplific Financeiro",
        "X-WR-TIMEZONE:America/Sao_Paulo",
    ]
    
    for event in events:
        # Formata data (DTSTART/DTEND) para YYYYMMDDTHHMMSS
        # Ajuste simples assumindo que event.date e event.time existem
        start_dt = datetime.combine(event.date, datetime.strptime(event.time, "%H:%M").time())
        end_dt = start_dt + timedelta(hours=1)
        
        ics_content.append("BEGIN:VEVENT")
        ics_content.append(f"UID:simplific-{event.id}@simplificpro.com")
        ics_content.append(f"DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}")
        ics_content.append(f"DTSTART:{start_dt.strftime('%Y%m%dT%H%M%S')}")
        ics_content.append(f"DTEND:{end_dt.strftime('%Y%m%dT%H%M%S')}")
        ics_content.append(f"SUMMARY:[Simplific] {event.title}")
        ics_content.append(f"DESCRIPTION:{event.description or ''}")
        ics_content.append("END:VEVENT")
        
    ics_content.append("END:VCALENDAR")
    
    return "\n".join(ics_content), 200, {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="simplific.ics"'
    }
