from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.marketing_service import MetaAdsService
from src.models.user import User

marketing_bp = Blueprint('marketing', __name__)
ads_service = MetaAdsService()

def is_admin():
    """Verifica se o usuário logado é admin."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and user.profile == 'admin'

# --- NOVA ROTA: DADOS GERAIS (SALDO + PIXEL) ---
@marketing_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_overview():
    """Retorna saldo da conta e dados do Pixel."""
    if not is_admin():
        return jsonify({'error': 'Acesso negado.'}), 403

    # Busca os dados no serviço atualizado
    data = ads_service.get_account_insights()
    return jsonify(data), 200

@marketing_bp.route('/campaigns', methods=['GET'])
@jwt_required()
def list_campaigns():
    if not is_admin(): return jsonify({'error': 'Acesso negado.'}), 403
    campaigns = ads_service.get_campaigns()
    return jsonify(campaigns), 200

@marketing_bp.route('/campaigns/<campaign_id>/toggle', methods=['POST'])
@jwt_required()
def toggle_campaign(campaign_id):
    if not is_admin(): return jsonify({'error': 'Acesso negado.'}), 403
    data = request.get_json()
    success = ads_service.toggle_campaign_status(campaign_id, data.get('status'))
    return jsonify({'message': 'Atualizado'}) if success else (jsonify({'error': 'Erro'}), 500)

@marketing_bp.route('/campaigns/<campaign_id>/budget', methods=['POST'])
@jwt_required()
def update_budget(campaign_id):
    if not is_admin(): return jsonify({'error': 'Acesso negado.'}), 403
    data = request.get_json()
    success = ads_service.update_budget(campaign_id, data.get('budget'))
    return jsonify({'message': 'Atualizado'}) if success else (jsonify({'error': 'Erro'}), 500)