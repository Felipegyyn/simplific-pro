from flask import Blueprint, request, jsonify
from src.models.user import User
from src.models.db import db
from src.services.payment_service import create_subscription
from datetime import datetime, timedelta
from src.extensions import bcrypt # Precisamos disso para criar senha

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/process_subscription', methods=['POST'])
# REMOVIDO: @jwt_required() -> Agora é uma rota pública
def process_subscription_route():
    """
    Recebe dados do pagador e token do cartão.
    Cria o usuário (se não existir) e a assinatura.
    """
    data = request.get_json()
    card_token = data.get('card_token')
    payer_data = data.get('payer_data', {})
    plan_type = data.get('plan_type', 'monthly')

    # ▼▼▼ ADICIONE ESTE BLOCO DE DECISÃO ▼▼▼
    if plan_type == 'annual':
        amount = 198.90
        frequency = 12 # 12 meses
        days_access = 366 # 1 ano + 1 dia de margem
    else:
        # Padrão Mensal
        amount = 24.90
        frequency = 1
        days_access = 32 # 1 mês + 2 dias de margem
    # ▲▲▲ FIM DO BLOCO ▲▲▲

    email = payer_data.get('email')
    name = payer_data.get('name')
    whatsapp = payer_data.get('whatsapp')
    
    if not card_token or not email:
        return jsonify({"error": "Dados incompletos (Token ou Email faltando)."}), 400

    # 1. Tenta encontrar o usuário pelo e-mail
    user = User.query.filter_by(email=email).first()
    
    is_new_user = False
    temp_password = None

    # 2. Se não existir, CRIA O USUÁRIO
    if not user:
        is_new_user = True
        # Gera uma senha padrão simples para o primeiro acesso (ou aleatória)
        # O ideal é enviar por e-mail depois. Por enquanto, vamos padronizar para facilitar o teste.
        temp_password = "mudar@123" 
        hashed_password = bcrypt.generate_password_hash(temp_password).decode('utf-8')
        
        user = User(
            name=name or "Novo Usuário",
            email=email,
            whatsapp=whatsapp or "",
            password_hash=hashed_password,
            status='pending', # Fica pendente até o pagamento aprovar
            profile='user'
        )
        db.session.add(user)
        try:
            db.session.commit() # Commita para gerar o ID
            print(f"Novo usuário criado no checkout: {email}")
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao criar usuário: {e}")
            return jsonify({"error": "Erro ao criar cadastro."}), 500

    # 3. Processa o Pagamento (Assinatura)
    # Chama o serviço do Mercado Pago
    result = create_subscription(user.email, card_token, amount=amount, frequency=frequency)

    if result['status'] == 'success':
        # SUCESSO! Ativa o usuário
        try:
            user.status = 'ativo'
            user.profile = 'premium'
            user.subscription_valid_until = datetime.utcnow() + timedelta(days=days_access)
            user.subscription_id = result['id']
            
            # Se forneceu nome/zap agora e antes estava vazio, atualiza
            if name: user.name = name
            if whatsapp: user.whatsapp = whatsapp
            
            db.session.commit()
            
            msg = "Assinatura realizada com sucesso!"
            if is_new_user:
                msg += f" Sua conta foi criada. Senha provisória: {temp_password}"
            
            return jsonify({
                "message": msg,
                "subscription_id": result['id'],
                "new_user": is_new_user
            }), 200
            
        except Exception as e:
            print(f"Erro ao atualizar usuário após pagamento: {e}")
            db.session.rollback()
            return jsonify({"error": "Pagamento aprovado, mas erro interno. Contate suporte."}), 500
    else:
        # FALHA NO PAGAMENTO
        return jsonify({
            "error": "Falha no pagamento.",
            "detail": result.get('detail')
        }), 400