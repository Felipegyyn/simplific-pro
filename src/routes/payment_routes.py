from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User
from src.models.db import db
from datetime import datetime, timedelta
from src.services.user_service import create_user_from_purchase, normalize_phone_number
from src.services.notification_service import send_welcome_credentials
# Importa as DUAS funções agora
from src.services.asaas_service import get_or_create_customer, create_asaas_subscription, create_asaas_payment

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/process_subscription', methods=['POST'])
def process_subscription_route():
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "Dados vazios"}), 400
    except: return jsonify({"error": "JSON inválido"}), 400

    # 1. Dados
    payer_data = data.get('payer', {})
    card_data = data.get('card', {})
    plan_type = data.get('plan_type', 'monthly')
    
    email = payer_data.get('email')
    name = payer_data.get('name')
    cpf = payer_data.get('cpfCnpj')
    phone = payer_data.get('mobilePhone')
    postal_code = payer_data.get('postalCode')
    address_number = payer_data.get('addressNumber')

    if not email or not cpf or not card_data.get('number'):
        return jsonify({"error": "Dados incompletos."}), 400

    whatsapp_normalized = normalize_phone_number(phone)
    
    # 2. Usuário (Preservação)
    user = User.query.filter_by(email=email).first()
    if user:
        if name: user.name = name
        if whatsapp_normalized: user.whatsapp = whatsapp_normalized
        db.session.commit()

    # 3. Asaas (Cliente)
    customer_id = get_or_create_customer(name, email, cpf, phone, postal_code, address_number)
    if not customer_id:
        return jsonify({"error": "Erro ao cadastrar cliente no Asaas."}), 500

    # Prepara dados do cartão com info do titular
    card_data['email'] = email
    card_data['cpfCnpj'] = cpf
    card_data['phone'] = phone
    card_data['postalCode'] = postal_code
    card_data['addressNumber'] = address_number
    
    remote_ip = request.headers.get('X-Forwarded-For', request.remote_addr)

    # ... (código anterior igual) ...

    # 4. DECISÃO: MENSAL vs ANUAL
    result_asaas = None
    days_access = 32
    
    # PEGA O NÚMERO DE PARCELAS DO FRONTEND (Padrão 1 se não vier)
    installments_choice = data.get('installments', 1)

    if plan_type == 'yearly':
        # ANUAL: R$ 199.90 (Parcelado conforme escolha do cliente)
        print(f"🔄 Processando Plano ANUAL ({installments_choice}x) para {email}")
        result_asaas = create_asaas_payment(
            customer_id=customer_id,
            card_data=card_data,
            total_value=199.90,
            installment_count=installments_choice, # <--- USA A ESCOLHA DO CLIENTE
            remote_ip=remote_ip
        )
        days_access = 366
    
    else:
        # MENSAL: Assinatura recorrente de R$ 29.90
        print(f"🔄 Processando Plano MENSAL para {email}")
        result_asaas = create_asaas_subscription(
            customer_id=customer_id,
            card_data=card_data,
            value=29.90,
            remote_ip=remote_ip
        )
        days_access = 32

    # 5. Resultado
    if result_asaas['status'] == 'success':
        data_resp = result_asaas['data']
        transaction_id = data_resp.get('id')
        
        print(f"✅ [ASAAS] Sucesso! ID: {transaction_id}")

        # Ativa Usuário
        new_credentials = None
        if not user:
            success_c, result_c = create_user_from_purchase(name, email, whatsapp_normalized)
            if success_c:
                new_credentials = result_c
                user = User.query.filter_by(email=email).first()
            else:
                return jsonify({"error": "Pago, mas erro ao criar usuário."}), 500

        user.status = 'ativo'
        user.profile = 'usuario'
        user.subscription_id = transaction_id
        user.subscription_valid_until = datetime.utcnow() + timedelta(days=days_access)
        
        db.session.commit()

        msg = "Pagamento aprovado!"
        if new_credentials:
            send_welcome_credentials(new_credentials)
            msg += " Credenciais enviadas."

        return jsonify({"message": msg, "subscription_id": transaction_id}), 200

    else:
        # Erro
        error_msg = result_asaas.get('message')
        detail = result_asaas.get('detail')
        print(f"🚫 [ASAAS] Falha: {error_msg} | {detail}")
        
        # Tenta extrair mensagem amigável do detalhe do Asaas
        friendly_error = error_msg
        if detail and 'errors' in detail:
             friendly_error = detail['errors'][0]['description']

        return jsonify({"error": "Pagamento não autorizado.", "detail": friendly_error}), 400

# Rotas auxiliares mantidas...
@payment_bp.route('/subscription_status', methods=['GET'])
@jwt_required()
def get_subscription_status_route():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user: return jsonify({"error": "User not found"}), 404
    return jsonify({
        "status": user.status,
        "valid_until": user.subscription_valid_until.isoformat() if user.subscription_valid_until else None,
        "subscription_id": user.subscription_id
    }), 200

@payment_bp.route('/cancel_subscription', methods=['POST'])
@jwt_required()
def cancel_subscription_route():
    return jsonify({"message": "Gerencie sua assinatura pelo painel ou suporte."}), 200