from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity # <--- ADICIONADO
from src.models.user import User
from src.models.db import db
# <--- ATUALIZADO ABAIXO: Adicionamos get_subscription_details e cancel_subscription_service
from src.services.payment_service import create_subscription, create_one_time_payment, get_subscription_details, cancel_subscription_service
from datetime import datetime, timedelta
from src.services.user_service import create_user_from_purchase, normalize_phone_number
from src.services.notification_service import send_welcome_credentials

payment_bp = Blueprint('payment', __name__)

# --- ROTA LIMPA (Sem @cross_origin, pois o main.py já cuida disso) ---
@payment_bp.route('/process_subscription', methods=['POST'])
def process_subscription_route():
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


# --- NOVAS ROTAS: ÁREA DO ASSINANTE ---

@payment_bp.route('/subscription_status', methods=['GET'])
@jwt_required()
def get_subscription_status_route():
    """Retorna os detalhes da assinatura do usuário logado."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    # VERIFICAÇÃO PRINCIPAL: O usuário tem dias válidos no banco de dados?
    is_active_by_date = False
    if user.subscription_valid_until and user.subscription_valid_until > datetime.utcnow().date():
        is_active_by_date = True

    # Se não tiver data válida e nem ID de assinatura, é Free.
    if not is_active_by_date and not user.subscription_id:
        return jsonify({
            "status": "inactive",
            "message": "Nenhuma assinatura ativa vinculada."
        }), 200

    # Tenta buscar detalhes no Mercado Pago (se houver ID), mas não depende disso para dar o acesso
    mp_data = {}
    if user.subscription_id:
        mp_data = get_subscription_details(user.subscription_id) or {}

    # Define o status visual
    # Se a data do banco for válida, mostramos como ATIVO, mesmo que o MP diga 'pending' (caso dos 4,90)
    final_status = 'active' if is_active_by_date else 'inactive'
    
    # Se o MP disser explicitamente que cancelou, respeitamos para mostrar na tela (mas mantemos acesso pela data)
    mp_status_raw = mp_data.get("status")
    
    return jsonify({
        "status": final_status, # Isso controla se o card verde aparece
        "mp_status": mp_status_raw, # authorized, paused, cancelled, pending
        "next_payment_date": mp_data.get("next_payment_date"),
        "amount": mp_data.get("auto_recurring", {}).get("transaction_amount"),
        "user_valid_until": user.subscription_valid_until
    }), 200

@payment_bp.route('/cancel_subscription', methods=['POST'])
@jwt_required()
def cancel_subscription_route():
    """Cancela a renovação automática."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.subscription_id:
        return jsonify({"error": "Assinatura não encontrada."}), 400

    # Chama o serviço para cancelar no MP
    result = cancel_subscription_service(user.subscription_id)

    if result['status'] == 'success':
        # Nota: Não alteramos o user.status para 'inactive' agora.
        # O usuário pagou pelo período, então ele continua ativo até a data de expiração.
        # O Cron Job (check-subscriptions) irá inativá-lo quando a data chegar.
        
        return jsonify({
            "message": "Assinatura cancelada com sucesso. Você ainda tem acesso até o fim do período pago.",
            "valid_until": user.subscription_valid_until
        }), 200
    else:
        return jsonify({"error": "Falha ao cancelar assinatura.", "detail": result.get('message')}), 500
