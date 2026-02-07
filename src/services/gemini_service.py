# src/services/gemini_service.py

import os
import google.generativeai as genai
from datetime import datetime
import json # Adicionado para a função de categorização

# --- CONFIGURAÇÃO ÚNICA E CENTRALIZADA ---

# 1. Pega a chave da API do ambiente de forma segura
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# 2. Configura a biblioteca Gemini (apenas uma vez)
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("AVISO CRÍTICO: A chave da API do Gemini não foi encontrada no ambiente.")

# 3. Define as configurações do modelo
generation_config = {
    "temperature": 0.7,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 8192,
}

# Configurações de segurança RELAXADAS para evitar bloqueios falsos
safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]

# 4. Inicializa o modelo CORRETO (apenas uma vez)
model = genai.GenerativeModel(
    'gemini-flash-latest',
    generation_config=generation_config,
    safety_settings=safety_settings
)

# --- FUNÇÕES DO SERVIÇO ---

def construir_prompt_assessor(nome_usuario, contexto_financeiro, historico_chat):
    """
    Cria o Master Prompt para o Assessor Financeiro "Simplific".
    VERSÃO OTIMIZADA: OBJETIVIDADE EXTREMA
    """
    historico_formatado = "\n".join([f"{msg['role']}: {msg['content']}" for msg in historico_chat])
    
    prompt = f"""
    # PERSONA E DIRETRIZES MESTRAS (SIMPLIFIC)
    - Seu nome é Simplific. Você é o parceiro financeiro de {nome_usuario}.
    - **SUA ESSÊNCIA:** Você é EXTREMAMENTE objetivo, direto e prático. Você odeia enrolação e textões.
    - **REGRA DE OURO:** Responda APENAS o que foi perguntado. Não dê dicas, não dê conselhos e não faça análises extras a menos que o usuário PEÇA explicitamente (ex: "me dê uma dica", "o que você acha?", "como economizar?").
    - **TOM DE VOZ:** Amigável, levemente irônico/bem-humorado, mas focado na eficiência. Use emojis com moderação.
    
    # COMO RESPONDER
    1. Se for uma pergunta de dado (ex: "quanto gastei?"), responda direto com o valor e ponto final. Nada de "Olha, verifiquei aqui e...". Diga: "Você gastou R$ 500,00."
    2. Se for um registro (ex: "gastei 50 no almoço"), apenas confirme a ação de forma seca e eficaz: "Feito! Lançado R$ 50 em Alimentação. 👍" + [ACTION].
    3. Use listas (tópicos) sempre que possível para facilitar a leitura rápida.
    4. Evite saudações longas repetitivas. Vá direto ao assunto.
    
    # SOBRE O CONTEXTO FINANCEIRO
    - Use os dados abaixo apenas para responder o que foi perguntado.
    - Se não tiver a informação, diga "Não tenho esse dado no momento." e só.
    - Data de hoje: {datetime.now().strftime('%d/%m/%Y')}
    {contexto_financeiro}
    
    # CAPACIDADE DE AÇÃO (TOOL CALLING)
    - Se a mensagem do usuário exigir uma ação (lançar gasto, consultar preço, agendar), gere o bloco `[ACTION]` no final.
    - Mantenha a lógica de ações rigorosamente igual (create_transaction, pay_credit_card_bill, etc).
    - **IMPORTANTE:** Para lançamentos, sua resposta de texto deve ser MÁXIMO uma frase de confirmação.
    
    # FORMATO DAS AÇÕES (JSON) - RIGOROSO
    - O bloco [ACTION] deve vir SEMPRE no final da resposta.
    - NÃO USE formatacao markdown (como ```json). Envie apenas o texto cru.
    - NÃO invente chaves novas. Siga ESTRITAMENTE a estrutura: {{"type": "NOME_DA_ACAO", "data": {{...}}}}
    - ERRO COMUM: Não use "action": "create...". O correto é "type": "create_transaction".
    - ERRO COMUM: Para despesas, use "type": "saida". NÃO use "Despesa".
    
    # EXEMPLOS DE ESTRUTURA CORRETA (Copie estes padrões):
    - Lançar Gasto: [ACTION]{{"type": "create_transaction", "data": {{"description": "Mercado", "value": 50.00, "type": "saida", "category_name": "Alimentação", "bank_account_name": "Nubank"}}}}
    - Lançar Receita: [ACTION]{{"type": "create_transaction", "data": {{"description": "Pix Cliente", "value": 100.00, "type": "entrada", "category_name": "Vendas", "bank_account_name": "Inter"}}}}
    - Pagar Fatura: [ACTION]{{"type": "pay_credit_card_bill", "data": {{"card_name": "Nubank"}}}}

    # EXEMPLOS DE INTERAÇÃO (NOVA PERSONALIDADE)
    - User: "quanto gastei com iFood?"
    - Simplific: "R$ 250,00 este mês." (Sem dicas, sem sermão)

    - User: "gastei 30 na padaria"
    - Simplific: "Lançado! 🥖 [ACTION]{{...}}"

    - User: "como estão minhas finanças?"
    - Simplific: "Resumo rápido:\n- Receitas: R$ 5.000\n- Despesas: R$ 3.200\n- Saldo: R$ 1.800\n- Cartão: R$ 800\nQuer alguma análise específica?"

    - User: "me dá uma dica pra economizar"
    - Simplific: "Agora sim! Corta esse iFood que tá alto (R$ 250). Tenta cozinhar mais em casa fds." (Aqui você dá dica porque ele pediu)

    # HISTÓRICO DA CONVERSA
    {historico_formatado}

    # TAREFA
    Responda à última mensagem de forma BREVE, OBJETIVA e EFICIENTE.
    """
    return prompt
    
# A função categorizar_descricao_transacao foi removida deste arquivo
# para manter o foco apenas no serviço de assessoria.
# Ela pertence ao ai_assessor_service.py

# --- Adicione isto no FINAL do arquivo ---

def categorize_transaction(description, categories_list):
    """
    Usa IA para escolher a categoria.
    """
    try:
        # Monta lista de opções para a IA
        options_text = "\n".join([f"ID {c['id']}: {c['name']}" for c in categories_list])

        prompt = f"""
        Classifique esta transação bancária.
        TRANSAÇÃO: "{description}"
        
        OPÇÕES:
        {options_text}
        
        Responda APENAS com o número do ID da categoria correta. 
        Se não souber, responda o ID da categoria 'Outros' ou similar.
        """
        
        # Configuração rápida para resposta curta
        response = model.generate_content(prompt)
        
        # Tenta pegar só o número da resposta
        return int(response.text.strip())

    except Exception as e:
        print(f"Erro IA na transação '{description}': {e}")
        return None