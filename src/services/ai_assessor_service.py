# src/services/ai_assessor_service.py

import re
import json
from src.models.user import User


# --- Importando TODOS os nossos serviços de resumo ---
from src.services.gemini_service import construir_prompt_assessor, model
from src.services.transacoes_service import get_financial_summary_for_ai
from src.services.credit_card_service import get_credit_card_summary_for_ai
from src.services.goals_service import get_goals_summary_for_ai
from src.services.investments_service import get_investments_summary_for_ai
from src.services.schedule_service import get_schedule_summary_for_ai
from src.services.categorias_service import get_categories_for_ai
from src.services.transacoes_service import get_planning_summary_for_ai

# --- Importando os serviços de AÇÃO ---
from src.services.transacoes_service import criar_lancamento
from src.services.credit_card_service import process_card_payment
from src.services.goals_service import add_value_to_goal
from src.services.investments_service import processar_investimento_whatsapp
from src.services.schedule_service import criar_evento_agenda




def get_ai_response(user_id, historico_chat):
    """
    Função principal que orquestra a conversa com o assessor Simplific.
    """
    usuario = User.query.get(user_id)
    if not usuario:
        return "Usuário não encontrado.", None

    # --- PASSO 1: Montar o "Dossiê Financeiro" ---
    # Chamamos cada função de resumo que criamos na Fase 2
    resumo_planejamento = get_planning_summary_for_ai(user_id)
    resumo_transacoes = get_financial_summary_for_ai(user_id)
    resumo_cartoes = get_credit_card_summary_for_ai(user_id)
    resumo_metas = get_goals_summary_for_ai(user_id)
    resumo_investimentos = get_investments_summary_for_ai(user_id)
    resumo_agenda = get_schedule_summary_for_ai(user_id)
    resumo_categorias = get_categories_for_ai(user_id)

    # Concatena todos os resumos em um único bloco de texto
    contexto_financeiro_completo = (
        f"{resumo_planejamento}\n"
        f"{resumo_transacoes}\n"
        f"{resumo_cartoes}\n"
        f"{resumo_metas}\n"
        f"{resumo_investimentos}\n"
        f"{resumo_agenda}\n"
        f"{resumo_categorias}"
    )

    # --- PASSO 2: Construir o Prompt e Chamar o Gemini ---
    # Usamos a função da Fase 1 para construir o prompt mestre
    prompt = construir_prompt_assessor(usuario.name, contexto_financeiro_completo, historico_chat)
    
    try:
        # Envia o prompt para o modelo Gemini
        resposta_gemini = model.generate_content(prompt).text
    except Exception as e:
        print(f"ERRO: Falha na chamada ao Gemini: {e}")
        return "Tive um problema para me conectar com minha inteligência. Tente novamente em alguns instantes.", None

    # --- PASSO 3: Processar a Resposta do Gemini ---
    texto_para_usuario = resposta_gemini
    acao_a_executar = None

    # Procura pelo bloco [ACTION] na resposta
    match = re.search(r'\[ACTION\]\s*({.*})', resposta_gemini)
    if match:
        json_action_str = match.group(1)
        # Remove o bloco [ACTION] do texto que será enviado ao usuário
        texto_para_usuario = re.sub(r'\[ACTION\]\s*({.*})', '', texto_para_usuario).strip()
        
        try:
            # Tenta decodificar o JSON da ação
            acao_a_executar = json.loads(json_action_str)
        except json.JSONDecodeError:
            print(f"ERRO: Falha ao decodificar o JSON de ação: {json_action_str}")
            # Se o JSON for inválido, ignoramos a ação mas ainda retornamos o texto
            acao_a_executar = None

    # --- PASSO 4: Executar a Ação (se houver) ---
    if acao_a_executar:
        # Aqui poderíamos chamar uma função para executar a ação,
        # mas por enquanto vamos apenas retornar a ação para a rota do WhatsApp lidar com ela.
        # Isso mantém nosso serviço focado apenas na lógica da IA.
        pass

    return texto_para_usuario, acao_a_executar