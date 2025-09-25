from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
import os
import json

# Dados sensíveis do .env
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_NUMBER = 'whatsapp:+551151991373'  # Número da Sandbox Twilio

print(f"TWILIO_ACCOUNT_SID: {TWILIO_ACCOUNT_SID}")
print(f"TWILIO_AUTH_TOKEN: {TWILIO_AUTH_TOKEN}")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

template_sids = {
    'fatura_vencimento': 'HX384e84bc397b025b985286e22fd8cbe4',
    'planejamento_extrapolado': 'HX678b082253a03d42ceb842b2b703b5c3',
    'resumo_faturas': 'HX1e16cbb43cd749b1a3ec72fa3d461972',
    'resumo_lancamentos': 'HXed924fd8d2f7be3bc9bb1caaf70ffe47',
    'welcome_simplific': 'HX5be9120897732c8cbf75e0cafb5c4fca',
    'resumo_semanal_v1':'HXe2c234ee0d58afc0c299b880fa01c3c4'
}


def send_whatsapp_template(to, template_sid, content_variables):

    try:
        message = client.messages.create(
            messaging_service_sid='MG0cb0fe1e4cb5252f4fcad89e42d9d589',
            to=to,
            content_sid=template_sid,
            content_variables=json.dumps(content_variables)
        )

        if hasattr(message, 'error_code') and message.error_code is not None:
            return {
                'status': 'error',
                'error_code': message.error_code,
                'error_message': message.error_message
            }

        return {'status': 'success', 'sid': message.sid}

    except Exception as e:
        return {'status': 'error', 'message': str(e)}


# ADICIONAR ABAIXO:
user_sessions = {}

# ===========================
# Gerenciamento de Sessões
# ===========================

def salvar_sessao(numero_usuario, dados):
    user_sessions[numero_usuario] = dados

def buscar_sessao(numero_usuario):
    return user_sessions.get(numero_usuario, None)

def remover_sessao(numero_usuario):
    if numero_usuario in user_sessions:
        del user_sessions[numero_usuario]

def send_whatsapp_message(to, body):
    """
    Envia uma mensagem de texto livre para um número do WhatsApp.
    IMPORTANTE: Só funciona se o usuário tiver interagido nas últimas 24 horas.
    """
    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER]):
        print("ERRO: Credenciais da Twilio não configuradas para envio de mensagem.")
        return {'status': 'error', 'message': 'Credenciais da Twilio ausentes.'}

    try:
        message = client.messages.create(
            from_=TWILIO_WHATSAPP_NUMBER,
            body=body,
            to=to
        )
        print(f"Mensagem de lembrete enviada com SID: {message.sid}")
        return {'status': 'success', 'sid': message.sid}
    except Exception as e:
        print(f"Erro ao enviar mensagem via Twilio: {e}")
        return {'status': 'error', 'message': str(e)}

