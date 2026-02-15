from datetime import date, timedelta, datetime
import time
from src.models.user import User
from src.models.financial import Transaction 
from src.models.extended import ScheduleEvent
from src.services.whatsapp_service import send_whatsapp_template, template_sids, send_whatsapp_message
from src.utils.formatters import format_currency_brl
from src.services.reports_service import gerar_resumo_semanal
from src.extensions import db # Importar db das extensions para garantir contexto

# Dicionário simples para simular sessão de contexto em memória (para o scheduler)
# Em produção real com múltiplos workers, ideal seria Redis.
user_sessions = {} 

def check_and_send_reminders(app):
    """
    Vigilante de Agenda: Envia lembretes de eventos para Hoje e Amanhã.
    """
    with app.app_context():
        print(f"--- [SCHEDULER] Verificando lembretes de agenda em {datetime.now()} ---")
        try:
            hoje = date.today()
            amanha = hoje + timedelta(days=1)

            # 1. Eventos de HOJE
            eventos_hoje = ScheduleEvent.query.filter_by(date=hoje, is_completed=False).all()
            for evento in eventos_hoje:
                try:
                    user = User.query.get(evento.user_id)
                    if user and user.whatsapp:
                        msg = f"🔔 *Lembrete para hoje:* {evento.title}"
                        if evento.time: msg += f" às {evento.time}"
                        if evento.type == 'pagamento' and evento.value:
                            msg += f" no valor de *{format_currency_brl(evento.value)}*!"
                        
                        send_whatsapp_message(f'whatsapp:{user.whatsapp}', msg)
                        time.sleep(1)
                except Exception as e:
                    print(f"Erro ao processar evento {evento.id}: {e}")

            # 2. Eventos de AMANHÃ
            eventos_amanha = ScheduleEvent.query.filter_by(date=amanha, is_completed=False).all()
            for evento in eventos_amanha:
                try:
                    user = User.query.get(evento.user_id)
                    if user and user.whatsapp:
                        msg = f"🗓️ *Lembrete para amanhã:* {evento.title}"
                        if evento.time: msg += f" às {evento.time}"
                        
                        send_whatsapp_message(f'whatsapp:{user.whatsapp}', msg)
                        time.sleep(1)
                except Exception as e:
                    print(f"Erro ao processar evento amanhã {evento.id}: {e}")

        except Exception as e:
            print(f"Erro crítico no job de lembretes: {e}")

def enviar_resumos_semanais(app):
    """
    Envia resumo financeiro semanal (Domingo).
    """
    print(f"--- [SCHEDULER] Iniciando resumos semanais em {datetime.now()} ---")
    with app.app_context():
        try:
            usuarios = User.query.filter_by(status='active', receive_weekly_summary=True).all()
            for usuario in usuarios:
                try:
                    resumo = gerar_resumo_semanal(usuario.id)
                    if resumo and resumo["has_activity"]:
                        saldo_texto = f"positivo em *{format_currency_brl(resumo['saldo'])}*" if resumo['saldo'] >= 0 else f"negativo em *{format_currency_brl(resumo['saldo'])}*"
                        
                        template_sid = template_sids.get('resumo_semanal_v1')
                        if template_sid:
                            send_whatsapp_template(
                                to=f'whatsapp:{usuario.whatsapp}',
                                template_sid=template_sid,
                                content_variables={
                                    "1": usuario.name.split()[0],
                                    "2": format_currency_brl(resumo['total_gasto']),
                                    "3": resumo['categoria_principal'],
                                    "4": saldo_texto
                                }
                            )
                            time.sleep(1)
                except Exception as e:
                    print(f"Erro ao enviar resumo para {usuario.email}: {e}")
        except Exception as e:
            print(f"Erro crítico no job de resumos: {e}")

def verificar_lancamentos_pendentes(app):
    """
    Cobra confirmação de lançamentos pendentes do dia.
    """
    with app.app_context():
        print(f"--- [SCHEDULER] Verificando lançamentos pendentes em {datetime.now()} ---")
        try:
            hoje = date.today()
            # Usa pool_pre_ping configurado no main.py para evitar queda de conexão aqui
            lancamentos = Transaction.query.filter_by(date=hoje, status='pendente').all()

            for lancamento in lancamentos:
                try:
                    user = User.query.get(lancamento.user_id)
                    if user and user.whatsapp:
                        tipo = "receita" if lancamento.type == 'entrada' else "despesa"
                        valor = format_currency_brl(lancamento.value)
                        
                        msg = (
                            f"Olá, {user.name.split()[0]}! 👋\n\n"
                            f"Lembrete de pendência para hoje:\n"
                            f"*{lancamento.description}* ({tipo}) de *{valor}*.\n\n"
                            f"Já foi pago/recebido?\n"
                            f"Responda *Sim* para confirmar ou *Não*."
                        )
                        
                        # Salva contexto na memória (Global variable neste arquivo)
                        user_sessions[user.whatsapp] = {
                            'contexto': 'confirmar_lancamento_lembrete',
                            'transaction_id': lancamento.id
                        }
                        
                        send_whatsapp_message(f'whatsapp:{user.whatsapp}', msg)
                        time.sleep(1)
                except Exception as e:
                    print(f"Erro ao processar lançamento {lancamento.id}: {e}")

        except Exception as e:
            print(f"Erro crítico no job de pendências: {e}")

def recover_lost_leads(app):
    """
    Recupera leads que não compraram nas últimas 24h-48h.
    """
    with app.app_context():
        print(f"--- [SCHEDULER] Caçando leads perdidos em {datetime.now()} ---")
        try:
            agora = datetime.utcnow()
            inicio = agora - timedelta(hours=48)
            fim = agora - timedelta(hours=24)

            leads = User.query.filter(
                User.status == 'prospect',
                User.created_at >= inicio,
                User.created_at <= fim
            ).all()

            template_sid = "HX6557b7f09693b9ae69415f3a85f2f447" # Seu template de recuperação

            for lead in leads:
                if lead.whatsapp:
                    try:
                        send_whatsapp_template(
                            to=f"whatsapp:{lead.whatsapp}",
                            template_sid=template_sid,
                            content_variables={"1": lead.name.split()[0]}
                        )
                        print(f"Recuperação enviada para {lead.email}")
                        time.sleep(1)
                    except Exception as e:
                        print(f"Erro ao enviar recuperação para {lead.email}: {e}")
        except Exception as e:
            print(f"Erro crítico no job de recuperação: {e}")