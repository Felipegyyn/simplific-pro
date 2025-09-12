# src/services/ai_assessor_service.py

import re
import json
from src.models.user import User
from datetime import datetime


# --- Importando TODOS os nossos serviços de resumo ---
from src.services.gemini_service import construir_prompt_assessor, model
from src.services.reports_service import get_financial_summary_for_ai
from src.services.credit_card_service import get_credit_card_summary_for_ai
from src.services.goals_service import get_goals_summary_for_ai
from src.services.investments_service import get_investments_summary_for_ai
from src.services.schedule_service import get_schedule_summary_for_ai
from src.services.categorias_service import get_categories_for_ai
from src.services.reports_service import get_planning_summary_for_ai

# --- Importando os serviços de AÇÃO ---
from src.services.credit_card_service import process_card_payment
from src.services.goals_service import add_value_to_goal
from src.services.investments_service import processar_investimento_whatsapp
from src.services.schedule_service import criar_evento_agenda
from src.models.financial import Category




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


# ▼▼▼ ADICIONE ESTA NOVA FUNÇÃO NO FINAL DO ARQUIVO ▼▼▼

def categorizar_descricao_transacao(user_id, descricao):
    """
    Usa o Gemini para analisar uma descrição de transação e sugerir a categoria mais apropriada.
    """
    # 1. Busca todas as categorias de 'saida' do usuário
    categorias = Category.query.filter_by(user_id=user_id, type='saida').all()
    if not categorias:
        # Se o usuário não tiver categorias, retorna 'Outros' por padrão.
        return 'Outros'

    # 2. Formata a lista de categorias para incluir no prompt
    # Usamos uma lista simples de nomes para a IA.
    nomes_categorias = [cat.name for cat in categorias]
    # Garante que 'Outros' seja sempre uma opção válida.
    if 'Outros' not in nomes_categorias:
        nomes_categorias.append('Outros')
    
    lista_formatada = ", ".join(f"'{nome}'" for nome in nomes_categorias)

    # 3. Cria o prompt para a IA
    prompt = (
        f"Analise a seguinte descrição de uma transação de extrato bancário: '{descricao}'.\n"
        f"Com base na lista de categorias disponíveis: [{lista_formatada}], qual é a mais adequada?\n"
        f"Se nenhuma categoria se encaixar perfeitamente, escolha 'Outros'.\n"
        f"Responda APENAS com o nome exato de uma das categorias da lista."
    )

    try:
        # 4. Chama a IA e obtém a resposta
        response = model.generate_content(prompt)
        
        # 5. Limpa e valida a resposta da IA
        categoria_sugerida = response.text.strip().replace("'", "").replace('"', '')

        # Garante que a IA não "inventou" uma categoria que não existe
        if categoria_sugerida in nomes_categorias:
            return categoria_sugerida
        else:
            # Se a IA sugerir algo que não está na lista, usamos 'Outros' por segurança
            print(f"AVISO: IA sugeriu categoria não existente ('{categoria_sugerida}'). Usando 'Outros'.")
            return 'Outros'
            
    except Exception as e:
        print(f"ERRO na categorização com IA: {e}")
        # Em caso de erro na API da IA, retorna 'Outros' como fallback
        return 'Outros'

def extrair_transacoes_de_texto_com_ia(texto_do_extrato):
    """
    Usa o Gemini para analisar um bloco de texto de um extrato e retornar
    uma lista estruturada de transações em formato JSON.
    """
    ano_atual = datetime.now().year

    prompt = f"""
    Você é um assistente especialista em extração de dados financeiros de textos não estruturados de extratos bancários brasileiros.
    Sua tarefa é analisar o texto abaixo, identificar CADA transação (entrada ou saída) e retorná-las como um array de objetos JSON.

    REGRAS IMPORTANTES:
    1. Ignore linhas que são cabeçalhos, totais, saldos ou texto informativo. Foque apenas nas linhas de transação individuais.
    2. Cada objeto JSON no array deve ter EXATAMENTE as seguintes chaves: "data" (no formato "AAAA-MM-DD"), "descricao" (string), e "valor" (número de ponto flutuante).
    3. Para despesas/débitos, o valor deve ser um número NEGATIVO.
    4. Para receitas/créditos, o valor deve ser um número POSITIVO.
    5. Se uma data não tiver o ano, assuma o ano atual: {ano_atual}.
    6. Se você não encontrar NENHUMA transação, retorne um array JSON vazio: [].
    7. NÃO inclua nada na sua resposta além do array JSON. Sem explicações, sem texto introdutório, apenas o JSON.

    TEXTO DO EXTRATO:
    ---
    {texto_do_extrato}
    ---
    """

    try:
        # Chama o modelo de IA diretamente para esta tarefa específica
        resposta_ia_texto = model.generate_content(prompt).text

        # Limpa a resposta para garantir que seja um JSON válido
        json_str = resposta_ia_texto.strip().replace('```json', '').replace('```', '')

        transacoes_extraidas = json.loads(json_str)

        if isinstance(transacoes_extraidas, list):
            return transacoes_extraidas
        else:
            return []

    except (json.JSONDecodeError, TypeError) as e:
        print(f"ERRO ao decodificar a resposta JSON da IA para extração: {e}")
        return []