from src.models.db import db
from src.models.extended import ScheduleEvent
from src.models.extended_modules import Fatura, CreditCard
from src.services.whatsapp_service import send_whatsapp_message
from datetime import date, timedelta, datetime



def criar_evento_agenda(user_id, titulo, data_evento_str):
    """
    Cria um novo evento na agenda do usuário.
    """
    try:
        # Converte a string de data/hora para um objeto datetime
        data_evento = datetime.strptime(data_evento_str, '%Y-%m-%d %H:%M:%S')

        novo_evento = ScheduleEvent(
            user_id=user_id,
            title=titulo,
            description="Criado via WhatsApp", # Descrição padrão
            date=data_evento.date(),
            time=data_evento.strftime('%H:%M'),
            type='lembrete', # Tipo padrão
            priority='normal', # Prioridade padrão
            is_completed=False
        )
        db.session.add(novo_evento)
        db.session.commit()
        return novo_evento # Retorna o objeto criado em caso de sucesso
    except Exception as e:
        print(f"Erro ao criar evento na agenda: {e}")
        db.session.rollback()
        return None

def buscar_resumo_agenda(user_id):
    """
    Busca os eventos não concluídos de um usuário e os categoriza.
    """
    hoje = date.today()
    
    # Busca todos os eventos futuros ou passados que não foram concluídos
    eventos = ScheduleEvent.query.filter(
        ScheduleEvent.user_id == user_id,
        ScheduleEvent.is_completed == False
    ).order_by(ScheduleEvent.date.asc(), ScheduleEvent.time.asc()).all()

    resumo = {
        'atrasados': [],
        'hoje': [],
        'proximos': []
    }

    for evento in eventos:
        if evento.date < hoje:
            resumo['atrasados'].append(evento.to_dict())
        elif evento.date == hoje:
            resumo['hoje'].append(evento.to_dict())
        else: # evento.date > hoje
            resumo['proximos'].append(evento.to_dict())
            
    return resumo


# ADICIONE ESTAS FUNÇÕES NO FINAL DO ARQUIVO

def verificar_vencimentos_e_notificar():
    """
    Esta função deve ser chamada diariamente por um agendador.
    Ela busca faturas próximas do vencimento e notifica os usuários.
    """
    print("EXECUTANDO JOB: Verificando vencimento de faturas...")
    hoje = date.today()
    data_limite = hoje + timedelta(days=2) # Notificar com 2 dias de antecedência

    # Busca faturas abertas que vencem hoje, amanhã ou depois de amanhã
    faturas_a_notificar = Fatura.query.join(CreditCard).filter(
        Fatura.status == 'aberta'
    ).all()

    for fatura in faturas_a_notificar:
        # Recalcula a data de vencimento para checagem
        mes_vencimento = fatura.mes + 1
        ano_vencimento = fatura.ano
        if mes_vencimento > 12:
            mes_vencimento = 1
            ano_vencimento += 1
        
        data_vencimento = date(ano_vencimento, mes_vencimento, fatura.credit_card.due_day)

        usuario = User.query.get(fatura.user_id)
        if not usuario or not usuario.whatsapp:
            continue

        if data_vencimento == hoje:
            # Mensagem para o dia do vencimento
            mensagem = (
                f"🚨 *ATENÇÃO, {usuario.name}!* 🚨\n\n"
                f"A fatura do seu cartão *{fatura.credit_card.name}* no valor de *R$ {fatura.valor_total:.2f}* vence *HOJE*!\n\n"
                f"Para evitar juros, realize o pagamento. Você já pagou e quer que eu dê baixa aqui?"
            )
            # Aqui, no futuro, podemos adicionar botões para "Sim, paguei"
            # send_whatsapp_message(usuario.whatsapp, mensagem) # Esta linha será ativada depois
            print(f"NOTIFICAR (VENCE HOJE) {usuario.whatsapp}: {mensagem}")

        elif data_vencimento == data_limite:
            # Mensagem para 2 dias antes
            mensagem = (
                f"Olá, {usuario.name}! Só um lembrete amigável... 👋\n\n"
                f"A fatura do seu cartão *{fatura.credit_card.name}* no valor de *R$ {fatura.valor_total:.2f}* vence em 2 dias."
            )
            # send_whatsapp_message(usuario.whatsapp, mensagem) # Esta linha será ativada depois
            print(f"NOTIFICAR (VENCE EM 2 DIAS) {usuario.whatsapp}: {mensagem}")

def verificar_limites_e_notificar():
    """
    Esta função deve ser chamada diariamente por um agendador.
    Verifica o uso do limite e notifica se estiver alto.
    """
    print("EXECUTANDO JOB: Verificando limites de cartão...")
    cartoes = CreditCard.query.filter_by(is_active=True).all()

    for cartao in cartoes:
        limite_usado = cartao.limit - cartao.available_limit
        percentual_usado = (limite_usado / cartao.limit) * 100 if cartao.limit > 0 else 0

        if percentual_usado > 85: # Se usou mais de 85%
            usuario = User.query.get(cartao.user_id)
            if usuario and usuario.whatsapp:
                mensagem = (
                    f"⚠️ *Alerta de Limite!* ⚠️\n\n"
                    f"Olá, {usuario.name}! Você já utilizou *{percentual_usado:.0f}%* do limite do seu cartão *{cartao.name}*.\n\n"
                    f"Cuidado com os próximos gastos para não estourar! 😉"
                )
                # send_whatsapp_message(usuario.whatsapp, mensagem) # Esta linha será ativada depois
                print(f"NOTIFICAR (LIMITE ALTO) {usuario.whatsapp}: {mensagem}")

# Em src/services/schedule_service.py

def get_schedule_summary_for_ai(user_id):
    """Gera um resumo textual da agenda para a IA."""
    # Supondo que exista uma função que busque os próximos eventos.
    # Se não existir, teríamos que criá-la. Por enquanto, vamos simular.
    eventos = ScheduleEvent.query.filter(
        ScheduleEvent.user_id == user_id,
        ScheduleEvent.date >= datetime.utcnow().date()
    ).order_by(ScheduleEvent.date).limit(3).all()

    if not eventos:
        return "Agenda: Nenhum compromisso financeiro nos próximos dias."

    resumos = []
    for evento in eventos:
        resumos.append(f"'{evento.title}' em {evento.date.strftime('%d/%m')}")

    return "Agenda: Próximos compromissos: " + ", ".join(resumos) + "."

# Adicione estas duas novas funções ao final de schedule_service.py

def get_agenda_summary(user_id):
    """
    Busca e categoriza os eventos da agenda em Atrasados, Hoje e Próximos.
    """
    hoje = datetime.utcnow().date()
    
    eventos = ScheduleEvent.query.filter(
        ScheduleEvent.user_id == user_id,
        ScheduleEvent.is_completed == False
    ).order_by(ScheduleEvent.date).all()

    atrasados = [e.to_dict() for e in eventos if e.date < hoje]
    hoje_eventos = [e.to_dict() for e in eventos if e.date == hoje]
    proximos = [e.to_dict() for e in eventos if e.date > hoje]

    return {
        'atrasados': atrasados,
        'hoje': hoje_eventos,
        'proximos': proximos
    }

# Em src/services/schedule_service.py
# Substitua a função inteira por esta versão

def create_agenda_event_from_whatsapp(user_id, data):
    """
    Cria um novo evento na agenda a partir dos dados extraídos pelo Gemini,
    agora separando data e hora corretamente.
    """
    try:
        datetime_str = data.get('event_date')
        
        # Separa a string em data e hora (funciona com 'T' ou espaço)
        parts = datetime_str.replace('T', ' ').split()
        date_part = parts[0]
        time_part = parts[1] if len(parts) > 1 else '09:00' # Padrão 09:00 se a hora não for enviada

        event_date = datetime.strptime(date_part, '%Y-%m-%d').date()
        event_time = time_part[:5] # Pega apenas HH:MM

        novo_evento = ScheduleEvent(
            user_id=user_id,
            title=data.get('title'),
            date=event_date,
            time=event_time, # <-- Salva a hora no campo correto
            type='Lembrete',
            priority='média'
        )
        db.session.add(novo_evento)
        db.session.commit()
        
        return True, f"Lembrete para '{novo_evento.title}' agendado com sucesso para {novo_evento.date.strftime('%d/%m/%Y')} às {novo_evento.time}."
    except Exception as e:
        db.session.rollback()
        print(f"ERRO ao criar evento na agenda: {e}")
        return False, "Ocorreu um erro ao tentar agendar seu lembrete."
