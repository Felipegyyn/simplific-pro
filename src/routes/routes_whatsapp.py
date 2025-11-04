# src/routes/routes_whatsapp.py

import re
from flask import Blueprint, request, current_app
from twilio.twiml.messaging_response import MessagingResponse
from src.models.user import User
from src.services.whatsapp_service import remover_sessao
from src.services.transcription_service import transcrever_audio_de_url

# O "pulo do gato": Importamos nossa nova tarefa
from src.tasks import processar_mensagem_whatsapp_task

whatsapp_bp = Blueprint('whatsapp', __name__)


@whatsapp_bp.route('/receive_whatsapp', methods=['POST'])
def receive_message():
    """
    Função coração do webhook.
    Agora ela é RÁPIDA. Ela apenas coleta os dados, valida e
    "despacha" a tarefa para o Celery Worker.
    """
    # 1. Coleta de dados
    incoming_msg_text = request.values.get('Body', '').strip()
    media_url = request.values.get('MediaUrl0', None)
    media_type = request.values.get('MediaContentType0', '')
    from_number = request.values.get('From', '')

    # 2. Transcrição (tarefa rápida)
    is_incoming_audio = media_url and 'audio' in media_type
    mensagem_processada = incoming_msg_text

    if is_incoming_audio:
        texto_transcrito = transcrever_audio_de_url(media_url)
        if texto_transcrito:
            mensagem_processada = texto_transcrito
        else:
            resp = MessagingResponse()
            resp.message("Não consegui entender o que você disse no áudio. Pode tentar de novo? 🤔")
            return str(resp)

    if not mensagem_processada:
        return str(MessagingResponse()) # Retorno rápido

    # 3. Lógica de "cancelar" (rápida)
    if mensagem_processada.lower().strip() == 'cancelar':
        remover_sessao(from_number)
        resp = MessagingResponse()
        resp.message("Ok! Ação anterior cancelada. 👋\nEm que posso te ajudar agora?")
        return str(resp) # Retorno rápido

    # 4. Validação do usuário (rápida)
    numero_normalizado = normalizar_numero(from_number)
    usuario = User.query.filter_by(whatsapp=numero_normalizado).first()

    if not usuario:
        resp = MessagingResponse()
        resp.message('Opa! 📲 Não encontrei seu número em nossa base. Verifique se o número está cadastrado corretamente no seu perfil do Simplific Pro.')
        return str(resp) # Retorno rápido
    
    if usuario.status != 'ativo':
        resp = MessagingResponse()
        resp.message("Sua conta Simplific Pro está inativa. Para reativá-la, por favor, acesse a plataforma ou entre em contato com o suporte.")
        return str(resp) # Retorno rápido
        
    # --- A GRANDE MUDANÇA ---
    # 5. Despacha a tarefa para o Celery (em vez de um thread)
    # Passamos o usuario.id (simples) em vez do objeto (complexo)
    processar_mensagem_whatsapp_task.delay(
        from_number, 
        mensagem_processada, 
        usuario.id
    )

    # 6. Retorna o TwiML vazio IMEDIATAMENTE para a Twilio
    resp = MessagingResponse()
    return str(resp)


def normalizar_numero(numero):
    """
    Normaliza o número de telefone para o padrão E.164 (+55119XXXXXXXX).
    (Esta função permanece aqui pois é usada pela rota)
    """
    numero_limpo = re.sub(r'\D', '', numero)
    if len(numero_limpo) == 13 and numero_limpo.startswith('55'): return f'+{numero_limpo}'
    if len(numero_limpo) == 12 and numero_limpo.startswith('55'):
        ddd = numero_limpo[2:4]; resto = numero_limpo[4:]
        return f'+55{ddd}9{resto}'
    if len(numero_limpo) <= 11: return f'+55{numero_limpo}'
    return f'+{numero_limpo}'