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
    # --- 1. VALIDAÇÃO INICIAL ---
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Corpo da requisição vazio"}), 400
    except Exception as e:
        return jsonify({"error": "Erro ao ler JSON", "detail": str(e)}), 400

    # Extração de dados
    card_token = data.get('card_token')
    payer_data = data.get('payer_data', {})
    plan_type = data.get('plan_type', 'monthly')
    installments = data.get('installments', 1)
    
    # Antifraude
    device_id = data.get('device_id')
    payer_cpf = payer_data.get('cpf')
    address_data = data.get('address', {})

    email = payer_data.get('email')
    name = payer_data.get('name')
    whatsapp_raw = payer_data.get('whatsapp')
    
    if not card_token or not email:
        return jsonify({"error": "Dados incompletos (Token ou Email)."}), 400

    whatsapp_normalized = normalize_phone_number(whatsapp_raw)
    
    print(f"--- INICIANDO TENTATIVA DE COMPRA: {email} ---")

    # --- 2. VERIFICAÇÃO PRÉVIA (NÃO CRIA AINDA) ---
    # Apenas verificamos se o usuário já existe para atualizar dados,
    # mas se não existir, NÃO CRIAMOS AGORA. Esperamos o dinheiro cair.
    user = User.query.filter_by(email=email).first()
    
    if user:
        print(f"Usuário já existe (ID: {user.id}). Atualizando dados de contato...")
        if name: user.name = name
        if whatsapp_normalized: user.whatsapp = whatsapp_normalized
        # Commitamos a atualização de dados básicos
        db.session.commit()
    else:
        print("Usuário novo. Aguardando aprovação do pagamento para criar...")

    # --- 3. PROCESSAMENTO DO PAGAMENTO (Prioritário) ---
    result_mp = None
    days_access = 32
    
    # Prepara dados do pagador
    first_name = name.split()[0] if name else "Cliente"
    last_name = " ".join(name.split()[1:]) if name and len(name.split()) > 1 else "Sobrenome"

    payer_info_full = {
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "cpf": payer_cpf,
        "zip_code": address_data.get('zip_code'),
        "street_name": address_data.get('street_name'),
        "street_number": address_data.get('street_number'),
        "neighborhood": address_data.get('neighborhood'),
        "city": address_data.get('city'),
        "state": address_data.get('state')
    }

    try:
        # === MENSAL ===
        if plan_type == 'monthly':
            recurring_amount = 29.90
            print("Enviando assinatura mensal ao MP...")
            
            subscription_result = create_subscription(
                email, # Passamos o email direto, não o objeto user
                card_token, 
                amount=recurring_amount, 
                frequency=1,
                device_id=device_id
            )
            
            print(f"[MP RESPONSE]: {subscription_result}")

            if subscription_result and subscription_result.get('status') == 'success':
                result_mp = {'status': 'success', 'id': subscription_result['id']}
                days_access = 32
            else:
                error_msg = subscription_result.get('message') or subscription_result.get('detail') or "Cartão recusado"
                result_mp = {'status': 'error', 'detail': error_msg}

        # === ANUAL ===
        elif plan_type == 'yearly':
            total_amount = 199.00
            print("Enviando pagamento anual ao MP...")
            
            payment_result = create_one_time_payment(
                email, 
                card_token, 
                amount=total_amount, 
                description="Simplific Pro - Plano Anual",
                installments=installments,
                payer_info=payer_info_full,
                device_id=device_id
            )

            print(f"[MP RESPONSE]: {payment_result}")
            
            if payment_result and payment_result.get('status') == 'success':
                result_mp = {'status': 'success', 'id': f"annual_{payment_result['id']}"}
                days_access = 366
            else:
                error_msg = payment_result.get('message') or payment_result.get('detail') or "Pagamento recusado"
                result_mp = {'status': 'error', 'detail': error_msg}

    except Exception as e:
        print(f"[ERRO CRÍTICO MP]: {str(e)}")
        return jsonify({"error": "Erro de comunicação com o pagamento", "detail": str(e)}), 500

    # --- 4. DECISÃO FINAL: APROVADO OU REPROVADO? ---
    
    if result_mp and result_mp.get('status') == 'success':
        # >>> SUCESSO! AGORA SIM TRATAMOS O USUÁRIO <<<
        new_user_credentials = None
        
        try:
            # Se o usuário NÃO existia no passo 2, criamos agora que ele pagou
            if not user:
                print(f"Pagamento aprovado! Criando usuário para {email} agora...")
                success_create, result_create = create_user_from_purchase(name, email, whatsapp_normalized)
                
                if success_create:
                    new_user_credentials = result_create
                    # Recarrega o objeto user do banco
                    user = User.query.filter_by(email=email).first()
                else:
                    # CASO EXTREMO: Pagou mas falhou ao criar no banco
                    print(f"[ERRO GRAVE] Pagamento {result_mp.get('id')} aprovado mas falha ao criar user: {result_create}")
                    # Aqui poderíamos estornar, mas vamos logar erro e pedir suporte
                    return jsonify({"error": "Pagamento recebido, mas houve erro ao gerar seu acesso. Contate o suporte urgente."}), 500

            # Ativação do Plano
            user.status = 'ativo' 
            user.profile = 'usuario'  
            user.subscription_valid_until = datetime.utcnow() + timedelta(days=days_access)
            user.subscription_id = result_mp.get('id')
            
            db.session.commit()
            
            msg = "Pagamento aprovado e plano ativado!"
            
            # Envia e-mail apenas se foi criado agora (credenciais novas)
            if new_user_credentials:
                send_welcome_credentials(new_user_credentials)
                msg += " Credenciais enviadas."
            
            return jsonify({"message": msg, "subscription_id": user.subscription_id}), 200

        except Exception as e:
            print(f"[ERRO PÓS-PAGAMENTO]: {e}")
            db.session.rollback()
            return jsonify({"error": "Erro ao ativar conta paga. Contate o suporte."}), 500

    else:
        # >>> FALHA! NÃO CRIAMOS NADA <<<
        detail = result_mp.get('detail') if result_mp else "Erro desconhecido"
        print(f"[FALHA] Pagamento recusado. Usuário não criado/alterado. Motivo: {detail}")
        return jsonify({"error": "Pagamento não autorizado.", "detail": detail}), 400

# ... (Manter as rotas de status e cancelamento iguais) ...
@payment_bp.route('/subscription_status', methods=['GET'])
@jwt_required()
def get_subscription_status_route():
    # ... (código existente) ...
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user: return jsonify({"error": "Usuário não encontrado"}), 404
    is_annual = user.subscription_id and user.subscription_id.startswith('annual_')
    status_data = {
        "status": user.status,
        "user_valid_until": user.subscription_valid_until.isoformat() if user.subscription_valid_until else None,
        "mp_status": "active" if user.status == 'ativo' else "inactive",
        "plan_type": "yearly" if is_annual else "monthly",
        "amount": 199.00 if is_annual else 29.90
    }
    if user.subscription_id and not is_annual and user.subscription_id != 'pending_sub':
        try:
            mp_data = get_subscription_details(user.subscription_id)
            if mp_data:
                status_data["mp_status"] = mp_data.get("status")
                next_payment = mp_data.get("next_payment_date")
                if not next_payment: next_payment = mp_data.get("auto_recurring", {}).get("start_date")
                status_data["next_payment_date"] = next_payment
                status_data["amount"] = mp_data.get("auto_recurring", {}).get("transaction_amount")
        except Exception: pass
    return jsonify(status_data), 200

@payment_bp.route('/cancel_subscription', methods=['POST'])
@jwt_required()
def cancel_subscription_route():
    # ... (código existente) ...
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.subscription_id: return jsonify({"error": "Assinatura não encontrada."}), 400
    if user.subscription_id.startswith('annual_'):
        return jsonify({"message": "Plano anual não possui recorrência. Acesso mantido.", "valid_until": user.subscription_valid_until}), 200
    result = cancel_subscription_service(user.subscription_id)
    if result['status'] == 'success':
        return jsonify({"message": "Renovação cancelada.", "valid_until": user.subscription_valid_until}), 200
    return jsonify({"error": "Falha ao cancelar.", "detail": result.get('message')}), 500