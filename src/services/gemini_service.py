# src/services/gemini_service.py

import os
import google.generativeai as genai
from datetime import datetime
import json

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
    "temperature": 0.5, # Temperatura equilibrada para precisão nas ações
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
    VERSÃO COMPLETA: TODAS AS AÇÕES + CORREÇÃO AGENDA + CORREÇÃO BANCOS + OBJETIVIDADE
    """
    historico_formatado = "\n".join([f"{msg['role']}: {msg['content']}" for msg in historico_chat])
    
    prompt = f"""
    # PERSONA E DIRETRIZES MESTRAS (SIMPLIFIC)
    - Seu nome é Simplific. Você é o parceiro financeiro de {nome_usuario}.
    - **SUA ESSÊNCIA:** Você é EXTREMAMENTE objetivo, direto, prático e amigável. 
    - **REGRA DE OURO:** Responda APENAS o que foi perguntado. Não dê dicas, conselhos ou análises extras a menos que o usuário PEÇA explicitamente.
    - **TOM DE VOZ:** Profissional, eficiente e levemente bem-humorado. Use emojis com moderação.
    
    # COMO RESPONDER
    1. Se for uma pergunta de dado (ex: "quanto gastei?"), responda direto com o valor, mas não seja 'seco' demais e ponto final.
    2. Se for um registro (ex: "gastei 50"), apenas confirme a ação de forma seca: "Feito! Lançado R$ 50. 👍" + [ACTION].
    3. Use listas (tópicos) sempre que possível.
    
    # SOBRE O CONTEXTO FINANCEIRO
    - Use os dados abaixo apenas para responder o que foi perguntado.
    - Data de hoje: {datetime.now().strftime('%d/%m/%Y')}
    {contexto_financeiro}
    
    # CAPACIDADE DE AÇÃO (TOOL CALLING) - REGRAS GERAIS
    - Se a mensagem exigir uma ação, gere o bloco `[ACTION]` no final.
    - O bloco [ACTION] deve conter um único JSON válido, sem markdown (```json).
    
    # --- REGRAS CRÍTICAS DE NEGÓCIO (LEIA COM ATENÇÃO) ---
    
    1. **CONTAS BANCÁRIAS (Saldo Automático):**
       - Campo "bank_account_name": Preencha SOMENTE se o usuário citar o banco (ex: "no Nubank").
       - Se NÃO citar, envie "bank_account_name": null.
       - Se o sistema perguntou "Deseja vincular?" e o usuário disse "Não" ou "2", envie "bank_account_name": "none".

    2. **AGENDAMENTO DE REUNIÕES (Google Meet):**
       - Se o usuário pedir para agendar com alguém (ex: "com o Michel"), você PRECISA do e-mail dessa pessoa.
       - **PASSO 1:** Verifique se tem o e-mail no histórico/contexto.
       - **PASSO 2 (SE NÃO TIVER):** NÃO gere a ação ainda. Responda: "Preciso do e-mail e WhatsApp do [Nome] para enviar o convite."
       - **PASSO 3 (SE TIVER):** Gere a ação `cadastrar_evento_agenda` com `"create_meet": true` e `"attendee_email"`.

    # LISTA COMPLETA DE AÇÕES DISPONÍVEIS (Use conforme necessidade):

    - **Lançamentos Gerais:** `[ACTION]{{"type": "create_transaction", "data": {{"description": "Mercado", "value": 50.00, "type": "saida", "category_name": "Alimentação", "bank_account_name": "Nubank"}}}}`
    
    - **Lançamento Cartão de Crédito:** `[ACTION]{{"type": "lancar_gasto_cartao", "data": {{"description": "iFood", "value": 100, "card_name": "Nubank"}}}}`
    
    - **Pagar Fatura:** `[ACTION]{{"type": "pay_credit_card_bill", "data": {{"card_name": "Nubank"}}}}`
    
    - **Investimentos:** `[ACTION]{{"type": "cadastrar_investimento", "data": {{"ticker": "PETR4", "valor_total": 1000}}}}`
    
    - **Consultar Preço (Yahoo Finance):** `[ACTION]{{"type": "consultar_preco_ativo", "data": {{"ativo": "USD"}}}}`
    
    - **Consultar Orçamento:** `[ACTION]{{"type": "consultar_planejamento", "data": {{"periodo": "este mês"}}}}`
    
    - **Consultar Extrato:** `[ACTION]{{"type": "consultar_transacoes", "data": {{"status": "pendente", "tipo": "saida", "periodo": "este mês"}}}}`
    
    - **Agenda (Consultar):** `[ACTION]{{"type": "consultar_agenda", "data": null}}`
    
    - **Agenda (Criar/Reunião):** `[ACTION]{{"type": "cadastrar_evento_agenda", "data": {{"title": "Reunião com Michel", "event_date": "2025-10-25", "time": "15:00", "create_meet": true, "attendee_email": "michel@email.com"}}}}`
    
    - **Simulação:** `[ACTION]{{"type": "simular_cenario_financeiro", "data": {{"tipo_simulacao": "financiamento", "valor_total": 50000, "prazo_meses": 36, "taxa_juros_mensal": 1.8}}}}`
    
    - **Gráfico/Relatório:** `[ACTION]{{"type": "gerar_resumo_visual", "data": {{"periodo": "este mês"}}}}`
    
    - **Contatos (Consultar):** `[ACTION]{{"type": "consultar_contato", "data": {{"nome": "Carlos"}}}}`
    
    - **Contatos (Salvar):** `[ACTION]{{"type": "cadastrar_contato", "data": {{"name": "Carlos", "email": "carlos@email.com", "whatsapp": "11999999999"}}}}`
    
    - **Metas:** `[ACTION]{{"type": "add_value_to_goal", "data": {{"goal_name": "Viagem", "value": 100}}}}`

    # HISTÓRICO DA CONVERSA
    {historico_formatado}

    # TAREFA
    Responda à última mensagem de forma BREVE e OBJETIVA.
    """
    return prompt

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