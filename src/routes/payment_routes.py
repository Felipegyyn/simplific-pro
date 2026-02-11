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
    # --- 1. VALIDAÇÃO INICIAL E PROTEÇÃO ---
    try:
        data = request.get_json()
        if not data:
            print("[ERRO PAGAMENTO] JSON vazio recebido.")
            return jsonify({"error": "Corpo da requisição vazio"}), 400
    except Exception as e:
        print(f"[ERRO PAGAMENTO] JSON malformado: {str(e)}")
        return jsonify({"error": "Erro ao ler JSON", "detail": str(e)}), 400

    # Extração de dados básicos
    card_token = data.get('card_token')
    payer_data = data.get('payer_data', {})
    plan_type = data.get('plan_type', 'monthly')
    installments = data.get('installments', 1)
    
    # Extração de dados ANTIFRAUDE (Novos)
    device_id = data.get('device_id') # Vem do front (MP script)
    payer_cpf = payer_data.get('cpf') # Novo campo obrigatório
    address_data = data.get('address', {}) # Novo objeto de endereço

    email = payer_data.get('email')
    name = payer_data.get('name')
    whatsapp_raw = payer_data.get('whatsapp')
    
    # Validação rigorosa
    if not card_token or not email:
        return jsonify({"error": "Dados incompletos (Token ou Email)."}), 400
        
    # Para Antifraude, CPF é essencial no Brasil.
    # Se não vier no payload, logamos o aviso, mas tentamos seguir (pode falhar no MP)
    if not payer_cpf:
        print("[AVISO] CPF não fornecido. Risco alto de recusa.")

    whatsapp_normalized = normalize_phone_number(whatsapp_raw)
    
    print(f"--- INICIANDO PROCESSAMENTO PARA: {email} ({plan_type}) ---")
    print(f"--- Device ID: {device_id} | CPF Presente: {bool(payer_cpf)} ---")

    # --- 2. GESTÃO DO USUÁRIO ---
    try:
        user = User.query.filter_by(email=email).first()
        new_user_credentials = None 

        if not user:
            print(f"Usuário novo. Criando cadastro para {email}...")
            success, result = create_user_from_purchase(name, email, whatsapp_normalized)
            if success:
                new_user_credentials = result 
                user = User.query.filter_by(email=email).first()
                print(f"Usuário criado com ID: {user.id}")
            else:
                print(f"[ERRO CRÍTICO] Falha ao criar usuário no banco: {result}")
                return jsonify({"error": "Erro ao criar cadastro: " + str(result)}), 500
        else:
            print(f"Usuário já existe (ID: {user.id}). Atualizando dados...")
            if name: user.name = name
            if whatsapp_normalized: user.whatsapp = whatsapp_normalized
            db.session.commit()
    except Exception as e:
        print(f"[ERRO CRÍTICO] Erro de banco de dados: {e}")
        db.session.rollback()
        return jsonify({"error": "Erro interno no cadastro."}), 500

    # --- 3. PROCESSAMENTO DO PAGAMENTO (Blindado) ---
    result_mp = None
    days_access = 32
    
    # Prepara o objeto payer_info com tudo que temos
    # Separa Nome e Sobrenome para o MP (simples split)
    first_name = name.split()[0] if name else "Cliente"
    last_name = " ".join(name.split()[1:]) if name and len(name.split()) > 1 else "Sobrenome"

    payer_info_full = {
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "cpf": payer_cpf,
        # Dados de endereço (se vierem vazios, passamos None, mas o ideal é preencher)
        "zip_code": address_data.get('zip_code'),
        "street_name": address_data.get('street_name'),
        "street_number": address_data.get('street_number'),
        "neighborhood": address_data.get('neighborhood'),
        "city": address_data.get('city'),
        "state": address_data.get('state')
    }

    try:
        # === PLANO MENSAL ===
        if plan_type == 'monthly':
            recurring_amount = 29.90
            print(f"Enviando solicitação de assinatura (R$ {recurring_amount})...")
            
            # Para assinatura, passamos o device_id. O CPF vai vinculado ao card_token na criação ou no preapproval
            subscription_result = create_subscription(
                user.email, 
                card_token, 
                amount=recurring_amount, 
                frequency=1,
                device_id=device_id
            )
            
            print(f"[DEBUG MP RESPONSE - MENSAL]: {subscription_result}")

            if subscription_result and subscription_result.get('status') == 'success':
                result_mp = {'status': 'success', 'id': subscription_result['id']}
                days_access = 32
            else:
                error_msg = subscription_result.get('message') or subscription_result.get('detail') or "Cartão recusado"
                result_mp = {'status': 'error', 'detail': error_msg}

        # === PLANO ANUAL ===
        elif plan_type == 'yearly':
            total_amount = 199.00
            print(f"Enviando pagamento único anual (R$ {total_amount}) em {installments}x...")
            
            payment_result = create_one_time_payment(
                user.email, 
                card_token, 
                amount=total_amount, 
                description="Simplific Pro - Plano Anual",
                installments=installments,
                payer_info=payer_info_full, # Enviamos o pacote completo aqui
                device_id=device_id         # E o device ID
            )

            print(f"[DEBUG MP RESPONSE - ANUAL]: {payment_result}")
            
            if payment_result and payment_result.get('status') == 'success':
                result_mp = {'status': 'success', 'id': f"annual_{payment_result['id']}"}
                days_access = 366
            else:
                error_msg = payment_result.get('message') or payment_result.get('detail') or "Pagamento recusado"
                result_mp = {'status': 'error', 'detail': error_msg}

    except Exception as e:
        print(f"[ERRO CRÍTICO] Exceção Payment Service: {str(e)}")
        return jsonify({"error": "Erro comunicação gateway", "detail": str(e)}), 500

    # --- 4. FINALIZAÇÃO ---
    if result_mp and result_mp.get('status') == 'success':
        try:
            print(f"Pagamento APROVADO. ID: {result_mp.get('id')}")
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
            print(f"[ERRO PÓS-PAGAMENTO] Falha ao salvar: {e}")
            db.session.rollback()
            return jsonify({"error": "Pagamento ok, erro na ativação. Contate suporte."}), 500
    else:
        detail = result_mp.get('detail') if result_mp else "Erro desconhecido"
        print(f"[FALHA PAGAMENTO] Recusado: {detail}")
        return jsonify({"error": "Pagamento não autorizado.", "detail": detail}), 400

# Mantenha as outras rotas (subscription_status, cancel) iguais ao que já estava...
@payment_bp.route('/subscription_status', methods=['GET'])
@jwt_required()
def get_subscription_status_route():
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
                if not next_payment:
                    next_payment = mp_data.get("auto_recurring", {}).get("start_date")
                status_data["next_payment_date"] = next_payment
                status_data["amount"] = mp_data.get("auto_recurring", {}).get("transaction_amount")
        except Exception as e:
            print(f"Erro detalhe assinatura: {e}")
    return jsonify(status_data), 200

@payment_bp.route('/cancel_subscription', methods=['POST'])
@jwt_required()
def cancel_subscription_route():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.subscription_id:
        return jsonify({"error": "Assinatura não encontrada."}), 400
    if user.subscription_id.startswith('annual_'):
        return jsonify({
            "message": "Plano anual não possui recorrência para cancelar. Acesso mantido.",
            "valid_until": user.subscription_valid_until
        }), 200
    result = cancel_subscription_service(user.subscription_id)
    if result['status'] == 'success':
        return jsonify({
            "message": "Renovação cancelada. Acesso mantido até o fim do período.",
            "valid_until": user.subscription_valid_until
        }), 200
    else:
        return jsonify({"error": "Falha ao cancelar.", "detail": result.get('message')}), 500