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
        category_id=19, # Ajuste este ID se necessário
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


# ==============================================================================
# FUNÇÕES DE GESTÃO DE METAS PARA O ASSISTENTE VISION
# ==============================================================================

def gerenciar_meta_assistente(user_id, goal_name, action, new_target_date=None, new_target_amount=None):
    """
    Permite pausar, reativar, excluir ou renegociar prazo/valor da meta pelo assistente.
    Ações: 'pausar', 'reativar', 'excluir', 'alterar_prazo', 'alterar_valor'
    """
    if not goal_name:
        return {"status": "erro", "mensagem": "Informe o nome da meta a ser gerenciada."}

    action_norm = str(action).strip().lower()
    meta = Goal.query.filter(Goal.user_id == user_id, Goal.name.ilike(f'%{goal_name}%')).first()
    if not meta:
        return {"status": "erro", "mensagem": f"Meta '{goal_name}' não encontrada."}

    try:
        if action_norm in ['pausar', 'pause', 'desativar']:
            meta.is_active = False
            db.session.commit()
            return {"status": "sucesso", "mensagem": f"⏸️ Meta *'{meta.name}'* foi pausada com sucesso. Você pode reativá-la quando quiser!"}

        elif action_norm in ['reativar', 'retomar', 'ativar']:
            meta.is_active = True
            db.session.commit()
            return {"status": "sucesso", "mensagem": f"▶️ Meta *'{meta.name}'* foi reativada com sucesso!"}

        elif action_norm in ['excluir', 'apagar', 'remover', 'cancelar']:
            nome_meta = meta.name
            db.session.delete(meta)
            db.session.commit()
            return {"status": "sucesso", "mensagem": f"🗑️ Meta *'{nome_meta}'* foi excluída permanentemente."}

        elif action_norm in ['alterar_prazo', 'mudar_prazo', 'prazo', 'renegociar_prazo']:
            if not new_target_date:
                return {"status": "erro", "mensagem": "Por favor, informe a nova data limite (AAAA-MM-DD)."}
            from datetime import datetime
            data_limite = datetime.strptime(new_target_date, '%Y-%m-%d').date()
            meta.target_date = data_limite
            db.session.commit()
            data_fmt = data_limite.strftime('%d/%m/%Y')
            return {"status": "sucesso", "mensagem": f"📅 Prazo da meta *'{meta.name}'* atualizado para *{data_fmt}*."}

        elif action_norm in ['alterar_valor', 'mudar_valor', 'valor']:
            if not new_target_amount:
                return {"status": "erro", "mensagem": "Por favor, informe o novo valor alvo da meta."}
            val_novo = abs(float(new_target_amount))
            meta.target_value = val_novo
            db.session.commit()
            val_fmt = format_currency_brl(val_novo)
            return {"status": "sucesso", "mensagem": f"🎯 Valor alvo da meta *'{meta.name}'* atualizado para *{val_fmt}*."}

        else:
            return {"status": "erro", "mensagem": f"Ação '{action}' não suportada para metas."}

    except Exception as e:
        db.session.rollback()
        return {"status": "erro", "mensagem": f"Erro ao gerenciar meta: {e}"}

