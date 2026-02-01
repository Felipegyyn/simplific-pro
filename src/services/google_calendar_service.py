import os
import datetime
import uuid # <--- NOVO IMPORT
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from flask import url_for

# Configurações
SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_google_auth_flow(redirect_uri=None):
    """Cria o fluxo de autenticação OAuth2."""
    client_config = {
        "web": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }
    
    if not redirect_uri:
        base_url = os.getenv("BASE_URL", "https://simplific-pro-backend.onrender.com")
        redirect_uri = f"{base_url}/api/schedule/google/callback"

    return Flow.from_client_config(
        client_config=client_config,
        scopes=SCOPES,
        redirect_uri=redirect_uri
    )

def get_calendar_service(user):
    """Constrói o serviço da API do Calendar usando os tokens do usuário."""
    if not user.google_calendar_token:
        return None

    creds = Credentials(
        token=user.google_calendar_token,
        refresh_token=user.google_calendar_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        scopes=SCOPES
    )

    return build('calendar', 'v3', credentials=creds)

# --- FUNÇÃO ATUALIZADA COM MEET E CONVIDADOS ---
def add_event_to_google(user, schedule_event, attendee_email=None, create_meet=False):
    """
    Envia um evento do Simplific para o Google Calendar.
    Args:
        attendee_email (str): Email do convidado (opcional). O Google enviará o convite.
        create_meet (bool): Se True, gera um link do Google Meet.
    """
    service = get_calendar_service(user)
    if not service:
        return None

    # Formata a data e hora (ISO 8601)
    start_datetime_str = f"{schedule_event.date}T{schedule_event.time}:00"
    
    try:
        start_dt = datetime.datetime.strptime(start_datetime_str, "%Y-%m-%dT%H:%M:%S")
    except ValueError:
        # Fallback caso venha com formato diferente
        return None

    end_dt = start_dt + datetime.timedelta(hours=1)
    
    event_body = {
        'summary': f"[Simplific] {schedule_event.title}",
        'description': schedule_event.description or "",
        'start': {
            'dateTime': start_dt.isoformat(),
            'timeZone': 'America/Sao_Paulo',
        },
        'end': {
            'dateTime': end_dt.isoformat(),
            'timeZone': 'America/Sao_Paulo',
        },
        'reminders': {
            'useDefault': False,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 30},
            ],
        },
        'colorId': '2' if schedule_event.type == 'pagamento' else '10'
    }

    # 1. Adicionar Convidado (Dispara e-mail nativo do Google)
    if attendee_email:
        event_body['attendees'] = [{'email': attendee_email}]

    # 2. Configurar Google Meet
    if create_meet:
        event_body['conferenceData'] = {
            'createRequest': {
                'requestId': str(uuid.uuid4()), # ID único para a requisição
                'conferenceSolutionKey': {'type': 'hangoutsMeet'}
            }
        }

    try:
        # conferenceDataVersion=1 é OBRIGATÓRIO para criar o Meet
        event = service.events().insert(
            calendarId='primary', 
            body=event_body,
            conferenceDataVersion=1 
        ).execute()
        
        # Extrai o link do Meet (se foi criado)
        meet_link = event.get('hangoutLink')
        
        # Retorna um dicionário com ID e Link
        return {
            'id': event.get('id'),
            'meet_link': meet_link
        }

    except Exception as e:
        print(f"Erro ao criar evento no Google: {e}")
        return None

def delete_event_from_google(user, google_event_id):
    """Remove um evento do Google Calendar."""
    service = get_calendar_service(user)
    if not service or not google_event_id:
        return

    try:
        service.events().delete(calendarId='primary', eventId=google_event_id).execute()
    except Exception as e:
        print(f"Erro ao deletar evento do Google: {e}")