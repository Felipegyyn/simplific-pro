# src/services/achievement_service.py

from src.models.db import db
from src.models.user import User
from src.models.financial import Transaction, Planning
from src.models.extended import Goal, Investment
from src.models.gamification import Achievement, UserAchievement
from datetime import date
from dateutil.relativedelta import relativedelta
from sqlalchemy import func

# --- FUNÇÃO AUXILIAR PARA CONCEDER UMA CONQUISTA ---

def _grant_achievement(user, achievement_key):
    """
    Verifica se um usuário já possui uma conquista e, se não, a concede.
    Retorna True se uma nova conquista foi concedida, False caso contrário.
    """
    # 1. Busca a definição da conquista no nosso catálogo
    achievement = Achievement.query.filter_by(key=achievement_key).first()
    if not achievement:
        return False # Conquista não encontrada no catálogo

    # 2. Verifica se o usuário já tem essa conquista para não duplicar
    has_achievement = UserAchievement.query.filter_by(
        user_id=user.id,
        achievement_id=achievement.id
    ).first()

    if not has_achievement:
        # 3. Se não tiver, cria o registro e salva no banco
        new_user_achievement = UserAchievement(
            user_id=user.id,
            achievement_id=achievement.id
        )
        db.session.add(new_user_achievement)
        print(f"🏆 Conquista '{achievement.name}' desbloqueada para o usuário {user.email}!")
        return True
    return False

# --- FUNÇÕES DE VERIFICAÇÃO (AS REGRAS DO JOGO) ---

def _check_first_transaction(user):
    if Transaction.query.filter_by(user_id=user.id).first():
        _grant_achievement(user, 'FIRST_TRANSACTION')

def _check_first_plan(user):
    if Planning.query.filter_by(user_id=user.id).first():
        _grant_achievement(user, 'FIRST_PLAN')

def _check_first_goal(user):
    if Goal.query.filter_by(user_id=user.id).first():
        _grant_achievement(user, 'FIRST_GOAL')

def _check_first_investment(user):
    if Investment.query.filter_by(user_id=user.id).first():
        _grant_achievement(user, 'FIRST_INVESTMENT')

def _check_budget_master_1(user):
    # Lógica para verificar o orçamento do mês anterior completo
    today = date.today()
    start_of_last_month = (today.replace(day=1) - relativedelta(months=1))
    end_of_last_month = (today.replace(day=1) - relativedelta(days=1))

    # Busca o planejado vs. realizado do mês anterior
    planned = db.session.query(Planning.category_id, func.sum(Planning.value).label('total_planned')) \
        .filter(Planning.user_id == user.id, Planning.date.between(start_of_last_month, end_of_last_month), Planning.type == 'saida') \
        .group_by(Planning.category_id).all()
    
    if not planned: # Se não houver planejamento, não pode ganhar a conquista
        return

    realized = db.session.query(Transaction.category_id, func.sum(Transaction.value).label('total_realized')) \
        .filter(Transaction.user_id == user.id, Transaction.date.between(start_of_last_month, end_of_last_month), Transaction.type == 'saida', Transaction.status == 'confirmada') \
        .group_by(Transaction.category_id).all()

    planned_map = {p.category_id: p.total_planned for p in planned}
    realized_map = {r.category_id: r.total_realized for r in realized}

    # Verifica se algum gasto extrapolou o planejado
    for category_id, total_planned in planned_map.items():
        total_realized = realized_map.get(category_id, 0)
        if total_realized > total_planned:
            return # Se estourou um, já para a verificação

    # Se chegou até aqui, o usuário cumpriu a meta
    _grant_achievement(user, 'BUDGET_MASTER_1')

def _check_saver_1(user):
    # Lógica para verificar o saldo do mês anterior completo
    today = date.today()
    start_of_last_month = (today.replace(day=1) - relativedelta(months=1))
    end_of_last_month = (today.replace(day=1) - relativedelta(days=1))

    totals = db.session.query(
        func.sum(case((Transaction.type == 'entrada', Transaction.value), else_=0)).label('total_revenue'),
        func.sum(case((Transaction.type == 'saida', Transaction.value), else_=0)).label('total_expense')
    ).filter(
        Transaction.user_id == user.id,
        Transaction.date.between(start_of_last_month, end_of_last_month),
        Transaction.status == 'confirmada'
    ).one()

    if totals.total_revenue is not None and totals.total_expense is not None:
        if (totals.total_revenue - totals.total_expense) > 0:
            _grant_achievement(user, 'SAVER_1')

# --- FUNÇÃO PRINCIPAL (ORQUESTRADOR) ---

def check_all_achievements_for_user(user):
    """
    Orquestra a verificação de todas as conquistas para um usuário específico.
    """
    # Cria um conjunto com as chaves das conquistas que o usuário já tem
    unlocked_keys = {ua.achievement.key for ua in user.achievements.all()}

    # Mapeia as chaves das conquistas para suas funções de verificação
    achievement_checks = {
        'FIRST_TRANSACTION': _check_first_transaction,
        'FIRST_PLAN': _check_first_plan,
        'FIRST_GOAL': _check_first_goal,
        'FIRST_INVESTMENT': _check_first_investment,
        'BUDGET_MASTER_1': _check_budget_master_1,
        'SAVER_1': _check_saver_1,
    }

    # Itera sobre as possíveis conquistas e verifica apenas as que o usuário ainda não tem
    for key, check_function in achievement_checks.items():
        if key not in unlocked_keys:
            check_function(user)
    
    # A conquista 'FIRST_LOGIN' será concedida em outro momento (ex: no primeiro login)
    # por isso não está no loop de verificação diária.