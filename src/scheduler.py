# scheduler.py
from datetime import date, timedelta, datetime
from src.models.extended import ScheduleEvent
from src.models.user import User
from src.models.financial import Transaction 
from src.services.whatsapp_service import send_whatsapp_template, template_sids 
# Importe a nossa função de formatação de moeda para usar aqui também
from src.utils.formatters import format_currency_brl
from src.services.reports_service import gerar_resumo_semanal
import time

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

# ▼▼▼ ADICIONE TODA A FUNÇÃO ABAIXO NESTE PONTO ▼▼▼

def enviar_resumos_semanais(app):
    """
    Busca todos os usuários elegíveis e envia o resumo financeiro da última semana.
    """
    print(f"--- [SCHEDULER] Iniciando tarefa de envio de resumos semanais em {datetime.now()} ---")
    with app.app_context():
        # Busca usuários ativos que optaram por receber o resumo
        usuarios = User.query.filter_by(status='ativo', receive_weekly_summary=True).all()
        
        print(f"Encontrados {len(usuarios)} usuários para enviar o resumo.")

        for usuario in usuarios:
            print(f"Processando resumo para o usuário: {usuario.name} ({usuario.whatsapp})")
            resumo = gerar_resumo_semanal(usuario.id)
            
            # Só envia se o usuário teve movimentação na semana anterior
            if resumo and resumo["has_activity"]:
                saldo_texto = f"positivo em *{format_currency_brl(resumo['saldo'])}*" if resumo['saldo'] >= 0 else f"negativo em *{format_currency_brl(resumo['saldo'])}*"
                
                # Formata o número para o padrão da Twilio
                numero_destino = f'whatsapp:{usuario.whatsapp}'
                # Busca o ID (SID) do nosso novo template
                template_sid = template_sids.get('resumo_semanal_v1')

                if not template_sid:
                    print(f"ERRO: Template SID para 'resumo_semanal_v1' não foi encontrado no código.")
                    continue # Pula para o próximo usuário

                # Chama a função de envio de TEMPLATE com as variáveis
                send_whatsapp_template(
                    to=numero_destino,
                    template_sid=template_sid,
                    content_variables={
                        "1": usuario.name.split()[0], # Envia apenas o primeiro nome
                        "2": format_currency_brl(resumo['total_gasto']),
                        "3": resumo['categoria_principal'],
                        "4": saldo_texto
                    }
                )

                time.sleep(1) # Pausa de 1 segundo para não sobrecarregar a API da Twilio
            else:
                print(f"Usuário {usuario.name} sem atividade na última semana. Resumo não enviado.")
    
    print("--- [SCHEDULER] Tarefa de resumos semanais concluída. ---")

# Esta parte permite que o script seja executado manualmente para testes
if __name__ == '__main__':
    check_and_send_reminders()


# Em src/scheduler.py, adicione esta função no final do arquivo

def verificar_lancamentos_pendentes(app):
    """
    Verifica transações com status 'pendente' para o dia atual e envia um lembrete/confirmação.
    """
    with app.app_context():
        print(f"--- [SCHEDULER] Executando verificação de lançamentos pendentes em {datetime.now()} ---")
        hoje = date.today()

        # 1. Busca todos os lançamentos pendentes com a data de hoje
        lancamentos_do_dia = Transaction.query.filter_by(date=hoje, status='pendente').all()

        if not lancamentos_do_dia:
            print("Nenhum lançamento pendente para hoje.")
            return

        print(f"Encontrados {len(lancamentos_do_dia)} lançamentos pendentes para hoje.")

        for lancamento in lancamentos_do_dia:
            usuario = User.query.get(lancamento.user_id)
            if usuario and usuario.whatsapp:
                
                # 2. Guarda na "memória" (sessão) que estamos aguardando uma resposta para este lançamento
                session_key = usuario.whatsapp # A chave da sessão é o número do usuário
                user_sessions[session_key] = {
                    'contexto': 'confirmar_lancamento_lembrete',
                    'transaction_id': lancamento.id
                }
                print(f"Sessão criada para {session_key} com transaction_id {lancamento.id}")

                # 3. Monta e envia a mensagem
                tipo_texto = "receita" if lancamento.type == 'entrada' else "despesa"
                valor_formatado = format_currency_brl(lancamento.value)
                
                mensagem = (
                    f"Olá, {usuario.name}! 👋\n\n"
                    f"Lembrete de um lançamento pendente para hoje:\n\n"
                    f"*{lancamento.description}* ({tipo_texto}) no valor de *{valor_formatado}*.\n\n"
                    f"Este lançamento já foi pago/recebido?\n\n"
                    f"Responda com *Sim* para confirmar ou *Não*."
                )

                numero_destino = f'whatsapp:{usuario.whatsapp}'
                enviar_mensagem_whatsapp(numero_destino, mensagem)
                time.sleep(1) # Pausa para não sobrecarregar a API

        print("--- [SCHEDULER] Verificação de lançamentos pendentes concluída. ---")

# ▼▼▼ COLE ISSO NO FINAL DO ARQUIVO SCHEDULER.PY ▼▼▼

def recover_lost_leads(app):
    """
    ROBÔ CAÇADOR: Busca leads que se cadastraram há 24h e ainda não compraram.
    Envia mensagem de recuperação via WhatsApp.
    """
    with app.app_context():
        print(f"--- [SCHEDULER] Iniciando recuperação de leads perdidos em {datetime.now()} ---")
        
        # 1. Definir a janela de tempo (Quem entrou ontem)
        # Pegamos quem se cadastrou entre 24h e 48h atrás
        agora = datetime.utcnow()
        inicio_janela = agora - timedelta(hours=48)
        fim_janela = agora - timedelta(hours=24)
        
        # 2. Buscar no Banco
        # Status 'prospect' = Quem veio do diagnóstico e não comprou
        # Profile 'lead' = Confirmação extra
        leads_perdidos = User.query.filter(
            User.status == 'prospect',
            User.profile == 'lead',
            User.created_at >= inicio_janela,
            User.created_at <= fim_janela
        ).all()
        
        if not leads_perdidos:
            print("--- [SCHEDULER] Nenhum lead para recuperar hoje. ---")
            return

        print(f"--- [SCHEDULER] Encontrados {len(leads_perdidos)} leads para resgatar! ---")

        # 3. Disparar Mensagens
        # ATENÇÃO: Substitua 'HX_SEU_TEMPLATE_LEAD' pelo SID que vamos criar no Twilio
        # Se preferir usar mensagem direta (sem template), avise que alteramos aqui.
        recovery_template_sid = "HX6557b7f09693b9ae69415f3a85f2f447" 

        for lead in leads_perdidos:
            if not lead.whatsapp: continue
            
            print(f"👉 Enviando resgate para: {lead.email}")
            
            try:
                # Envia usando Template (Seguro)
                send_whatsapp_template(
                    to=f"whatsapp:{lead.whatsapp}",
                    template_sid=recovery_template_sid,
                    content_variables={
                        "1": lead.name.split()[0] # Primeiro nome
                    }
                )
                time.sleep(1) # Pausa para não travar a API
            except Exception as e:
                print(f"❌ Erro ao enviar para {lead.email}: {e}")

    print("--- [SCHEDULER] Recuperação finalizada. ---")


