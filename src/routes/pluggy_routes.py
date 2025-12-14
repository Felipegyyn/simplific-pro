from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.pluggy_service import PluggyService

pluggy_bp = Blueprint('pluggy', __name__)
pluggy_service = PluggyService()

@pluggy_bp.route('/create-token', methods=['POST'])
@jwt_required()
def create_token():
    """
    Gera o token necessário para abrir o Widget da Pluggy no Frontend.
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        # Se vier um item_id, é para editar uma conexão existente.
        # Se não vier nada, é uma conexão nova.
        item_id = data.get('itemId')
        
        token = pluggy_service.create_connect_token(item_id)
        
        return jsonify({'accessToken': token}), 200

    except Exception as e:
        print(f"Erro na rota create-token: {e}")
        return jsonify({'error': 'Erro ao gerar token de conexão'}), 500