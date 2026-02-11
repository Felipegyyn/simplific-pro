from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User
from src.models.db import db
from datetime import datetime, timedelta
from src.services.user_service import create_user_from_purchase, normalize_phone_number
from src.services.notification_service import send_welcome_credentials
# Novos imports do Asaas
from src.services.asaas_service import get_or_create_customer, create_asaas_subscription

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/process_subscription', methods=['POST'])
def process_subscription_route():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados vazios"}), 400
    except Exception as e:
        return jsonify({"error": "JSON inválido"}), 400

    # 1. Extração dos Dados
    payer_data = data.get('payer', {})
    card_data = data.get('card', {})
    plan_type = data.get('plan_type', 'monthly')
    
    email = payer_data.get('email')
    name = payer_data.get('name')
    cpf = payer_data.get('cpfCnpj')
    phone = payer_data.get('mobilePhone')
    postal_code = payer_data.get('postalCode')
    address_number = payer_data.get('addressNumber')

    # Validação Básica
    if not email or not cpf or not card_data.get('number'):
        return jsonify({"error": "Dados incompletos. CPF, Email e Cartão são obrigatórios."}), 400

    whatsapp_normalized = normalize_phone_number(phone)
    
    print(f"--- [ASAAS] Iniciando processamento para: {email} ---")

    # 2. Usuário no Banco (Lógica de preservação)
    user = User.query.filter_by(email=email).first()
    if user:
        print(f"Usuário existente (ID: {user.id}). Atualizando dados...")
        if name: user.name = name
        if whatsapp_normalized: user.whatsapp = whatsapp_normalized
        db.session.commit()
    else:
        print("Usuário novo. Aguardando pagamento para criar...")

    # 3. Interação com o Asaas
    try:
        # A. Identifica/Cria Cliente
        customer_id = get_or_create_customer(
            name, email, cpf, phone, postal_code, address_number
        )
        
        if not customer_id:
            return jsonify({"error": "Erro ao cadastrar cliente no Asaas."}), 500

        # B. Define Valor
        value = 199.90 if plan_type == 'yearly' else 29.90
        
        # C. Antifraude (IP)
        remote_ip = request.headers.get('X-Forwarded-For', request.remote_addr)

        # --- CORREÇÃO AQUI: PREPARAÇÃO DOS DADOS DO TITULAR ---
        # O Asaas exige email, cpf, fone e endereço DENTRO do objeto do cartão.
        # Vamos injetar os dados do pagador no objeto do cartão.
        card_data['email'] = email
        card_data['cpfCnpj'] = cpf
        card_data['phone'] = phone
        card_data['postalCode'] = postal_code
        card_data['addressNumber'] = address_number
        # -------------------------------------------------------

        # D. Cria a Assinatura
        result_asaas = create_asaas_subscription(customer_id, card_data, value, remote_ip)

        # 4. Resultado
        if result_asaas['status'] == 'success':
            subscription_data = result_asaas['data']
            sub_id = subscription_data.get('id')
            status = subscription_data.get('status')
            
            print(f"✅ [ASAAS] Assinatura criada! ID: {sub_id} | Status: {status}")

            # ATIVAR USUÁRIO
            new_credentials = None
            if not user:
                success_create, result_create = create_user_from_purchase(name, email, whatsapp_normalized)
                if success_create:
                    new_credentials = result_create
                    user = User.query.filter_by(email=email).first()
                else:
                    return jsonify({"error": "Pagamento aprovado, mas erro ao criar usuário."}), 500

            days = 366 if plan_type == 'yearly' else 32
            user.status = 'ativo'
            user.profile = 'usuario'
            user.subscription_id = sub_id
            user.subscription_valid_until = datetime.utcnow() + timedelta(days=days)
            
            db.session.commit()

            msg = "Assinatura realizada com sucesso!"
            if new_credentials:
                send_welcome_credentials(new_credentials)
                msg += " Verifique seu e-mail."

            return jsonify({"message": msg, "subscription_id": sub_id}), 200

        else:
            error_msg = result_asaas.get('message')
            print(f"🚫 [ASAAS] Falha: {error_msg}")
            # Retorna o detalhe técnico para facilitar o debug no frontend se necessário
            return jsonify({"error": "Pagamento não autorizado.", "detail": error_msg}), 400

    except Exception as e:
        print(f"❌ [ERRO CRÍTICO] Rota de pagamento: {e}")
        return jsonify({"error": "Erro interno no servidor."}), 500

# --- MANTIVE AS ROTAS DE STATUS/CANCELAMENTO (Atualizadas para Asaas futuramente) ---
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
    # Nota: Futuramente implementaremos o cancelamento via API do Asaas aqui
    return jsonify({"message": "Para cancelar, contate o suporte ou aguarde atualização."}), 200