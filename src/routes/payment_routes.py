from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User
from src.models.db import db
from src.services.payment_service import create_subscription, create_one_time_payment, get_subscription_details, cancel_subscription_service
from datetime import datetime, timedelta
from src.services.user_service import create_user_from_purchase, normalize_phone_number
from src.services.notification_service import send_welcome_credentials

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/process_subscription', methods=['POST'])
def process_subscription_route():
    data = request.get_json()
    card_token = data.get('card_token')
    payer_data = data.get('payer_data', {})
    
    # NOVOS CAMPOS DO FRONTEND
    plan_type = data.get('plan_type', 'monthly') # 'monthly' ou 'yearly'
    installments = data.get('installments', 1)   # Padrão 1 se não vier

    email = payer_data.get('email')
    name = payer_data.get('name')
    whatsapp_raw = payer_data.get('whatsapp')
    
    if not card_token or not email:
        return jsonify({"error": "Dados incompletos."}), 400

    whatsapp_normalized = normalize_phone_number(whatsapp_raw)
    
    # --- 1. Lógica de Criação/Atualização de Usuário ---
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
        # Atualiza dados se já existir
        if name: user.name = name
        if whatsapp_normalized: user.whatsapp = whatsapp_normalized
        db.session.commit()

    # --- 2. Lógica de Pagamento (Valores Atualizados) ---
    result_mp = None
    days_access = 32 # Padrão mensal
    
    # === PLANO MENSAL ===
    if plan_type == 'monthly':
        print(f"Iniciando plano MENSAL para {email}...")
        
        # A) Cobrança do 1º Mês: R$ 13,45
        entry_amount = 13.45
        
        payment_result = create_one_time_payment(
            user.email, 
            card_token, 
            amount=entry_amount, 
            description="Simplific Pro - 1º Mês",
            installments=1 # Mensal é sempre à vista a entrada
        )

        if payment_result['status'] == 'success':
            # B) Agendamento da Recorrência: R$ 29,90 daqui a 30 dias
            start_date_future = datetime.utcnow() + timedelta(days=30)
            print(f"Pagamento de entrada aprovado! Agendando assinatura de R$ 29,90 para {start_date_future}...")
            
            recurring_amount = 29.90
            
            subscription_result = create_subscription(
                user.email, 
                card_token, 
                amount=recurring_amount, 
                frequency=1,
                start_date=start_date_future
            )
            
            # Se a assinatura falhar, mas o pagamento passou, liberamos o acesso e marcamos ID pendente
            result_mp = {'status': 'success', 'id': subscription_result.get('id', 'pending_sub')}
            days_access = 32
        else:
            result_mp = payment_result # Retorna o erro do pagamento

    # === PLANO ANUAL ===
    elif plan_type == 'yearly':
        print(f"Iniciando plano ANUAL para {email} em {installments}x...")
        
        # Cobrança Única de R$ 199,00 (com parcelamento no cartão)
        total_amount = 199.00
        
        # Não criamos assinatura recorrente no MP para o anual, pois o cartão já trava o limite.
        # Apenas cobramos o valor total parcelado.
        payment_result = create_one_time_payment(
            user.email, 
            card_token, 
            amount=total_amount, 
            description="Simplific Pro - Plano Anual",
            installments=installments # Passa o nº de parcelas escolhido
        )
        
        if payment_result['status'] == 'success':
            # Gera um ID fictício para o sistema saber que é anual
            result_mp = {'status': 'success', 'id': f"annual_{payment_result['id']}"}
            days_access = 366 # 1 Ano + 1 dia de margem
        else:
            result_mp = payment_result

    # --- 3. Finalização e Liberação de Acesso ---
    if result_mp and result_mp.get('status') == 'success':
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
            
            return jsonify({"message": msg, "subscription_id": user.subscription_id}), 200
            
        except Exception as e:
            print(f"Erro crítico pós-pagamento: {e}")
            db.session.rollback()
            return jsonify({"error": "Erro interno ao ativar conta, mas o pagamento foi processado. Contate o suporte."}), 500
    else:
        error_detail = result_mp.get('detail') if result_mp else "Erro desconhecido"
        return jsonify({"error": "Falha no pagamento.", "detail": error_detail}), 400


# --- ROTAS: ÁREA DO ASSINANTE ---

@payment_bp.route('/subscription_status', methods=['GET'])
@jwt_required()
def get_subscription_status_route():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    # Verifica se é plano anual (ID começa com 'annual_')
    is_annual = user.subscription_id and user.subscription_id.startswith('annual_')

    status_data = {
        "status": user.status,
        "user_valid_until": user.subscription_valid_until.isoformat() if user.subscription_valid_until else None,
        "mp_status": "active" if user.status == 'ativo' else "inactive",
        "plan_type": "yearly" if is_annual else "monthly",
        "amount": 199.00 if is_annual else 29.90 # Valor de referência atual
    }

    # Se for mensal e tiver ID válido do MP (não 'pending_sub'), busca detalhes
    if user.subscription_id and not is_annual and user.subscription_id != 'pending_sub':
        mp_data = get_subscription_details(user.subscription_id)
        if mp_data:
            status_data["mp_status"] = mp_data.get("status")
            # Tenta pegar a próxima data de pagamento
            next_payment = mp_data.get("next_payment_date")
            if not next_payment:
                # Fallback para a data de início (caso seja a primeira cobrança futura)
                next_payment = mp_data.get("auto_recurring", {}).get("start_date")
            
            status_data["next_payment_date"] = next_payment
            status_data["amount"] = mp_data.get("auto_recurring", {}).get("transaction_amount")

    return jsonify(status_data), 200

@payment_bp.route('/cancel_subscription', methods=['POST'])
@jwt_required()
def cancel_subscription_route():
    """Cancela a renovação automática."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.subscription_id:
        return jsonify({"error": "Assinatura não encontrada."}), 400

    # Se for anual, não tem cancelamento no MP (já pagou tudo)
    if user.subscription_id.startswith('annual_'):
        return jsonify({
            "message": "Seu plano é anual e não possui renovação automática mensal. Seu acesso continua garantido até o fim do período.",
            "valid_until": user.subscription_valid_until
        }), 200

    # Se for mensal
    result = cancel_subscription_service(user.subscription_id)

    if result['status'] == 'success':
        # Atualiza o status local para refletir o cancelamento da renovação
        # O usuário mantém o acesso até o 'subscription_valid_until'
        return jsonify({
            "message": "Renovação automática cancelada com sucesso. Você mantém o acesso até o fim do período pago.",
            "valid_until": user.subscription_valid_until
        }), 200
    else:
        return jsonify({"error": "Falha ao cancelar assinatura.", "detail": result.get('message')}), 500