# src/services/credit_card_service.py

from src.models.db import db
from src.models.extended_modules import CreditCard, Fatura, CreditCardTransaction
from src.models.financial import Transaction # Corrigido para o modelo correto
from datetime import date, timedelta
from decimal import Decimal

# Ferramenta de formatação de moeda
import locale
try:
    locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')
except locale.Error:
    pass # Se o locale não estiver disponível, a função terá um fallback

def format_currency_brl(value):
    try:
        return locale.currency(value or 0, grouping=True, symbol='R$')
    except (NameError, locale.Error):
        return "R$ " + f'{(value or 0):,.2f}'.replace(',', 'v').replace('.', ',').replace('v', '.')

# --- FUNÇÕES DE CONSULTA ---

def get_card_limit_details(user_id, card_name=None):
    """
    Busca detalhes de limite de um ou todos os cartões de um usuário.
    """
    query = CreditCard.query.filter_by(user_id=user_id, is_active=True)
    if card_name:
        query = query.filter(CreditCard.name.ilike(f'%{card_name}%'))
    
    cards = query.all()
    if not cards:
        return []

    details = []
    for card in cards:
        used_limit = card.limit - card.available_limit
        usage_percentage = (used_limit / card.limit) * 100 if card.limit > 0 else 0
        details.append({
            'name': card.name,
            'limit': card.limit,
            'used_limit': used_limit,
            'available_limit': card.available_limit,
            'usage_percentage': usage_percentage
        })
    return details

# --- FUNÇÕES DE OPERAÇÃO (AÇÕES) ---

# Em src/services/credit_card_service.py
# Substitua a função inteira por esta versão corrigida

def process_card_payment(user_id, fatura_id):
    """
    Lógica central para pagar uma fatura.
    """
    fatura = Fatura.query.filter_by(id=fatura_id, user_id=user_id, status='aberta').first()
    if not fatura:
        return False, "Fatura em aberto não encontrada."

    cartao = CreditCard.query.get(fatura.cartao_id)
    if not cartao:
        return False, "Cartão associado à fatura não encontrado."

    descricao_despesa = f"Pagamento fatura {cartao.name}"
    
    # ▼▼▼ CORREÇÃO APLICADA AQUI ▼▼▼
    nova_despesa = Transaction(
        user_id=user_id,
        description=descricao_despesa,
        type='saida',
        category_id=5, 
        value=fatura.valor_total,
        status='confirmada',
        date=date.today(),
        format='Dinheiro', 
        payment_form='Débito em Conta' # Adicionando valor padrão para a nova coluna obrigatória
    )
    # ▲▲▲ FIM DA CORREÇÃO ▲▲▲
    
    db.session.add(nova_despesa)
    fatura.status = 'paga'
    
    cartao.available_limit = Decimal(str(cartao.available_limit)) + fatura.valor_total
    
    if cartao.available_limit > cartao.limit:
        cartao.available_limit = cartao.limit

    try:
        db.session.commit()
        return True, "Fatura paga e despesa registrada com sucesso!"
    except Exception as e:
        db.session.rollback()
        print(f"ERRO ao processar pagamento de fatura: {e}")
        return False, "Ocorreu um erro no banco de dados."

def process_card_transaction(user_id, card_id, transaction_data):
    """
    Lógica central para registrar uma transação em um cartão de crédito.
    """
    card = CreditCard.query.filter_by(id=card_id, user_id=user_id).first()
    if not card:
        return False, "Cartão de crédito não encontrado."

    description = transaction_data.get('description')
    total_value = float(transaction_data.get('value', 0))
    installments = int(transaction_data.get('installments', 1))
    
    # --- LÓGICA DE DATA CORRIGIDA ---
    # 1. Tenta pegar a data do payload (enviado pela plataforma).
    date_str = transaction_data.get('date')
    if date_str:
        purchase_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    else:
        # 2. Se não houver data no payload (caso do WhatsApp), usa a data de hoje.
        purchase_date = date.today()
    # --- FIM DA LÓGICA DE DATA ---

    if total_value > card.available_limit:
        return False, f"Limite insuficiente no cartão {card.name}."

    # A lógica de cálculo da fatura que já estava funcionando
    due_date_in_purchase_month = date(purchase_date.year, purchase_date.month, card.due_day)
    closing_date_for_previous_invoice = due_date_in_purchase_month - timedelta(days=8)

    if purchase_date <= closing_date_for_previous_invoice:
        fatura_mes = purchase_date.month - 1
        fatura_ano = purchase_date.year
        if fatura_mes == 0:
            fatura_mes = 12
            fatura_ano -= 1
    else:
        fatura_mes = purchase_date.month
        fatura_ano = purchase_date.year
    
    card.available_limit = Decimal(str(card.available_limit)) - Decimal(str(total_value))

    # TODO: Implementar lógica de parcelamento no futuro
    if installments > 1:
        pass
    else: # Compra à vista
        fatura = _get_or_create_fatura(user_id, card_id, fatura_mes, fatura_ano)
        fatura.valor_total = (fatura.valor_total or Decimal('0.0')) + Decimal(str(total_value))
        
        new_transaction = CreditCardTransaction(
            user_id=user_id, credit_card_id=card_id,
            fatura_id=fatura.id,
            description=description, value=total_value, date=purchase_date,
            category_id=transaction_data.get('category_id', 6),
            installments=1, current_installment=1
        )
        db.session.add(new_transaction)

    try:
        db.session.commit()
        return True, f"Transação '{description}' registrada com sucesso."
    except Exception as e:
        db.session.rollback()
        print(f"ERRO ao processar transação de cartão: {e}")
        return False, "Ocorreu um erro no banco de dados."

def _get_or_create_fatura(user_id, card_id, mes, ano):
    """
    Busca uma fatura aberta para um cartão/mês/ano. Se não existir, cria uma nova.
    (Esta função foi movida de credit_cards.py para cá para centralizar a lógica)
    """
    fatura = Fatura.query.filter_by(
        user_id=user_id,
        cartao_id=card_id,
        mes=mes,
        ano=ano,
        status='aberta'
    ).first()

    if not fatura:
        fatura = Fatura(
            user_id=user_id,
            cartao_id=card_id,
            mes=mes,
            ano=ano,
            valor_total=0,
            status='aberta'
        )
        db.session.add(fatura)
        db.session.flush()
    
    return fatura

def get_credit_card_summary_for_ai(user_id):
    """Gera um resumo textual dos cartões de crédito para a IA."""
    cards = CreditCard.query.filter_by(user_id=user_id, is_active=True).all()
    if not cards:
        return "Cartões de Crédito: Nenhum cartão cadastrado."

    resumos = []
    hoje = date.today()

    for card in cards:
        fatura_aberta = Fatura.query.filter_by(cartao_id=card.id, user_id=user_id, status='aberta').first()
        info_fatura = "Nenhuma fatura aberta."
        if fatura_aberta:
            mes_venc = fatura_aberta.mes + 1
            ano_venc = fatura_aberta.ano
            if mes_venc > 12:
                mes_venc = 1
                ano_venc += 1
            
            vencimento = date(ano_venc, mes_venc, card.due_day)
            dias_para_vencer = (vencimento - hoje).days
            info_fatura = f"Fatura atual de {format_currency_brl(fatura_aberta.valor_total)} vence em {dias_para_vencer} dias."

        resumos.append(
            f"{card.name} (Limite disponível: {format_currency_brl(card.available_limit)} de {format_currency_brl(card.limit)}). {info_fatura}"
        )
    
    return "Cartões de Crédito: " + " | ".join(resumos)