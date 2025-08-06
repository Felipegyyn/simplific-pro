from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from src.services.goals_service import add_value_to_goal
from src.models.db import db
from src.models.extended import Goal

goals_bp = Blueprint('goals', __name__)

@goals_bp.route('/goals', methods=['GET'])
@jwt_required()
def get_goals():
    user_id = get_jwt_identity()
    goals = Goal.query.filter_by(user_id=user_id).all()
    return jsonify([goal.to_dict() for goal in goals])

@goals_bp.route('/goals', methods=['POST'])
@jwt_required()
def create_goal():
    user_id = get_jwt_identity()
    data = request.json

    # 1. Captura TODOS os campos enviados pelo frontend
    name = data.get('name')
    description = data.get('description')
    target_value_str = data.get('target_value')
    current_value_str = data.get('current_value', 0.0)
    target_date_str = data.get('target_date')
    category = data.get('category')
    priority = data.get('priority')
    image_url = data.get('image_url') # <-- ADICIONE ESTA LINHA

    # 2. Validação mais completa, incluindo os novos campos obrigatórios
    if not all([name, target_value_str, target_date_str, category]):
        return jsonify({'error': 'Nome, Valor Alvo, Data Meta e Categoria são obrigatórios'}), 400

    # 3. Conversão de tipos segura para evitar erros 500
    try:
        target_value = float(target_value_str)
        current_value = float(current_value_str)
        target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return jsonify({'error': 'Formato de valor ou data inválido'}), 400

    # 4. Cria o objeto Goal com TODOS os dados
    goal = Goal(
        user_id=user_id,
        name=name,
        description=description,
        target_value=target_value,
        current_value=current_value,
        target_date=target_date,
        category=category,
        priority=priority,
        image_url=image_url # <-- ADICIONE ESTA LINHA
        # Assumindo que o seu modelo 'Goal' tem todas essas colunas.
    )

    db.session.add(goal)
    db.session.commit()

    return jsonify(goal.to_dict()), 201

@goals_bp.route('/goals/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    user_id = get_jwt_identity()
    
    # Busca a meta, garantindo que pertence ao usuário logado
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()

    if not goal:
        return jsonify({'error': 'Meta não encontrada'}), 404

    data = request.json

    # Atualiza os campos apenas se eles foram enviados na requisição
    # Isso torna a rota flexível para atualizar qualquer parte da meta
    if 'name' in data:
        goal.name = data['name']
    if 'description' in data:
        goal.description = data['description']
    if 'target_value' in data:
        goal.target_value = float(data['target_value'])
    if 'current_value' in data:
        goal.current_value = float(data['current_value'])
    if 'target_date' in data:
        goal.target_date = datetime.strptime(data['target_date'], '%Y-%m-%d').date()
    if 'category' in data:
        goal.category = data['category']
    if 'priority' in data:
        goal.priority = data['priority']
    if 'is_active' in data:
        goal.is_active = data['is_active']
    if 'image_url' in data: # <-- ADICIONE ESTE BLOCO
        goal.image_url = data['image_url']

    
    try:
        db.session.commit()
        return jsonify(goal.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar meta: {str(e)}'}), 500

# Em src/routes/goals.py

# ▼▼▼ ADICIONE ESTA NOVA ROTA ABAIXO ▼▼▼
@goals_bp.route('/goals/<int:goal_id>/contribute', methods=['POST'])
@jwt_required()
def contribute_to_goal(goal_id):
    """
    Rota específica para adicionar um valor a uma meta.
    Ela chama o serviço que atualiza a meta E cria a despesa.
    """
    user_id = get_jwt_identity()
    data = request.json
    amount_to_add = data.get('amount')

    if not amount_to_add or float(amount_to_add) <= 0:
        return jsonify({'error': 'O valor a ser adicionado é inválido.'}), 400

    # Chama a mesma função de serviço que o WhatsApp usa!
    success, message = add_value_to_goal(user_id, goal_id, amount_to_add)

    if success:
        # Busca a meta atualizada para retornar os dados mais recentes à plataforma
        updated_goal = Goal.query.get(goal_id)
        return jsonify(updated_goal.to_dict()), 200
    else:
        return jsonify({'error': message}), 400
# ▲▲▲ FIM DA NOVA ROTA ▲▲▲

@goals_bp.route('/goals/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()

    if not goal:
        return jsonify({'error': 'Meta não encontrada'}), 404

    db.session.delete(goal)
    db.session.commit()

    return '', 204

