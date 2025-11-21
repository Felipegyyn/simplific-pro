from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User
from src.models.db import db
from src.services.payment_service import create_subscription
from datetime import datetime, timedelta

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/process_subscription', methods=['POST'])
@jwt_required() # Exige que o usuário esteja logado/cadastrado
def process_subscription_route():
    """
    Recebe o token do cartão do frontend e cria a assinatura.
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    card_token = data.get('card_token')
    
    if not card_token:
        return jsonify({"error": "Token do cartão não fornecido."}), 400

    # Busca o usuário no banco para pegar o e-mail correto
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado."}), 404

    # Chama o serviço que criamos no passo anterior
    # Valor fixo de 24.90 por enquanto
    result = create_subscription(user.email, card_token, amount=24.90)

    if result['status'] == 'success':
        # SUCESSO! Atualiza o usuário no banco
        try:
            user.status = 'ativo'
            user.profile = 'premium' # ou o perfil que você usa
            # Dá 32 dias de acesso (margem de segurança para renovação)
            user.subscription_valid_until = datetime.utcnow() + timedelta(days=32)
            user.subscription_id = result['id'] # Salva o ID do MP para cancelar depois se precisar
            
            db.session.commit()
            
            return jsonify({
                "message": "Assinatura realizada com sucesso!",
                "subscription_id": result['id']
            }), 200
            
        except Exception as e:
            print(f"Erro ao atualizar usuário no banco: {e}")
            db.session.rollback()
            return jsonify({"error": "Pagamento aprovado, mas erro ao atualizar conta. Contate suporte."}), 500
    else:
        # ERRO NO PAGAMENTO
        return jsonify({
            "error": "Falha no pagamento.",
            "detail": result.get('detail')
        }), 400