# src/services/ai_gateway.py
"""
AI Gateway - Gateway Unificado de Inteligência Artificial para Simplific Pro.
Prioridade de Roteamento (Custo Zero com Fallback Automático):
1. FreeLLMAPI (Se FREELLMAPI_URL configurado no servidor/Render)
2. Groq Direto (Se GROQ_API_KEY configurado)
3. Google Gemini Oficial (Fallback garantido e à prova de falhas)
"""

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

from src.services.ai_tools_service import simplific_tools, openai_simplific_tools
from src.services.search_service import realizar_pesquisa_web
import google.generativeai as genai

# ==============================================================================
# CONFIGURAÇÕES DE AMBIENTE
# ==============================================================================

FREELLMAPI_URL = os.getenv('FREELLMAPI_URL', '').strip()
FREELLMAPI_KEY = os.getenv('FREELLMAPI_KEY', '').strip() or os.getenv('FREELLMAPI_API_KEY', '').strip()
_raw_model = os.getenv('FREELLMAPI_MODEL', 'auto').strip()
FREELLMAPI_MODEL = 'auto' if (not _raw_model or _raw_model == 'groq/llama-3.3-70b-versatile') else _raw_model

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '').strip()
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile').strip()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '').strip()

# Inicializa Gemini se chave estiver presente
_gemini_model = None
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel(
            'gemini-flash-latest',
            generation_config={
                "temperature": 0.2,
                "top_p": 1,
                "top_k": 1,
                "max_output_tokens": 8192,
            },
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ],
            tools=simplific_tools
        )
    except Exception as e:
        print(f"⚠️ [AI GATEWAY] Erro ao inicializar modelo Gemini: {e}")


def _normalize_endpoint(url):
    """Garante que a URL termine com /v1/chat/completions ou /chat/completions."""
    if not url:
        return None
    url = url.rstrip('/')
    if url.endswith('/chat/completions'):
        return url
    if url.endswith('/v1'):
        return f"{url}/chat/completions"
    return f"{url}/v1/chat/completions"


# ==============================================================================
# MOTOR OPENAI-COMPATIBLE (FREELLMAPI & GROQ)
# ==============================================================================

def _run_openai_agent(endpoint, api_key, model_name, user_id, prompt):
    """
    Executa o loop ReAct com Function Calling em qualquer provedor OpenAI-compatível.
    """
    headers = {
        "Content-Type": "application/json"
    }
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    messages = [
        {"role": "user", "content": prompt}
    ]

    max_turnos = 5
    acoes_a_executar = []

    for turno in range(max_turnos):
        payload = {
            "model": model_name,
            "messages": messages,
            "tools": openai_simplific_tools,
            "tool_choice": "auto",
            "temperature": 0.2
        }

        response = requests.post(endpoint, headers=headers, json=payload, timeout=25)
        if response.status_code == 404 and ("not in the catalog" in response.text or "Use 'auto'" in response.text):
            print("🔄 [AI GATEWAY] Modelo não encontrado no catálogo do FreeLLMAPI. Reenviando automaticamente com 'auto'...")
            payload["model"] = "auto"
            response = requests.post(endpoint, headers=headers, json=payload, timeout=25)

        if response.status_code != 200:
            raise RuntimeError(f"HTTP {response.status_code}: {response.text}")

        data = response.json()
        choices = data.get("choices")
        if not choices:
            raise RuntimeError(f"Resposta sem escolhas retornada por {endpoint}: {data}")

        choice = choices[0]
        message = choice.get("message", {})
        tool_calls = message.get("tool_calls") or []

        if not tool_calls:
            # Modelo gerou texto final sem chamar novas ferramentas
            texto_para_usuario = message.get("content") or ""
            return texto_para_usuario.strip(), acoes_a_executar

        # Registra a mensagem do assistente com as intenções de tool call
        messages.append(message)

        # Executa as ferramentas solicitadas
        for tc in tool_calls:
            tc_id = tc.get("id", f"call_{turno}")
            function_obj = tc.get("function", {})
            func_name = function_obj.get("name", "")
            raw_args = function_obj.get("arguments", "{}")

            if isinstance(raw_args, str):
                try:
                    func_args = json.loads(raw_args)
                except Exception:
                    func_args = {}
            elif isinstance(raw_args, dict):
                func_args = raw_args
            else:
                func_args = {}

            if func_name == "pesquisar_na_internet":
                query_busca = func_args.get("query", "")
                print(f"🔄 [AI GATEWAY] Resolvendo pesquisa: '{query_busca}'")
                resultado_web = realizar_pesquisa_web(query_busca)
                resultado_turbinado = (
                    f"RESULTADOS DA PESQUISA NA WEB:\n{resultado_web}\n\n"
                    "ATENÇÃO: Lembre-se de repassar os links de compra/fontes no seu relatório final."
                )
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc_id,
                    "name": func_name,
                    "content": resultado_turbinado
                })

            elif func_name == "vincular_conta_ultima_transacao":
                digitos = func_args.get("digitos_conta") or func_args.get("opcao_usuario", "")
                from src.services.transacoes_service import vincular_conta_ultima_transacao
                resultado_vinculo = vincular_conta_ultima_transacao(user_id, digitos)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc_id,
                    "name": func_name,
                    "content": json.dumps(resultado_vinculo, ensure_ascii=False)
                })

            else:
                # Ferramenta de banco de dados (lançamento, cartão, agenda, meta)
                print(f"🔧 [AI GATEWAY] Interceptando ação final: {func_name}")
                acao_atual = {"type": func_name, "data": func_args}
                if acao_atual not in acoes_a_executar:
                    acoes_a_executar.append(acao_atual)

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc_id,
                    "name": func_name,
                    "content": json.dumps({
                        "status": "sucesso",
                        "mensagem": "Ação salva no banco de dados. REGRA DE RESPOSTA: Foque o seu texto final APENAS nos resultados da pesquisa (links, dicas, preços). NÃO escreva que você criou metas ou agendou lembretes, pois o próprio sistema adicionará as confirmações verdes (✅) automaticamente no final da sua mensagem. Apenas entregue a pesquisa."
                    }, ensure_ascii=False)
                })

    # Caso atinja o número máximo de turnos
    ultimo_conteudo = messages[-1].get("content") or ""
    return ultimo_conteudo.strip(), acoes_a_executar


# ==============================================================================
# MOTOR GEMINI (FALLBACK OFICIAL)
# ==============================================================================

def _run_gemini_agent(user_id, prompt):
    """
    Executa o agente nativo via SDK do Google Gemini (Garantia de fallback).
    """
    if not _gemini_model:
        raise RuntimeError("Google Gemini não está configurado ou API Key ausente.")

    mensagens_bumerangue = [{"role": "user", "parts": [prompt]}]
    response = _gemini_model.generate_content(mensagens_bumerangue)

    if not response.parts:
        return "Não consegui processar sua solicitação devido às políticas de segurança.", []

    max_turnos = 5
    acoes_a_executar = []

    for _ in range(max_turnos):
        precisa_continuar = False
        respostas_das_ferramentas = []

        for part in response.candidates[0].content.parts:
            if part.function_call:
                precisa_continuar = True
                nome_funcao = part.function_call.name
                argumentos = {key: value for key, value in part.function_call.args.items()}

                if nome_funcao == "pesquisar_na_internet":
                    query_busca = argumentos.get("query", "")
                    print(f"🔄 [GEMINI FALLBACK] Resolvendo pesquisa: '{query_busca}'")
                    resultado_web = realizar_pesquisa_web(query_busca)
                    resultado_turbinado = (
                        f"RESULTADOS DA PESQUISA NA WEB:\n{resultado_web}\n\n"
                        "ATENÇÃO: Lembre-se de repassar os links de compra/fontes no seu relatório final."
                    )
                    respostas_das_ferramentas.append({
                        "function_response": {
                            "name": "pesquisar_na_internet",
                            "response": {"resultado": resultado_turbinado}
                        }
                    })

                elif nome_funcao == "vincular_conta_ultima_transacao":
                    digitos = argumentos.get("digitos_conta") or argumentos.get("opcao_usuario", "")
                    from src.services.transacoes_service import vincular_conta_ultima_transacao
                    resultado_vinculo = vincular_conta_ultima_transacao(user_id, digitos)
                    respostas_das_ferramentas.append({
                        "function_response": {
                            "name": "vincular_conta_ultima_transacao",
                            "response": resultado_vinculo
                        }
                    })

                else:
                    print(f"🔧 [GEMINI FALLBACK] Interceptando ação final: {nome_funcao}")
                    acao_atual = {"type": nome_funcao, "data": argumentos}
                    if acao_atual not in acoes_a_executar:
                        acoes_a_executar.append(acao_atual)

                    respostas_das_ferramentas.append({
                        "function_response": {
                            "name": nome_funcao,
                            "response": {
                                "status": "sucesso",
                                "mensagem": "Ação salva no banco de dados. REGRA DE RESPOSTA: Foque o seu texto final APENAS nos resultados da pesquisa (links, dicas, preços). NÃO escreva que você criou metas ou agendou lembretes, pois o próprio sistema adicionará as confirmações verdes (✅) automaticamente no final da sua mensagem. Apenas entregue a pesquisa."
                            }
                        }
                    })

        if precisa_continuar and respostas_das_ferramentas:
            mensagens_bumerangue.append(response.candidates[0].content)
            mensagens_bumerangue.append({
                "role": "user",
                "parts": respostas_das_ferramentas
            })
            response = _gemini_model.generate_content(mensagens_bumerangue)
        else:
            break

    texto_para_usuario = ""
    for part in response.candidates[0].content.parts:
        if part.text:
            texto_para_usuario += part.text + " "

    return texto_para_usuario.strip(), acoes_a_executar


# ==============================================================================
# ROTEADOR PRINCIPAL DO ASSESSOR (ORQUESTRADOR DE FALLBACK)
# ==============================================================================

def generate_agent_response(user_id, prompt):
    """
    Orquestrador inteligente:
    1. Tenta FreeLLMAPI (se configurado)
    2. Tenta Groq direto (se configurado)
    3. Faz fallback transparente para Google Gemini
    """
    # 1. Provedor 1: FreeLLMAPI
    freellmapi_endpoint = _normalize_endpoint(FREELLMAPI_URL)
    if freellmapi_endpoint:
        try:
            print(f"🚀 [AI GATEWAY] Roteando para FreeLLMAPI: {freellmapi_endpoint} (Modelo: {FREELLMAPI_MODEL})")
            texto, acoes = _run_openai_agent(
                endpoint=freellmapi_endpoint,
                api_key=FREELLMAPI_KEY,
                model_name=FREELLMAPI_MODEL,
                user_id=user_id,
                prompt=prompt
            )
            if texto or acoes:
                return texto, acoes
        except Exception as e:
            print(f"⚠️ [AI GATEWAY] FreeLLMAPI falhou ou atingiu limite ({e}). Tentando próximo provedor...")

    # 2. Provedor 2: Groq direto (Opcional, 100% gratuito)
    if GROQ_API_KEY:
        try:
            print(f"⚡ [AI GATEWAY] Roteando para Groq direto (Modelo: {GROQ_MODEL})")
            texto, acoes = _run_openai_agent(
                endpoint="https://api.groq.com/openai/v1/chat/completions",
                api_key=GROQ_API_KEY,
                model_name=GROQ_MODEL,
                user_id=user_id,
                prompt=prompt
            )
            if texto or acoes:
                return texto, acoes
        except Exception as e:
            print(f"⚠️ [AI GATEWAY] Groq falhou ({e}). Acionando fallback oficial...")

    # 3. Provedor 3: Google Gemini Oficial (Garantia de Uptime)
    print("💎 [AI GATEWAY] Executando chamada via Google Gemini Oficial")
    return _run_gemini_agent(user_id=user_id, prompt=prompt)


# ==============================================================================
# FUNÇÕES SIMPLES (TEXTO / EXTRAÇÃO / CATEGORIZAÇÃO)
# ==============================================================================

def generate_simple_completion(prompt, temperature=0.1):
    """
    Executa geração simples de texto/JSON sem tools (com fallback FreeLLMAPI -> Groq -> Gemini).
    """
    # 1. FreeLLMAPI
    freellmapi_endpoint = _normalize_endpoint(FREELLMAPI_URL)
    if freellmapi_endpoint:
        try:
            headers = {"Content-Type": "application/json"}
            if FREELLMAPI_KEY:
                headers["Authorization"] = f"Bearer {FREELLMAPI_KEY}"
            resp = requests.post(
                freellmapi_endpoint,
                headers=headers,
                json={
                    "model": FREELLMAPI_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": temperature
                },
                timeout=20
            )
            if resp.status_code == 404 and ("not in the catalog" in resp.text or "Use 'auto'" in resp.text):
                print("🔄 [AI GATEWAY Simple] Reenviando com 'auto'...")
                resp = requests.post(
                    freellmapi_endpoint,
                    headers=headers,
                    json={
                        "model": "auto",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": temperature
                    },
                    timeout=20
                )
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"].get("content", "").strip()
                if content:
                    return content
        except Exception as e:
            print(f"⚠️ [AI GATEWAY Simple] FreeLLMAPI falhou: {e}")

    # 2. Groq
    if GROQ_API_KEY:
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GROQ_API_KEY}"
            }
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json={
                    "model": GROQ_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": temperature
                },
                timeout=15
            )
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"].get("content", "").strip()
                if content:
                    return content
        except Exception as e:
            print(f"⚠️ [AI GATEWAY Simple] Groq falhou: {e}")

    # 3. Gemini Fallback
    try:
        model_simples = genai.GenerativeModel(
            'gemini-flash-latest',
            generation_config={"temperature": temperature}
        )
        response = model_simples.generate_content(prompt)
        return response.text.strip() if response and response.parts else ""
    except Exception as e:
        print(f"ERRO [AI GATEWAY Simple Gemini]: {e}")
        return ""
