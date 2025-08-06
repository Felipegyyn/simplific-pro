# scheduler.py
from datetime import date, timedelta, datetime
from src.models.extended import ScheduleEvent
from src.models.user import User
# Importa a nossa nova ferramenta de envio de mensagens
from src.services.whatsapp_service import send_whatsapp_message 

def check_and_send_reminders(app):
    """
    Esta é a função principal do nosso "vigilante". Ela será executada
    periodicamente para verificar e enviar lembretes da agenda.
    """
    with app.app_context():
        print(f"--- [SCHEDULER] Executando verificação de lembretes em {datetime.now()} ---")
        
        hoje = date.today()
        amanha = hoje + timedelta(days=1)

        # 1. Busca eventos para HOJE
        eventos_de_hoje = ScheduleEvent.query.filter_by(date=hoje, is_completed=False).all()
        for evento in eventos_de_hoje:
            usuario = User.query.get(evento.user_id)
            if usuario and usuario.whatsapp:
                mensagem = f"🔔 *Lembrete para hoje:* {evento.title} às {evento.time}!"
                print(f"Enviando lembrete de HOJE para {usuario.whatsapp}: {mensagem}")
                send_whatsapp_message(f'whatsapp:{usuario.whatsapp}', mensagem)

        # 2. Busca eventos para AMANHÃ
        eventos_de_amanha = ScheduleEvent.query.filter_by(date=amanha, is_completed=False).all()
        for evento in eventos_de_amanha:
            usuario = User.query.get(evento.user_id)
            if usuario and usuario.whatsapp:
                mensagem = f"🗓️ *Lembrete para amanhã:* {evento.title} às {evento.time}."
                print(f"Enviando lembrete de AMANHÃ para {usuario.whatsapp}: {mensagem}")
                send_whatsapp_message(f'whatsapp:{usuario.whatsapp}', mensagem)

        print("--- [SCHEDULER] Verificação de lembretes concluída. ---")

# Esta parte permite que o script seja executado manualmente para testes
if __name__ == '__main__':
    check_and_send_reminders()


