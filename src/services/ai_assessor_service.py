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




def get_ai_response(user_id, historico_chat, nome_usuario_personalizado=None):
    """
    Função principal que orquestra a conversa com o assessor Simplific.
    Agora aceita um nome personalizado para contas compartilhadas.
    """
    usuario = User.query.get(user_id)
    if not usuario:
        return "Usuário não encontrado.", None

    # --- DECISÃO DO NOME ---
    # Se veio um nome personalizado (do WhatsApp secundário), usa ele.
    # Senão, usa o nome do cadastro principal.
    nome_final = nome_usuario_personalizado if nome_usuario_personalizado else usuario.name

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
    # Usamos o 'nome_final' para o bot saber com quem está falando
    prompt = construir_prompt_assessor(nome_final, contexto_financeiro_completo, historico_chat)
    
    try:
        # Envia o prompt para o modelo Gemini
        response = model.generate_content(prompt)

        # Adiciona uma verificação de segurança ANTES de tentar ler o texto
        if not response.parts:
            try:
                # Tenta obter o motivo do bloqueio para um log mais claro
                finish_reason = response.candidates[0].finish_reason
                print(f"AVISO: A resposta do Gemini foi bloqueada. Motivo: {finish_reason.name}")
            except (IndexError, AttributeError):
                print("AVISO: A resposta do Gemini foi bloqueada (resposta vazia).")

            # Retorna uma mensagem amigável para o usuário
            return "Não consegui processar sua solicitação devido às políticas de segurança. Por favor, tente reformular sua pergunta.", None

        resposta_gemini = response.text
    
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
        # A ação será retornada para o controller (route) executar
        pass

    if not texto_para_usuario and not acao_a_executar:
        print("AVISO: get_ai_response está retornando uma resposta vazia. Forçando mensagem de erro.")
        texto_para_usuario = "Opa! Não consegui entender sua solicitação no momento. Pode tentar reformular?"

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

        if not response.parts:
            print(f"AVISO: Resposta do Gemini para categorizar '{descricao}' foi bloqueada.")
            return 'Outros' # Retorna um valor seguro
        
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

    # Dentro de src/services/ai_assessor_service.py, na função extrair_transacoes_de_texto_com_ia

    prompt = f"""
    Você é um assistente especialista em extração de dados financeiros de extratos bancários brasileiros.
    Sua tarefa é analisar o texto abaixo, identificar CADA transação (entrada ou saída) e retorná-las como um array de objetos JSON.

    REGRAS CRÍTICAS PARA ANÁLISE E FORMATO DA RESPOSTA:
    1.  **Ignorar Conteúdo Não Transacional:** Desconsidere totalmente cabeçalhos, rodapés, "Saldo Anterior", "Saldo do Dia", "Saldo Bloqueado", "Aplicacao Financeira", "Rendimentos", "Tributos", ou qualquer linha que não seja uma transação financeira explícita de débito ou crédito.
    2.  **Formato de Saída JSON:** Cada objeto JSON no array deve ter EXATAMENTE as seguintes chaves: "data" (string, no formato "AAAA-MM-DD"), "descricao" (string), e "valor" (número de ponto flutuante).
    3.  **Determinação do Valor:**
        * Para despesas/débitos (saídas), o valor deve ser um número NEGATIVO. (Ex: -159.00)
        * Para receitas/créditos (entradas), o valor deve ser um número POSITIVO. (Ex: 159.00)
        * Observe indicadores como "D", "C", "DÉB", "CRÉD", "-" ou ausência de sinal para determinar o tipo da transação e o sinal do valor.
    4.  **Datas:**
        * Se a data estiver incompleta (apenas dia/mês, ex: "03/01"), assuma o ano atual: {ano_atual}.
        * Se a descrição contiver "DD/MM" ou "MM/AAAA", como "TAR PLANO ADAPT 1 06/25", priorize a data explícita da linha. Se a data da linha for mais genérica, e a descrição indicar um mês/ano específico para a transação, use o ano e mês da descrição com o dia da transação, se plausível. Caso contrário, use a data da linha com o ano atual.
    5.  **Valores Numéricos:** Converta todos os valores para o formato numérico padrão (usando ponto como separador decimal). Por exemplo, "1.638,46" deve virar 1638.46, e "404,54C" deve virar 404.54.
    6.  **Resposta Pura:** NÃO inclua qualquer texto introdutório, explicações ou formatação adicional na sua resposta, além do array JSON puro.
    7.  **Array Vazio:** Se nenhuma transação for encontrada após seguir todas as regras, retorne um array JSON vazio: [].

    TEXTO DO EXTRATO A SER ANALISADO:
    ---
    {texto_do_extrato}
    ---
    """

    try:
        # Chama o modelo de IA diretamente para esta tarefa específica
        response = model.generate_content(prompt)

        if not response.parts:
            print(f"AVISO: Resposta do Gemini para extrair transações foi bloqueada.")
            return [] # Retorna uma lista vazia segura
        resposta_ia_texto = response.text

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