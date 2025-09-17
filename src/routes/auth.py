# src/routes/auth.py

from flask import Blueprint, request, jsonify
from src.models.user import User, PasswordResetToken
from src.models.db import db
from src.services.user_service import generate_password_reset_token
from src.services.notification_service import send_password_reset_email

auth_bp = Blueprint('auth', __name__)

# (Aqui também ficaria sua rota de LOGIN no futuro, se quiser movê-la)

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'O campo e-mail é obrigatório.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        print(f"AVISO: Solicitação de recuperação para e-mail não cadastrado: {email}")
        return jsonify({'message': 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.'}), 200

    try:
        token = generate_password_reset_token(user)
        send_password_reset_email(user.email, user.name, token)
        return jsonify({'message': 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.'}), 200
    except Exception as e:
        print(f"ERRO GERAL na rota /forgot-password: {e}")
        return jsonify({'message': 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.'}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    if not token or not new_password:
        return jsonify({'error': 'Token e nova senha são obrigatórios.'}), 400

    reset_token = PasswordResetToken.query.filter_by(token=token).first()
    if not reset_token or reset_token.is_expired():
        return jsonify({'error': 'Token inválido ou expirado.'}), 400

    user = reset_token.user
    if not user:
         return jsonify({'error': 'Usuário associado ao token não encontrado.'}), 404

    user.set_password(new_password)
    user.first_login = False
    db.session.delete(reset_token)
    db.session.commit()
    return jsonify({'message': 'Sua senha foi redefinida com sucesso!'}), 200