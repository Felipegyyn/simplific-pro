# scheduler.py
from datetime import date, timedelta, datetime
from src.models.extended import ScheduleEvent
from src.models.user import User
from src.services.whatsapp_service import send_whatsapp_message 
# Importe a nossa função de formatação de moeda para usar aqui também
from src.services.transacoes_service import format_currency_brl

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
                
                # --- LÓGICA DE MENSAGEM INTELIGENTE (INÍCIO) ---
                mensagem_base = f"🔔 *Lembrete para hoje:* {evento.title}"
                if evento.time:
                    mensagem_base += f" às {evento.time}"
                
                # Se for um pagamento e tiver valor, adiciona o valor à mensagem
                if evento.type == 'pagamento' and evento.value:
                    valor_formatado = format_currency_brl(evento.value)
                    mensagem = f"{mensagem_base} no valor de *{valor_formatado}*!"
                else:
                    mensagem = f"{mensagem_base}!"
                # --- LÓGICA DE MENSAGEM INTELIGENTE (FIM) ---
                
                print(f"Enviando lembrete de HOJE para {usuario.whatsapp}: {mensagem}")
                send_whatsapp_message(f'whatsapp:{usuario.whatsapp}', mensagem)

        # 2. Busca eventos para AMANHÃ
        eventos_de_amanha = ScheduleEvent.query.filter_by(date=amanha, is_completed=False).all()
        for evento in eventos_de_amanha:
            usuario = User.query.get(evento.user_id)
            if usuario and usuario.whatsapp:

                # --- LÓGICA DE MENSAGEM INTELIGENTE (INÍCIO) ---
                mensagem_base = f"🗓️ *Lembrete para amanhã:* {evento.title}"
                if evento.time:
                    mensagem_base += f" às {evento.time}"

                if evento.type == 'pagamento' and evento.value:
                    valor_formatado = format_currency_brl(evento.value)
                    mensagem = f"{mensagem_base} no valor de *{valor_formatado}*."
                else:
                    mensagem = f"{mensagem_base}."
                # --- LÓGICA DE MENSAGEM INTELIGENTE (FIM) ---

                print(f"Enviando lembrete de AMANHÃ para {usuario.whatsapp}: {mensagem}")
                send_whatsapp_message(f'whatsapp:{usuario.whatsapp}', mensagem)

        print("--- [SCHEDULER] Verificação de lembretes concluída. ---")

# Esta parte permite que o script seja executado manualmente para testes
if __name__ == '__main__':
    check_and_send_reminders()


