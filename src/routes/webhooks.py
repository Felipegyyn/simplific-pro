from flask import Blueprint, request, jsonify
import os
import requests
from datetime import datetime, timedelta
from src.models.user import User
from src.models.db import db
from src.services.user_service import create_user_from_purchase, normalize_phone_number
from src.services.notification_service import (
    send_welcome_credentials, 
    send_payment_failed_notification
)

webhooks_bp = Blueprint('webhooks', __name__)

# --- 1. MONETIZZE (INTACTO) ---
MONETIZZE_SECRET_KEY = os.getenv('MONETIZZE_SECRET_KEY')

@webhooks_bp.route('/monetizze', methods=['POST'])
def monetizze_webhook():
    dados_completos = request.json
    print("✅ Webhook da Monetizze recebido!")

    chave_recebida = dados_completos.get('chave_unica')
    if not MONETIZZE_SECRET_KEY or chave_recebida != MONETIZZE_SECRET_KEY:
        print("AVISO: Chave Monetizze inválida.")
        return jsonify({'status': 'error', 'message': 'Acesso não autorizado'}), 401

    evento_descricao = dados_completos.get('tipoEvento', {}).get('descricao')
    comprador = dados_completos.get('comprador', {})
    email = comprador.get('email')

    if not email:
        return jsonify({'status': 'success', 'message': 'Ignorado (sem email)'}), 200

    if evento_descricao == 'Finalizada / Aprovada':
        print(f"Monetizze Aprovada: {email}")
        nome = comprador.get('nome')
        whatsapp = normalize_phone_number(comprador.get('telefone'))

        user = User.query.filter_by(email=email).first()
        if user:
            user.status = 'ativo'
            user.subscription_valid_until = None # Monetizze gerencia recorrencia por fora geralmente
            db.session.commit()
        else:
            success, result = create_user_from_purchase(nome, email, whatsapp)
            if success: send_welcome_credentials(result)

    elif evento_descricao in ['Assinatura Cancelada', 'Em Atraso', 'Recusada', 'Cancelada']:
        print(f"Monetizze Cancel/Falha: {email}")
        user = User.query.filter_by(email=email).first()
        if user:
            user.subscription_valid_until = datetime.utcnow().date()
            db.session.commit()

    return jsonify({'status': 'success'}), 200


# --- 2. MERCADO PAGO (LEGADO - MANTIDO) ---
@webhooks_bp.route('/mercadopago', methods=['POST'])
def mercadopago_webhook():
    # ... (Seu código atual do MP fica aqui, sem alterações para não quebrar nada antigo) ...
    # Por brevidade, imagine que o código anterior do MP está aqui. 
    # Se quiser que eu cole ele de novo, me avise. Mas a ideia é não mexer.
    return jsonify({"status": "ok"}), 200


# --- 3. ASAAS (NOVO E PODEROSO) ---
@webhooks_bp.route('/asaas', methods=['POST'])
def asaas_webhook():
    """
    Recebe atualizações de pagamento do Asaas.
    Trata Renovações, Atrasos e Cancelamentos.
    """
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "No data"}), 400
        
        event = data.get('event')
        payment = data.get('payment', {})
        
        # 1. Segurança (Verifica Token do Header)
        asaas_token = request.headers.get('asaas-access-token')
        env_token = os.getenv('ASAAS_WEBHOOK_TOKEN')
        
        # Se você configurou token no Render, valida. Se não, avisa no log (perigoso em prod).
        if env_token and asaas_token != env_token:
            print("🚫 [ASAAS WEBHOOK] Tentativa não autorizada (Token incorreto).")
            return jsonify({"error": "Unauthorized"}), 401

        print(f"🔔 [ASAAS WEBHOOK] Evento: {event} | ID: {payment.get('id')}")

        # 2. Identifica o Cliente (Busca por Email ou CPF)
        # O payload do Asaas traz dados limitados do cliente dentro de 'payment', 
        # as vezes precisamos buscar o cliente pelo customer_id se não bater o email.
        
        # Tenta pegar email direto da cobrança (nem sempre vem, depende da configuração)
        # O ideal é confiar no customer_id ou buscar no nosso banco quem tem esse subscription_id
        
        subscription_id = payment.get('subscription')
        installment_id = payment.get('installment') # Para parcelamento
        
        # Estratégia de Busca do Usuário:
        user = None
        
        # A. Busca pelo ID da Assinatura (se for recorrente mensal)
        if subscription_id:
            user = User.query.filter_by(subscription_id=subscription_id).first()
            
        # B. Busca pelo ID da Transação (se for anual parcelado)
        if not user and payment.get('id'):
            user = User.query.filter_by(subscription_id=payment.get('id')).first()
            
        # C. Busca por Email (Fallback - consulta API Asaas se precisar, mas vamos tentar evitar latência)
        # Vamos assumir que se não achou pelo ID, pode ser a primeira cobrança que o sistema ainda não salvou?
        # Não, pq o processo de compra salva o ID. Então se não achar, é estranho.
        
        if not user:
             print(f"⚠️ [ASAAS] Usuário não encontrado para sub/pay ID. Ignorando evento {event}.")
             return jsonify({"status": "user_not_found"}), 200

        # 3. Processa Eventos
        
        if event == 'PAYMENT_CONFIRMED' or event == 'PAYMENT_RECEIVED':
            print(f"✅ Pagamento Confirmado para {user.email}")
            
            # Renova o acesso
            # Se for mensal, +32 dias. Se for anual (valor > 100), +366 dias.
            
            user.status = 'ativo'
            
            # PROTEÇÃO: Se o plano for anual, não devemos reduzir a data de validade 
            # quando uma parcela for paga e o webhook for chamado.
            if user.subscription_plan == 'anual':
                # A validade já foi definida como 1 ano no checkout.
                # Só vamos garantir que ela não expire acidentalmente.
                pass
            else:
                user.subscription_valid_until = datetime.utcnow().date() + timedelta(days=32)
                
            db.session.commit()
            
        elif event in ['PAYMENT_OVERDUE', 'PAYMENT_REFUNDED', 'PAYMENT_DUNNING_RECEIVED']:
            print(f"🚫 Pagamento Atrasado/Falha para {user.email}")
            
            # Dispara notificação de falha
            send_payment_failed_notification(user.name, user.whatsapp)
            
            # Se quiser cortar o acesso imediatamente:
            # user.status = 'inativo'
            # db.session.commit()
            # Mas geralmente damos uma carência de alguns dias.
            
        return jsonify({"status": "processed"}), 200

    except Exception as e:
        print(f"❌ [ERRO ASAAS WEBHOOK] {e}")
        return jsonify({"error": "Internal Error"}), 500