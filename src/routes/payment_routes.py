from flask import Blueprint, request, jsonify
from src.models.user import User
from src.models.db import db
from src.services.payment_service import create_subscription
from datetime import datetime, timedelta

# --- IMPORTAÇÕES DOS SEUS SERVIÇOS EXISTENTES ---
from src.services.user_service import create_user_from_purchase, normalize_phone_number
from src.services.notification_service import send_welcome_credentials
# ------------------------------------------------

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/process_subscription', methods=['POST'])
def process_subscription_route():
    """
    1. Recebe dados do frontend.
    2. Cria usuário via serviço (se não existir).
    3. Processa pagamento no Mercado Pago.
    4. Se aprovado: Ativa usuário e envia credenciais (E-mail/Zap).
    """
    data = request.get_json()
    card_token = data.get('card_token')
    payer_data = data.get('payer_data', {})
    
    # Dados para lógica de planos (Mensal/Anual)
    plan_type = data.get('plan_type', 'monthly')

    # Extrai dados do formulário
    email = payer_data.get('email')
    name = payer_data.get('name')
    whatsapp_raw = payer_data.get('whatsapp')
    
    if not card_token or not email:
        return jsonify({"error": "Dados incompletos (Token ou Email faltando)."}), 400

    # 1. Normaliza o WhatsApp (Garante o +55)
    whatsapp_normalized = normalize_phone_number(whatsapp_raw)

    # 2. Verifica ou Cria o Usuário
    user = User.query.filter_by(email=email).first()
    
    # Variável para guardar as credenciais (senha pura) se for um novo usuário
    new_user_credentials = None 

    if not user:
        # --- USA SEU SERVIÇO DE CRIAÇÃO (IGUAL MONETIZZE) ---
        print(f"Criando novo usuário para: {email}")
        success, result = create_user_from_purchase(name, email, whatsapp_normalized)
        
        if success:
            # 'result' aqui contém o dicionário com a senha provisória em texto puro
            new_user_credentials = result 
            # Recarrega o objeto usuário do banco para associar a assinatura
            user = User.query.filter_by(email=email).first()
        else:
            # Se falhou ao criar (ex: erro de banco), retorna erro
            print(f"Erro ao criar usuário: {result}")
            return jsonify({"error": "Erro ao criar cadastro: " + str(result)}), 500
    else:
        # Se o usuário já existe, atualizamos o nome/zap se ele forneceu novos
        if name: user.name = name
        if whatsapp_normalized: user.whatsapp = whatsapp_normalized
        db.session.commit()

    # 3. Define valores do plano (Mensal vs Anual)
    if plan_type == 'annual':
        amount = 198.90
        frequency = 12
        days_access = 366
    else:
        amount = 24.90
        frequency = 1
        days_access = 32

    # 4. Processa o Pagamento no Mercado Pago
    result_mp = create_subscription(user.email, card_token, amount=amount, frequency=frequency)

    if result_mp['status'] == 'success':
        # --- SUCESSO! ---
        try:
            # Atualiza status e validade
            user.status = 'ativo'
            user.profile = 'premium'
            user.subscription_valid_until = datetime.utcnow() + timedelta(days=days_access)
            user.subscription_id = result_mp['id']
            
            db.session.commit()
            
            msg = "Assinatura realizada com sucesso!"

            # --- ENVIO DE CREDENCIAIS (IGUAL MONETIZZE) ---
            if new_user_credentials:
                # Se o usuário acabou de ser criado, 'new_user_credentials' tem a senha
                print(f"Enviando credenciais de boas-vindas para {user.email}...")
                send_welcome_credentials(new_user_credentials)
                msg += " Sua conta foi criada e os dados enviados por E-mail e WhatsApp."
            else:
                print(f"Usuário {user.email} já existia (recorrência/renovação). Não enviando credenciais.")
            
            return jsonify({
                "message": msg,
                "subscription_id": result_mp['id']
            }), 200
            
        except Exception as e:
            print(f"Erro ao atualizar usuário após pagamento: {e}")
            db.session.rollback()
            return jsonify({"error": "Pagamento aprovado, mas erro interno ao ativar conta."}), 500
    else:
        # FALHA NO PAGAMENTO
        return jsonify({
            "error": "Falha no pagamento.",
            "detail": result_mp.get('detail')
        }), 400