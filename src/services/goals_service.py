# src/services/goals_service.py

from src.models.db import db
from src.models.financial import Transaction
from src.models.extended import Goal # Usando o modelo que você enviou
from datetime import date
from decimal import Decimal

def format_currency_brl(value):
    """
    Formata um número como moeda brasileira (R$), de forma independente do locale do sistema.
    Ex: 1234.5 -> 'R$ 1.234,50'
    """
    if value is None:
        value = 0
    # Formata o número com 2 casas decimais, usando vírgula como separador decimal
    # e ponto como separador de milhar.
    formatted_value = "{:,.2f}".format(value).replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {formatted_value}"

def get_user_goals(user_id):
    """Busca todas as metas ativas de um usuário e retorna seus detalhes."""
    goals = Goal.query.filter_by(user_id=user_id, is_active=True).all()
    
    # Usa a função to_dict() do seu modelo, que já é excelente
    return [goal.to_dict() for goal in goals]

def add_value_to_goal(user_id, goal_id, value):
    """
    Adiciona um valor a uma meta e cria a despesa correspondente.
    Retorna (True, "mensagem") ou (False, "mensagem").
    """
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return False, "Meta não encontrada."

    value_float = float(value)

    # 1. Cria a despesa para registrar a saída do dinheiro
    # IMPORTANTE: Verifique se o ID da sua categoria "Metas" ou "Investimentos" é 7.
    nova_despesa = Transaction(
        user_id=user_id,
        description=f"Aplicação na meta: {goal.name}",
        type='saida',
        category_id=4, # Ajuste este ID se necessário
        value=value_float,
        status='confirmada',
        date=date.today(),
        format='Dinheiro',
        payment_form='Transferência'
    )
    db.session.add(nova_despesa)
    
    # 2. Atualiza o valor atual da meta
    goal.current_value += value_float

    try:
        db.session.commit()
        return True, f"Valor adicionado com sucesso à meta '{goal.name}'!"
    except Exception as e:
        db.session.rollback()
        print(f"ERRO ao adicionar valor à meta: {e}")
        return False, "Ocorreu um erro no banco de dados."

# Em src/services/goals_service.py

def get_goals_summary_for_ai(user_id):
    """Gera um resumo textual das metas financeiras para a IA."""
    metas = get_user_goals(user_id) # Reutiliza a função existente
    if not metas:
        return "Metas: Nenhuma meta ativa no momento."

    resumos = []
    for meta in metas:
        resumos.append(
            f"'{meta['name']}' (Progresso: {meta['progress_percentage']:.1f}%, "
            f"{format_currency_brl(meta['current_value'])} de {format_currency_brl(meta['target_value'])})"
        )
    
    return "Metas: " + ", ".join(resumos) + "."
