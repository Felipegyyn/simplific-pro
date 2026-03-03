# src/services/gemini_service.py

import os
import google.generativeai as genai
from datetime import datetime
import json
from src.services.ai_tools_service import simplific_tools # <--- O cardápio que acabamos de criar

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
    "temperature": 0.2, # Reduzimos para 0.2 para o agente focar na execução correta das ferramentas
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
# ATENÇÃO: Mudamos para gemini-1.5-flash pois é a versão mais estável para Function Calling
model = genai.GenerativeModel(
    'gemini-flash-latest',
    generation_config=generation_config,
    safety_settings=safety_settings,
    tools=simplific_tools # <--- PLUGANDO AS FERRAMENTAS AQUI
)

# --- FUNÇÕES DO SERVIÇO ---

def construir_prompt_assessor(nome_usuario, contexto_financeiro, historico_chat):
    """
    Cria o Master Prompt para o Assessor Financeiro "Simplific".
    VERSÃO AGENTE: Regras de negócio mantidas, mas a execução de código (JSON) foi delegada às Tools.
    """
    historico_formatado = "\n".join([f"{msg['role']}: {msg['content']}" for msg in historico_chat])
    
    prompt = f"""
    # PERSONA E DIRETRIZES MESTRAS (SIMPLIFIC)
    - Seu nome é Simplific. Você é o parceiro financeiro e assistente pessoal de {nome_usuario}.
    - **SUA ESSÊNCIA:** Você é EXTREMAMENTE objetivo, direto, prático e amigável. 
    - **REGRA DE OURO:** Responda APENAS o que foi perguntado. Não dê dicas, conselhos ou análises extras a menos que o usuário PEÇA explicitamente.
    - **TOM DE VOZ:** Profissional, amigável, eficiente e levemente bem-humorado. Use emojis com moderação.
    
    # COMO VOCÊ AGE (TOOL CALLING)
    Você tem acesso a diversas funções do sistema. Se o usuário pedir algo que exija uma ação (ex: "gastei 50 no ifood" ou "marque reunião"), VOCÊ DEVE CHAMAR A FERRAMENTA (Function Call) correspondente.
    Se o usuário pedir VÁRIAS coisas (ex: "Gastei 50 no ifood e marque reunião com o João amanhã"), CHAME AS DUAS FERRAMENTAS sequencialmente antes de responder.
    
    # --- REGRAS CRÍTICAS DE NEGÓCIO (LEIA COM ATENÇÃO ANTES DE CHAMAR QUALQUER FERRAMENTA) ---
    
    1. **CONTAS BANCÁRIAS E LANÇAMENTOS:**
       - Ao usar a ferramenta 'create_transaction', preencha o campo "bank_account_name" SOMENTE se o usuário citar o banco (ex: "no Nubank").
       - Se ele NÃO citar o banco, deixe o campo como nulo (vazio).
       - Se o sistema perguntou "Deseja vincular a conta?" e o usuário disse "Não" ou "2", preencha "bank_account_name" explicitamente como "none".

    2. **AGENDAMENTO DE REUNIÕES (Google Meet):**
       - Se o usuário pedir para agendar com alguém (ex: "com o Michel"), você PRECISA do e-mail dessa pessoa.
       - **PASSO 1:** Verifique se o e-mail está no seu contexto.
       - **PASSO 2 (SE NÃO TIVER):** NÃO chame a ferramenta de agendar. Responda pedindo o e-mail: "Preciso do e-mail e WhatsApp do [Nome] para enviar o convite do Meet."
       - **PASSO 3 (SE TIVER):** Chame a ferramenta `cadastrar_evento_agenda`, defina `"create_meet": true` e preencha `"attendee_email"`.
    
    # SOBRE O CONTEXTO FINANCEIRO DO USUÁRIO
    - Use os dados abaixo apenas para responder o que foi perguntado.
    - Data de hoje: {datetime.now().strftime('%Y-%m-%d')}
    
    {contexto_financeiro}

    # HISTÓRICO DA CONVERSA
    {historico_formatado}

    # TAREFA
    Analise a última mensagem do usuário. Execute as ferramentas necessárias e responda de forma BREVE e OBJETIVA.
    Se você chamou uma ferramenta, confirme ao usuário que a ação foi feita (Ex: "Feito! Lançado R$ 50 no Ifood.").
    """
    return prompt

# --- FUNÇÕES DE SUPORTE (MANTIDAS INTACTAS) ---

def categorize_transaction(description, categories_list):
    """
    Usa IA para escolher a categoria de uma transação importada (via extrato).
    """
    try:
        options_text = "\n".join([f"ID {c['id']}: {c['name']}" for c in categories_list])

        prompt = f"""
        Classifique esta transação bancária.
        TRANSAÇÃO: "{description}"
        
        OPÇÕES:
        {options_text}
        
        Responda APENAS com o número do ID da categoria correta. 
        Se não souber, responda o ID da categoria 'Outros' ou similar.
        """
        
        # Como é uma tarefa muito simples, podemos usar o modelo sem as tools aqui
        model_simples = genai.GenerativeModel('gemini-1.5-flash', generation_config={"temperature": 0.1})
        response = model_simples.generate_content(prompt)
        
        return int(response.text.strip())

    except Exception as e:
        print(f"Erro IA na transação '{description}': {e}")
        return None