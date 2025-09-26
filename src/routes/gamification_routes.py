
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.gamification import Achievement, UserAchievement
from src.models.user import User

gamification_bp = Blueprint('gamification', __name__)

@gamification_bp.route('/achievements', methods=['GET'])
@jwt_required()
def get_user_achievements():
    """
    Retorna uma lista de TODAS as conquistas do sistema,
    indicando quais o usuário logado já desbloqueou.
    """
    user_id = get_jwt_identity()

    # 1. Busca todas as conquistas possíveis no sistema
    all_achievements = Achievement.query.order_by(Achievement.id).all()

    # 2. Busca os IDs das conquistas que o usuário já tem
    unlocked_achievements = UserAchievement.query.filter_by(user_id=user_id).all()
    unlocked_ids = {ua.achievement_id for ua in unlocked_achievements}
    unlocked_map = {ua.achievement_id: ua.unlocked_at for ua in unlocked_achievements}

    # 3. Monta a resposta final
    response_data = []
    for ach in all_achievements:
        ach_dict = ach.to_dict()
        is_unlocked = ach.id in unlocked_ids
        ach_dict['unlocked'] = is_unlocked
        ach_dict['unlocked_at'] = unlocked_map.get(ach.id).isoformat() if is_unlocked else None
        response_data.append(ach_dict)

    return jsonify(response_data), 200