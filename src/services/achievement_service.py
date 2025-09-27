# src/services/achievement_service.py

from src.models.db import db
from src.models.user import User
from src.models.financial import Transaction, Planning
from src.models.extended import Goal, Investment
from src.models.gamification import Achievement, UserAchievement
from datetime import date
from dateutil.relativedelta import relativedelta
from sqlalchemy import func, case

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
        'FIRST_GOAL_COMPLETED': _check_first_goal_completed,
        'DIVERSIFIED_INVESTOR': _check_diversified_investor,

        'BUDGET_MASTER_1': lambda u: _check_consecutive_months_budget(u, 1, 'BUDGET_MASTER_1'),
        'BUDGET_MASTER_3': lambda u: _check_consecutive_months_budget(u, 3, 'BUDGET_MASTER_3'),
        'BUDGET_MASTER_6': lambda u: _check_consecutive_months_budget(u, 6, 'BUDGET_MASTER_6'),
        'SAVER_1': lambda u: _check_consecutive_months_saver(u, 1, 'SAVER_1'),
        'SAVER_3': lambda u: _check_consecutive_months_saver(u, 3, 'SAVER_3'),
    }

    # Itera sobre as possíveis conquistas e verifica apenas as que o usuário ainda não tem
    for key, check_function in achievement_checks.items():
        if key not in unlocked_keys:
            check_function(user)
    
    # A conquista 'FIRST_LOGIN' será concedida em outro momento (ex: no primeiro login)
    # por isso não está no loop de verificação diária.

# ▼▼▼ COLE O BLOCO DE NOVAS FUNÇÕES AQUI ▼▼▼

def _check_first_goal_completed(user):
    """Verifica se o usuário completou alguma meta pela primeira vez."""
    if Goal.query.filter_by(user_id=user.id, is_completed=True).first():
        _grant_achievement(user, 'FIRST_GOAL_COMPLETED')

def _check_diversified_investor(user):
    """Verifica se o usuário possui pelo menos 3 tipos diferentes de investimentos."""
    investment_types_count = db.session.query(Investment.type).filter_by(user_id=user.id).distinct().count()
    if investment_types_count >= 3:
        _grant_achievement(user, 'DIVERSIFIED_INVESTOR')

def _check_consecutive_months_budget(user, months_required, achievement_key):
    """
    Função auxiliar genérica para verificar se o orçamento foi respeitado
    por um número X de meses consecutivos.
    """
    today = date.today()
    for i in range(months_required):
        # Itera para trás, do mês passado até 'months_required' meses atrás
        target_month_start = (today.replace(day=1) - relativedelta(months=i+1))
        target_month_end = (today.replace(day=1) - relativedelta(months=i) - relativedelta(days=1))

        planned = db.session.query(func.sum(Planning.value).label('total')) \
            .filter(Planning.user_id == user.id, Planning.date.between(target_month_start, target_month_end), Planning.type == 'saida').scalar()

        # Se não houve planejamento para um dos meses no período, a sequência é quebrada.
        if planned is None or planned == 0:
            return 

        realized = db.session.query(func.sum(Transaction.value).label('total')) \
            .filter(Transaction.user_id == user.id, Transaction.date.between(target_month_start, target_month_end), Transaction.type == 'saida', Transaction.status == 'confirmada').scalar() or 0

        # Se em qualquer mês o gasto foi maior que o planejado, a sequência é quebrada.
        if realized > planned:
            return

    # Se o loop terminar sem interrupção, o usuário cumpriu o requisito.
    _grant_achievement(user, achievement_key)

def _check_consecutive_months_saver(user, months_required, achievement_key):
    """
    Função auxiliar genérica para verificar se o saldo foi positivo
    por um número X de meses consecutivos.
    """
    today = date.today()
    for i in range(months_required):
        target_month_start = (today.replace(day=1) - relativedelta(months=i+1))
        target_month_end = (today.replace(day=1) - relativedelta(months=i) - relativedelta(days=1))

        totals = db.session.query(
            func.sum(case((Transaction.type == 'entrada', Transaction.value), else_=0)).label('rev'),
            func.sum(case((Transaction.type == 'saida', Transaction.value), else_=0)).label('exp')
        ).filter(
            Transaction.user_id == user.id,
            Transaction.date.between(target_month_start, target_month_end),
            Transaction.status == 'confirmada'
        ).one()

        revenue = totals.rev or 0
        expense = totals.exp or 0

        # Se em qualquer mês o saldo for negativo ou zero, a sequência é quebrada.
        if (revenue - expense) <= 0:
            return

    # Se o loop terminar, o usuário cumpriu o requisito.
    _grant_achievement(user, achievement_key)

# ▲▲▲ FIM DO BLOCO ▲▲▲