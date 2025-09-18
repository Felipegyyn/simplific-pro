# src/routes/user_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User
from src.models.db import db
from src.services.image_service import upload_profile_image

# Cria um novo Blueprint específico para rotas de usuário
user_api_bp = Blueprint('user_api', __name__)

@user_api_bp.route('/profile-picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    print("--- DEBUG: A ROTA /api/users/profile-picture FOI ACESSADA! ---")
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if 'profile_picture' not in request.files:
        return jsonify({'error': 'Nenhum arquivo de imagem enviado.'}), 400

    file = request.files['profile_picture']
    if file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado.'}), 400

    image_url = upload_profile_image(file, current_user_id)
    if not image_url:
        return jsonify({'error': 'Falha no upload da imagem para o servidor externo.'}), 500

    user.profile_image_url = image_url
    db.session.commit()

    return jsonify({
        'message': 'Foto de perfil atualizada com sucesso!', 
        'profile_image_url': image_url
    }), 200