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
import builtins
from dotenv import load_dotenv

load_dotenv()

_orig_print = builtins.print
def safe_print(*args, **kwargs):
    try:
        _orig_print(*args, **kwargs)
    except (UnicodeEncodeError, UnicodeError):
        safe_args = [str(a).encode('ascii', errors='replace').decode('ascii') for a in args]
        _orig_print(*safe_args, **kwargs)
print = safe_print

from src.services.ai_tools_service import simplific_tools, openai_simplific_tools
from src.services.search_service import realizar_pesquisa_web
import google.generativeai as genai

# ==============================================================================
# CONFIGURAÇÕES DE AMBIENTE
# ==============================================================================

FREELLMAPI_URL = os.getenv('FREELLMAPI_URL', 'https://freellmapi-3lm4.onrender.com').strip()
FREELLMAPI_KEY = os.getenv('FREELLMAPI_KEY', '').strip() or os.getenv('FREELLMAPI_API_KEY', '').strip()
_raw_model = os.getenv('FREELLMAPI_MODEL', 'auto').strip().lower()
FREELLMAPI_MODEL = 'auto' if (not _raw_model or 'auto' in _raw_model or '/' in _raw_model or 'llama' in _raw_model) else _raw_model

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
        {
            "role": "system",
            "content": (
                "Você é o VISION, o assistente inteligente e consultor oficial do Simplific Pro. "
                "Responda sempre em português brasileiro de forma direta, cortês, elegante e objetiva. "
                "Ao consultar dados (como cotações de moedas/ações, extrato, agenda, planejamento ou internet), "
                "analise os dados retornados pelas ferramentas e formule uma resposta agradável e natural para o usuário. "
                "NUNCA exiba respostas brutas em JSON nem instruções técnicas de sistema na sua resposta final."
            )
        },
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
            texto_para_usuario = message.get("content") or ""
            texto_limpo = re.sub(r'\{"status":\s*"sucesso"[^}]*\}', '', texto_para_usuario).strip()
            return texto_limpo or texto_para_usuario.strip(), acoes_a_executar

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

            # --- 1. PESQUISA NA INTERNET ---
            if func_name in ["pesquisar_na_internet", "pesificar_na_internet"]:
                query_busca = func_args.get("query", "")
                print(f"🔄 [AI GATEWAY] Resolvendo pesquisa: '{query_busca}'")
                resultado_web = realizar_pesquisa_web(query_busca, user_id=user_id)
                resultado_turbinado = (
                    f"RESULTADOS DA PESQUISA NA WEB:\n{resultado_web}\n\n"
                    "DICA: Repasse os links de compra/fontes no seu texto final para facilitar a vida do usuário."
                )
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc_id,
                    "name": func_name,
                    "content": resultado_turbinado
                })

            # --- 2. CONSULTAR PREÇO DE ATIVO / MOEDA ---
            elif func_name == "consultar_preco_ativo":
                ativo = func_args.get("ativo", "")
                from src.services.investments_service import buscar_dados_ativo
                resultado = buscar_dados_ativo(ativo)
                if resultado.get("status") == "sucesso":
                    info = resultado.get("data", {})
                    content_cotacao = (
                        f"Cotação em tempo real de {info.get('nome')} ({info.get('ticker')}):\n"
                        f"- Preço Atual: R$ {info.get('preco'):.2f}\n"
                        f"- Variação no dia: {info.get('variacao_percentual'):+.2f}%"
                    )
                    if info.get("noticia"):
                        content_cotacao += f"\n- Notícia recente: {info['noticia'].get('title')}"
                else:
                    content_cotacao = f"Não foram encontrados dados de mercado em tempo real para o ativo '{ativo}'."

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc_id,
                    "name": func_name,
                    "content": content_cotacao
                })

            # --- 3. CONSULTAR EXTRATO / TRANSAÇÕES ---
            elif func_name == "consultar_transacoes":
                from src.services.transacoes_service import buscar_transacoes_por_status
                from src.services.financial_service import calcular_intervalo_datas, format_currency_brl
                status = func_args.get("status", "confirmada")
                tipo = func_args.get("tipo", "ambos")
                periodo = func_args.get("periodo", "este mês")
                try:
                    d_ini, d_fim = calcular_intervalo_datas(periodo)
                    trans = buscar_transacoes_por_status(user_id, status, d_ini, d_fim, tipo)
                    if trans:
                        linhas = [f"- {t['description']}: {format_currency_brl(t['value'])} ({t['type']})" for t in trans[:10]]
                        content_trans = f"Lançamentos ({status}) para {periodo}:\n" + "\n".join(linhas)
                    else:
                        content_trans = f"Nenhum lançamento com status '{status}' encontrado para {periodo}."
                except Exception as e:
                    content_trans = f"Consulta de transações: {e}"

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc_id,
                    "name": func_name,
                    "content": content_trans
                })

            # --- 4. CONSULTAR ORÇAMENTO / PLANEJAMENTO ---
            elif func_name == "consultar_planejamento":
                from src.services.financial_service import calcular_intervalo_datas, buscar_resumo_planejamento
                periodo = func_args.get("periodo", "este mês")
                try:
                    d_ini, d_fim = calcular_intervalo_datas(periodo)
                    resumo = buscar_resumo_planejamento(user_id, d_ini, d_fim)
                    content_plan = f"Resumo do orçamento para {periodo}: {json.dumps(resumo, ensure_ascii=False)}"
                except Exception as e:
                    content_plan = f"Consulta de orçamento: {e}"

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc_id,
                    "name": func_name,
                    "content": content_plan
                })

            # --- 5. CONSULTAR AGENDA ---
            elif func_name == "consultar_agenda":
                from src.services.agenda_service import get_agenda_summary
                try:
                    resumo_agenda = get_agenda_summary(user_id)
                    content_agenda = f"Agenda do usuário:\n{json.dumps(resumo_agenda, ensure_ascii=False)}"
                except Exception as e:
                    content_agenda = f"Nenhum compromisso pendente na agenda ({e})."

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc_id,
                    "name": func_name,
                    "content": content_agenda
                })

            # --- 6. CONSULTAR CONTATO ---
            elif func_name == "consultar_contato":
                from src.models.contact import Contact
                nome = func_args.get("nome", "")
                try:
                    contatos = Contact.query.filter(Contact.user_id == user_id, Contact.name.ilike(f'%{nome}%')).all()
                    if contatos:
                        linhas = [f"- {c.name}: Tel: {c.whatsapp or 'N/I'}, Email: {c.email or 'N/I'}" for c in contatos]
                        content_contato = "Contatos encontrados:\n" + "\n".join(linhas)
                    else:
                        content_contato = f"Nenhum contato encontrado com o nome '{nome}'."
                except Exception as e:
                    content_contato = f"Não foi possível buscar contatos: {e}"

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc_id,
                    "name": func_name,
                    "content": content_contato
                })

            # --- 7. SIMULAR CENÁRIO FINANCEIRO ---
            elif func_name == "simular_cenario_financeiro":
                from src.services.simulation_service import run_financial_simulation, formatar_resultado_simulacao
                try:
                    res_sim = run_financial_simulation(user_id, func_args)
                    content_sim = formatar_resultado_simulacao(res_sim)
                except Exception as e:
                    content_sim = f"Erro na simulação: {e}"

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc_id,
                    "name": func_name,
                    "content": content_sim
                })

            # --- 8. VINCULAR CONTA BANCÁRIA ---
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

            # --- 9. MUTAÇÕES DE BANCO (Lançamentos, Cartão, Metas, Agenda, etc) ---
            else:
                print(f"🔧 [AI GATEWAY] Registrando ação de banco: {func_name}")
                acao_atual = {"type": func_name, "data": func_args}
                if acao_atual not in acoes_a_executar:
                    acoes_a_executar.append(acao_atual)

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc_id,
                    "name": func_name,
                    "content": json.dumps({
                        "status": "sucesso",
                        "mensagem": f"Operação '{func_name}' registrada com sucesso."
                    }, ensure_ascii=False)
                })

    # Caso atinja o número máximo de turnos
    ultimo_conteudo = messages[-1].get("content") or ""
    texto_limpo = re.sub(r'\{"status":\s*"sucesso"[^}]*\}', '', ultimo_conteudo).strip()
    return texto_limpo or ultimo_conteudo.strip(), acoes_a_executar


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

                if nome_funcao in ["pesquisar_na_internet", "pesificar_na_internet"]:
                    query_busca = argumentos.get("query", "")
                    print(f"🔄 [GEMINI FALLBACK] Resolvendo pesquisa: '{query_busca}'")
                    resultado_web = realizar_pesquisa_web(query_busca, user_id=user_id)
                    resultado_turbinado = (
                        f"RESULTADOS DA PESQUISA NA WEB:\n{resultado_web}\n\n"
                        "DICA: Repasse os links de compra/fontes no seu texto final para facilitar a vida do usuário."
                    )
                    respostas_das_ferramentas.append({
                        "function_response": {
                            "name": nome_funcao,
                            "response": {"resultado": resultado_turbinado}
                        }
                    })

                elif nome_funcao == "consultar_preco_ativo":
                    ativo = argumentos.get("ativo", "")
                    from src.services.investments_service import buscar_dados_ativo
                    resultado = buscar_dados_ativo(ativo)
                    if resultado.get("status") == "sucesso":
                        info = resultado.get("data", {})
                        texto_res = f"Preço de {info.get('nome')}: R$ {info.get('preco'):.2f} (Variação: {info.get('variacao_percentual'):+.2f}%)"
                    else:
                        texto_res = f"Ativo '{ativo}' não encontrado."
                    respostas_das_ferramentas.append({
                        "function_response": {
                            "name": nome_funcao,
                            "response": {"resultado": texto_res}
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
                                "mensagem": f"Operação '{nome_funcao}' registrada com sucesso."
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
    print(">> [AI GATEWAY] Executando chamada via Google Gemini Oficial")
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
