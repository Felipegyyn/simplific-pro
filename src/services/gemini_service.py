import os
from dotenv import load_dotenv
load_dotenv()
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
    ultimas_msgs = historico_chat[-4:] if historico_chat else []
    historico_formatado = "\n".join([f"{msg['role']}: {msg['content']}" for msg in ultimas_msgs])
    
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

    2. **AGENDAMENTO DE REUNIÕES (Google Meet) E CONTATOS (REGRA OBRIGATÓRIA):**
       - Se o usuário pedir para marcar reunião ou compromisso com alguém (ex: "com o Michel"):
         * **PASSO 1 (Verificação Automática nos Contatos):**
           Consulte a seção '[CONTATOS SALVOS NA AGENDA DO USUÁRIO]' ou chame a ferramenta `consultar_contato(nome=...)`.
           Se o contato já estiver cadastrado (ex: "Michel"):
           - VOCÊ JÁ TEM O E-MAIL E/OU WHATSAPP DELE! É TERMINANTEMENTE PROIBIDO pedir o e-mail ou WhatsApp novamente ao usuário.
           - Se o usuário informou o dia mas NÃO informou o horário, pergunte APENAS: "Perfeito! Qual horário será a reunião com o [Nome] no dia [Data]?"
           - Se você já possui a data E o horário (seja na mensagem atual ou do histórico), CHAME IMEDIATAMENTE a ferramenta `cadastrar_evento_agenda`:
             `title`: "Reunião com [Nome]",
             `event_date`: data em formato "YYYY-MM-DD",
             `time`: horário em formato "HH:MM",
             `create_meet`: true,
             `attendee_email`: e-mail do contato salvo.
         * **PASSO 2 (Se o contato NÃO estiver cadastrado e não houver e-mail):**
           - Apenas se o contato NÃO constar na lista de contatos salvos e o usuário não tiver informado o e-mail, pergunte: "Para agendar com [Nome], qual o e-mail dele para envio do convite do Google Meet?" (e o horário caso não tenha informado).

    3. **A REGRA DO MENU DE CONTAS (MÁXIMA PRIORIDADE - RISCO CRÍTICO):**
       - Se o usuário enviar APENAS um número (ex: "1", "2") ou os dígitos finais de um cartão/conta (ex: "2345", "01-1"), ISSO NÃO É UM NOVO GASTO EM DINHEIRO! 
       - Isso significa que ele está respondendo à sua própria pergunta anterior sobre "Qual conta devo usar?".
       - **O QUE VOCÊ DEVE FAZER:** Olhe o histórico da conversa, identifique qual conta corresponde à opção escolhida pelo usuário, pegue os 4 DÍGITOS FINAIS daquela conta e CHAME IMEDIATAMENTE a ferramenta `vincular_conta_ultima_transacao`.
       - **É ESTRITAMENTE PROIBIDO** responder dizendo "Não entendi", "Como posso ajudar com esse número?" ou tentar registrar um gasto com esse número. Chame a ferramenta na hora.

    4. **EDITAR, EXCLUIR OU ESTORNAR TRANSAÇÕES (FINANÇAS):**
       - Se o usuário pedir para cancelar, estornar, apagar ou editar um lançamento (ex: "cancele o último almoço", "mude o valor do ifood para 40"):
       - Para exclusão/estorno: chame `excluir_transacao(identificador="almoço")` ou com `posicao_relativa="ultima"`.
       - Para edição: chame `editar_transacao(identificador="ifood", novo_valor=40)`.

    5. **CARTÕES DE CRÉDITO:**
       - Para cadastrar novo cartão via chat: chame `cadastrar_cartao_credito(name="Inter", limit=5000, closing_day=20, due_day=28)`.
       - Para reajustar limite: chame `alterar_limite_cartao(card_name="Nubank", novo_limite=8000)`.

    6. **METAS PESSOAIS:**
       - Para pausar, reativar, excluir ou renegociar prazo/valor da meta: chame `gerenciar_meta(meta_nome="Viagem", acao="pausar"|"reativar"|"excluir"|"alterar_prazo"|"alterar_valor", novo_prazo=..., novo_valor_alvo=...)`.

    7. **INVESTIMENTOS (RESGATE E RENTABILIDADE):**
       - Para vender ou resgatar ativos: chame `resgatar_investimento(nome_ou_ticker="PETR4", quantidade=10)`.
       - Para consultar rentabilidade consolidada da carteira: chame `consultar_rentabilidade_carteira()`.

    8. **AGENDA (CANCELAMENTO):**
       - Para desmarcar ou cancelar reunião/compromisso: chame `cancelar_evento_agenda(identificador="Reunião com Michel")`.

    9. **CONTATOS (ATUALIZAÇÃO):**
       - Para atualizar e-mail ou WhatsApp de contato existente: chame `atualizar_contato(nome="Michel", email="...", whatsapp="...")`.
    
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
    Com fallback inteligente (FreeLLMAPI -> Groq -> Gemini).
    """
    try:
        from src.services.ai_gateway import generate_simple_completion
        import re

        options_text = "\n".join([f"ID {c['id']}: {c['name']}" for c in categories_list])

        prompt = f"""
        Classifique esta transação bancária.
        TRANSAÇÃO: "{description}"
        
        OPÇÕES:
        {options_text}
        
        Responda APENAS com o número do ID da categoria correta. 
        Se não souber, responda o ID da categoria 'Outros' ou similar.
        """
        
        response_text = generate_simple_completion(prompt, temperature=0.1)
        if response_text:
            digits = re.findall(r'\d+', response_text)
            if digits:
                return int(digits[0])
            return int(response_text.strip())
        return None

    except Exception as e:
        print(f"Erro IA na transação '{description}': {e}")
        return None