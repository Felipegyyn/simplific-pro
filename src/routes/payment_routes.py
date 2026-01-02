from flask import Blueprint, request, jsonify
from flask_cors import cross_origin # <--- IMPORTANTE: Adicione isso
from src.models.user import User
from src.models.db import db
from src.services.payment_service import create_subscription, create_one_time_payment
from datetime import datetime, timedelta

# --- IMPORTAÇÕES DOS SEUS SERVIÇOS EXISTENTES ---
from src.services.user_service import create_user_from_purchase, normalize_phone_number
from src.services.notification_service import send_welcome_credentials
# ------------------------------------------------

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/process_subscription', methods=['POST', 'OPTIONS']) # <--- Adicione OPTIONS
@cross_origin() # <--- O PULO DO GATO: Isso libera o CORS para essa rota específica
def process_subscription_route():
    # Se for uma requisição OPTIONS (pre-flight do navegador), retorna OK imediatamente
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    data = request.get_json()
    card_token = data.get('card_token')
    payer_data = data.get('payer_data', {})
    plan_type = data.get('plan_type', 'monthly')

    email = payer_data.get('email')
    name = payer_data.get('name')
    whatsapp_raw = payer_data.get('whatsapp')
    
    if not card_token or not email:
        return jsonify({"error": "Dados incompletos."}), 400

    whatsapp_normalized = normalize_phone_number(whatsapp_raw)
    
    # Lógica de Usuário
    user = User.query.filter_by(email=email).first()
    new_user_credentials = None 

    if not user:
        success, result = create_user_from_purchase(name, email, whatsapp_normalized)
        if success:
            new_user_credentials = result 
            user = User.query.filter_by(email=email).first()
        else:
            return jsonify({"error": "Erro ao criar cadastro: " + str(result)}), 500
    else:
        if name: user.name = name
        if whatsapp_normalized: user.whatsapp = whatsapp_normalized
        db.session.commit()

    # --- LÓGICA DA PROMOÇÃO ---
    result_mp = None
    
    if plan_type == 'monthly':
        print(f"Iniciando cobrança promocional R$ 4,90 para {email}...")
        payment_result = create_one_time_payment(
            user.email, 
            card_token, 
            amount=4.90, 
            description="Simplific Pro - 1º Mês Promo"
        )

        if payment_result['status'] == 'success':
            start_date_future = datetime.utcnow() + timedelta(days=30)
            print(f"Pagamento R$ 4,90 aprovado! Agendando assinatura R$ 24,90 para {start_date_future}...")
            
            subscription_result = create_subscription(
                user.email, 
                card_token, 
                amount=24.90, 
                frequency=1,
                start_date=start_date_future
            )
            
            result_mp = {'status': 'success', 'id': subscription_result.get('id', 'pending_sub')}
            days_access = 32
        else:
            result_mp = payment_result

    else:
        # ANUAL
        amount = 198.90
        frequency = 12
        days_access = 366
        result_mp = create_subscription(user.email, card_token, amount=amount, frequency=frequency)

    # --- FINALIZAÇÃO ---
    if result_mp['status'] == 'success':
        try:
            user.status = 'ativo' 
            user.profile = 'usuario'  
            user.subscription_valid_until = datetime.utcnow() + timedelta(days=days_access)
            user.subscription_id = result_mp.get('id')
            
            db.session.commit()
            
            msg = "Pagamento aprovado e plano ativado!"
            if new_user_credentials:
                send_welcome_credentials(new_user_credentials)
                msg += " Credenciais enviadas."
            
            return jsonify({"message": msg, "subscription_id": result_mp.get('id')}), 200
            
        except Exception as e:
            print(f"Erro crítico pós-pagamento: {e}")
            db.session.rollback()
            return jsonify({"error": "Erro interno ao ativar conta."}), 500
    else:
        return jsonify({"error": "Falha no pagamento.", "detail": result_mp.get('detail')}), 400