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

@marketing_bp.route('/campaigns', methods=['GET'])
@jwt_required()
def list_campaigns():
    """Lista todas as campanhas ativas e métricas."""
    if not is_admin():
        return jsonify({'error': 'Acesso negado. Apenas Admin.'}), 403

    campaigns = ads_service.get_campaigns()
    return jsonify(campaigns), 200

@marketing_bp.route('/campaigns/<campaign_id>/toggle', methods=['POST'])
@jwt_required()
def toggle_campaign(campaign_id):
    """Liga ou Desliga uma campanha (ACTIVE / PAUSED)."""
    if not is_admin():
        return jsonify({'error': 'Acesso negado.'}), 403

    data = request.get_json()
    new_status = data.get('status') # Espera 'ACTIVE' ou 'PAUSED'

    if new_status not in ['ACTIVE', 'PAUSED']:
        return jsonify({'error': 'Status inválido. Use ACTIVE ou PAUSED.'}), 400

    success = ads_service.toggle_campaign_status(campaign_id, new_status)
    
    if success:
        return jsonify({'message': 'Status atualizado com sucesso!'}), 200
    else:
        return jsonify({'error': 'Erro ao atualizar status no Facebook.'}), 500

@marketing_bp.route('/campaigns/<campaign_id>/budget', methods=['POST'])
@jwt_required()
def update_budget(campaign_id):
    """Atualiza o orçamento diário (Valor em R$)."""
    if not is_admin():
        return jsonify({'error': 'Acesso negado.'}), 403

    data = request.get_json()
    new_budget = data.get('budget') # Espera um float, ex: 50.00

    if not new_budget or float(new_budget) < 5.00: # Mínimo R$ 5,00 por segurança
        return jsonify({'error': 'Orçamento inválido (Mínimo R$ 5,00).'}), 400

    success = ads_service.update_budget(campaign_id, new_budget)
    
    if success:
        return jsonify({'message': 'Orçamento atualizado com sucesso!'}), 200
    else:
        return jsonify({'error': 'Erro ao atualizar orçamento no Facebook.'}), 500