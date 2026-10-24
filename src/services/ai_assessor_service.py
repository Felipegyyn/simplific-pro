# src/services/ai_assessor_service.py

import re
import json
from src.models.user import User
from datetime import datetime

# --- Importando TODOS os nossos serviços de resumo ---
from src.services.gemini_service import construir_prompt_assessor, model
from src.services.ai_gateway import generate_agent_response, generate_simple_completion
from src.services.reports_service import get_financial_summary_for_ai
from src.services.credit_card_service import get_credit_card_summary_for_ai
from src.services.goals_service import get_goals_summary_for_ai
from src.services.memory_service import buscar_memorias_relevantes
from src.services.investments_service import get_investments_summary_for_ai
from src.services.schedule_service import get_schedule_summary_for_ai
from src.services.search_service import realizar_pesquisa_web
from src.services.categorias_service import get_categories_for_ai
from src.services.reports_service import get_planning_summary_for_ai

# --- Importando os serviços de AÇÃO ---
from src.services.credit_card_service import process_card_payment
from src.services.goals_service import add_value_to_goal
from src.services.investments_service import processar_investimento_whatsapp
from src.services.schedule_service import criar_evento_agenda
from src.models.financial import Category

def get_ai_response(user_id, historico_chat, nome_usuario_personalizado=None):
    """
    Função principal que orquestra a conversa com o assessor Simplific.
    ROTEAMENTO INTELIGENTE: FreeLLMAPI (Custo Zero) -> Groq -> Gemini (Fallback Oficial).
    """
    usuario = User.query.get(user_id)
    if not usuario:
        return "Usuário não encontrado.", []

    # --- DECISÃO DO NOME ---
    nome_final = nome_usuario_personalizado if nome_usuario_personalizado else usuario.name

    # --- PASSO 1: Montar o "Dossiê Financeiro" ---
    resumo_planejamento = get_planning_summary_for_ai(user_id)
    resumo_transacoes = get_financial_summary_for_ai(user_id)
    resumo_cartoes = get_credit_card_summary_for_ai(user_id)
    resumo_metas = get_goals_summary_for_ai(user_id)
    resumo_investimentos = get_investments_summary_for_ai(user_id)
    resumo_agenda = get_schedule_summary_for_ai(user_id)
    resumo_categorias = get_categories_for_ai(user_id)

    # ▼▼▼ BUSCA AS MEMÓRIAS NO PINECONE ▼▼▼
    ultima_mensagem = historico_chat[-1]['content'] if historico_chat else ""
    memorias_recuperadas = buscar_memorias_relevantes(user_id, ultima_mensagem)

    contexto_financeiro_completo = (
        f"{resumo_planejamento}\n"
        f"{resumo_transacoes}\n"
        f"{resumo_cartoes}\n"
        f"{resumo_metas}\n"
        f"{resumo_investimentos}\n"
        f"{resumo_agenda}\n"
        f"{resumo_categorias}"
        f"{memorias_recuperadas}" # <--- A MEMÓRIA ENTRA AQUI
    )

    # --- PASSO 2: Construir o Prompt e Chamar o AI Gateway (FreeLLMAPI -> Groq -> Gemini) ---
    prompt = construir_prompt_assessor(nome_final, contexto_financeiro_completo, historico_chat)
    
    try:
        texto_para_usuario, acoes_a_executar = generate_agent_response(user_id=usuario.id, prompt=prompt)
    except Exception as e:
        print(f"ERRO CRÍTICO no AI Gateway: {e}")
        return "Tive um problema para me conectar com minha inteligência. Tente novamente.", []

    # Trava de Segurança
    if not texto_para_usuario.strip() and acoes_a_executar:
        texto_para_usuario = "Pronto! Cruzei os dados e já executei todas as ações que você pediu."

    return texto_para_usuario.strip(), acoes_a_executar

# --- FUNÇÕES ORIGINAIS MANTIDAS NO FINAL ---

def categorizar_descricao_transacao(user_id, descricao):
    """
    Usa o Gemini para analisar uma descrição de transação e sugerir a categoria mais apropriada.
    """
    categorias = Category.query.filter_by(user_id=user_id, type='saida').all()
    if not categorias:
        return 'Outros'

    nomes_categorias = [cat.name for cat in categorias]
    if 'Outros' not in nomes_categorias:
        nomes_categorias.append('Outros')
    
    lista_formatada = ", ".join(f"'{nome}'" for nome in nomes_categorias)

    prompt = (
        f"Analise a seguinte descrição de uma transação de extrato bancário: '{descricao}'.\n"
        f"Com base na lista de categorias disponíveis: [{lista_formatada}], qual é a mais adequada?\n"
        f"Se nenhuma categoria se encaixar perfeitamente, escolha 'Outros'.\n"
        f"Responda APENAS com o nome exato de uma das categorias da lista."
    )

    try:
        response_text = generate_simple_completion(prompt, temperature=0.1)
        if not response_text:
            return 'Outros'
        
        categoria_sugerida = response_text.replace("'", "").replace('"', '').strip()

        if categoria_sugerida in nomes_categorias:
            return categoria_sugerida
        else:
            return 'Outros'
            
    except Exception as e:
        print(f"ERRO na categorização com IA: {e}")
        return 'Outros'

def extrair_transacoes_de_texto_com_ia(texto_do_extrato):
    """
    Usa o AI Gateway (FreeLLMAPI -> Groq -> Gemini) para extrair dados estruturados em JSON.
    """
    ano_atual = datetime.now().year

    prompt = f"""
    Você é um assistente especialista em extração de dados financeiros de extratos e comprovantes brasileiros.
    Sua tarefa é analisar o texto abaixo, identificar a transação e retorná-la como um array de objetos JSON.

    REGRAS CRÍTICAS PARA ANÁLISE:
    1.  **Formato de Saída JSON:** Cada objeto JSON no array deve ter: "data" (AAAA-MM-DD), "descricao" (string), "valor" (número flutuante), "conta_origem" (string ou null).
    2.  **Identificando o Documento:**
        * Se for um EXTRATO (várias transações): Mantenha a descrição original de cada linha.
        * Se for um ÚNICO COMPROVANTE (Pix, Transferência, Pagamento): Crie uma descrição clara e objetiva para o usuário. Exemplo: "Pix para João da Silva" ou "Pagamento de Boleto Enel".
    3.  **Determinação do Valor (MUITO IMPORTANTE):**
        * Se for um comprovante de PAGAMENTO ou ENVIO de Pix (o dinheiro SAIU da conta), o valor DEVE ser um número NEGATIVO (Ex: -581.19).
        * Se for um comprovante de RECEBIMENTO (o dinheiro ENTROU na conta), o valor DEVE ser POSITIVO.
    4.  **Conta de Origem:** Procure no texto por nomes de bancos comerciais (ex: "PicPay", "Nubank", "Itaú", "Bradesco"). Retorne apenas o nome comercial. Se não achar, retorne null.
    5.  **Datas:** Se a data estiver incompleta, assuma o ano atual: {ano_atual}.
    6.  **Resposta Pura:** NÃO inclua formatação markdown (como ```json) na resposta, apenas o array JSON cru.

    TEXTO A SER ANALISADO:
    ---
    {texto_do_extrato}
    ---
    """

    try:
        response_text = generate_simple_completion(prompt, temperature=0.1)
        if not response_text:
            return []
        
        json_str = response_text.replace('```json', '').replace('```', '').strip()
        transacoes_extraidas = json.loads(json_str)

        if isinstance(transacoes_extraidas, list):
            return transacoes_extraidas
        else:
            return []

    except (json.JSONDecodeError, TypeError) as e:
        print(f"ERRO ao decodificar a resposta JSON da IA para extração: {e}")
        return []