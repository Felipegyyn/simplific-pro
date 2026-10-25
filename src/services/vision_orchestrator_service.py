# src/services/vision_orchestrator_service.py
"""
Vision Orchestrator Service - Enriquecimento de Respostas com Gráficos e Widgets Interativos.
Suporta todas as capacidades do Simplific Pro (Finanças, Cartões, Metas, Agenda, Investimentos e Pesquisa Web com Imagens).
"""

from datetime import date, datetime
import re
from sqlalchemy import func, case

from src.models.db import db
from src.models.financial import Transaction, Category
from src.models.extended import Goal, ScheduleEvent
from src.models.extended_modules import CreditCard, Fatura, BankAccount
from src.services.ai_assessor_service import get_ai_response
from src.services.whatsapp_service import user_sessions
from src.routes.routes_whatsapp import executar_acao_simplific
from src.services.search_service import obter_ultimos_cards_pesquisa
from src.services.investments_service import buscar_dados_ativo

# Paleta harmoniosa para categorias de despesas
PALETTE_COLORS = [
    "#10b981",  # Esmeralda
    "#3b82f6",  # Azul
    "#f59e0b",  # Âmbar
    "#ec4899",  # Rosa
    "#8b5cf6",  # Roxo
    "#06b6d4",  # Ciano
    "#64748b"   # Slate
]

# ==============================================================================
# COLETORES DE DADOS VISUAIS
# ==============================================================================

def coletar_dados_financeiros(user_id):
    """Gera dados agregados para os gráficos Recharts de receitas, despesas e categorias."""
    try:
        import calendar
        hoje = date.today()
        inicio_mes = hoje.replace(day=1)
        _, ultimo_dia = calendar.monthrange(hoje.year, hoje.month)
        fim_mes = hoje.replace(day=ultimo_dia)

        # 1. Totais do mês
        totals = db.session.query(
            func.sum(case((Transaction.type == 'entrada', Transaction.value), else_=0)).label('total_revenue'),
            func.sum(case((Transaction.type == 'saida', Transaction.value), else_=0)).label('total_expense')
        ).filter(
            Transaction.user_id == user_id,
            Transaction.date.between(inicio_mes, fim_mes)
        ).one()

        receitas = float(totals.total_revenue or 0)
        despesas = float(totals.total_expense or 0)
        saldo = receitas - despesas
        taxa_poupanca = round((saldo / receitas * 100), 1) if receitas > 0 and saldo > 0 else 0

        # 2. Top categorias de despesas
        expenses_by_cat = db.session.query(
            Category.name,
            func.sum(Transaction.value).label('total')
        ).join(Category, Transaction.category_id == Category.id).filter(
            Transaction.user_id == user_id,
            Transaction.date.between(inicio_mes, fim_mes),
            Transaction.type == 'saida'
        ).group_by(Category.name).order_by(func.sum(Transaction.value).desc()).limit(6).all()

        categorias = [
            {
                "name": cat,
                "value": float(val),
                "color": PALETTE_COLORS[i % len(PALETTE_COLORS)]
            }
            for i, (cat, val) in enumerate(expenses_by_cat)
        ]

        # 3. Detalhes de Receitas e Despesas para os cards interativos (estilo Pierre)
        rec_txs = Transaction.query.filter(
            Transaction.user_id == user_id,
            Transaction.date.between(inicio_mes, fim_mes),
            Transaction.type == 'entrada'
        ).order_by(Transaction.value.desc()).all()

        desp_txs = Transaction.query.filter(
            Transaction.user_id == user_id,
            Transaction.date.between(inicio_mes, fim_mes),
            Transaction.type == 'saida'
        ).order_by(Transaction.value.desc()).all()

        detalhes_receitas = [
            {
                "id": t.id,
                "description": t.description,
                "value": float(t.value),
                "date": t.date.strftime('%d/%m/%Y') if t.date else "",
                "category": t.category.name if t.category else "Receita",
                "status": t.status or "confirmada"
            }
            for t in rec_txs
        ]

        detalhes_despesas = [
            {
                "id": t.id,
                "description": t.description,
                "value": float(t.value),
                "date": t.date.strftime('%d/%m/%Y') if t.date else "",
                "category": t.category.name if t.category else "Outros",
                "status": t.status or "confirmada"
            }
            for t in desp_txs
        ]

        # 4. Métricas de fluxo de caixa e diagnóstico de saldo
        dias_decorridos = max(1, hoje.day)
        dias_restantes = max(0, ultimo_dia - hoje.day)
        gasto_diario_medio = round(despesas / dias_decorridos, 2) if despesas > 0 else 0
        comprometimento_renda = round((despesas / receitas * 100), 1) if receitas > 0 else (100.0 if despesas > 0 else 0.0)
        projecao_fechamento = round(saldo - (gasto_diario_medio * dias_restantes), 2)

        detalhes_saldo = {
            "comprometimento_renda": comprometimento_renda,
            "gasto_diario_medio": gasto_diario_medio,
            "dias_decorridos": dias_decorridos,
            "dias_restantes": dias_restantes,
            "total_dias_mes": ultimo_dia,
            "projecao_fechamento": projecao_fechamento,
            "total_receitas_qtd": len(rec_txs),
            "total_despesas_qtd": len(desp_txs),
            "maior_despesa": {
                "description": detalhes_despesas[0]["description"] if detalhes_despesas else "Nenhuma",
                "value": detalhes_despesas[0]["value"] if detalhes_despesas else 0,
                "category": detalhes_despesas[0]["category"] if detalhes_despesas else ""
            } if detalhes_despesas else None,
            "maior_receita": {
                "description": detalhes_receitas[0]["description"] if detalhes_receitas else "Nenhuma",
                "value": detalhes_receitas[0]["value"] if detalhes_receitas else 0,
                "category": detalhes_receitas[0]["category"] if detalhes_receitas else ""
            } if detalhes_receitas else None
        }

        nomes_meses = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ]
        nome_mes_atual = f"{nomes_meses[hoje.month - 1]} {hoje.year}"

        return {
            "periodo": nome_mes_atual,
            "receitas": receitas,
            "despesas": despesas,
            "saldo": saldo,
            "taxa_poupanca": taxa_poupanca,
            "categorias": categorias,
            "detalhes_receitas": detalhes_receitas,
            "detalhes_despesas": detalhes_despesas,
            "detalhes_saldo": detalhes_saldo,
            "tem_dados": (receitas > 0 or despesas > 0)
        }
    except Exception as e:
        print(f"Erro ao coletar dados financeiros para o Vision: {e}")
        return None


def coletar_dados_cartoes(user_id):
    """Coleta o status dos cartões de crédito para o widget."""
    try:
        cards = CreditCard.query.filter_by(user_id=user_id, is_active=True).all()
        if not cards:
            cards = CreditCard.query.filter_by(user_id=user_id).all()
        if not cards:
            return None

        result = []
        for c in cards:
            limite = float(c.limit or 0)
            fatura_aberta = Fatura.query.filter_by(cartao_id=c.id, status='em_aberto').first()
            fatura_val = float(fatura_aberta.valor_total) if fatura_aberta else 0.0
            disp = float(c.available_limit) if c.available_limit is not None else max(0.0, limite - fatura_val)

            result.append({
                "id": c.id,
                "name": c.name,
                "limit_total": limite,
                "invoice_current": fatura_val,
                "limit_available": disp,
                "due_day": c.due_day or 10,
                "closing_day": c.closing_day or 3
            })
        return result
    except Exception as e:
        print(f"Erro ao coletar cartões para o Vision: {e}")
        return None


def coletar_dados_metas(user_id):
    """Coleta as metas financeiras com barra de progresso."""
    try:
        goals = Goal.query.filter_by(user_id=user_id, is_active=True).all()
        if not goals:
            goals = Goal.query.filter_by(user_id=user_id).all()
        if not goals:
            return None

        result = []
        for g in goals:
            target = float(g.target_value or 0)
            current = float(g.current_value or 0)
            pct = round((current / target * 100), 1) if target > 0 else 0
            result.append({
                "id": g.id,
                "name": g.name,
                "target": target,
                "current": current,
                "percentage": min(pct, 100),
                "target_date": g.target_date.strftime("%d/%m/%Y") if g.target_date else None,
                "category": g.category or "Geral"
            })
        return result
    except Exception as e:
        print(f"Erro ao coletar metas para o Vision: {e}")
        return None


def coletar_dados_agenda(user_id):
    """Coleta os próximos eventos e reuniões com link do Google Meet."""
    try:
        hoje = date.today()
        events = ScheduleEvent.query.filter(
            ScheduleEvent.user_id == user_id,
            ScheduleEvent.date >= hoje
        ).order_by(ScheduleEvent.date.asc()).limit(5).all()

        if not events:
            events = ScheduleEvent.query.filter_by(user_id=user_id).order_by(ScheduleEvent.date.desc()).limit(3).all()

        if not events:
            return None

        result = []
        for e in events:
            meet_link = None
            if e.description and ("meet.google.com" in e.description or "http" in e.description):
                for word in e.description.split():
                    if "meet.google.com" in word or word.startswith("http"):
                        meet_link = word
                        break

            result.append({
                "id": e.id,
                "title": e.title,
                "date": e.date.strftime("%d/%m/%Y") if e.date else "",
                "time": str(e.time)[:5] if e.time else "",
                "meet_link": meet_link,
                "attendee": None
            })
        return result
    except Exception as e:
        print(f"Erro ao coletar agenda para o Vision: {e}")
        return None


def coletar_cotacao_ativo(query_ou_ticker, ticker_sugerido=None):
    """Busca cotação em tempo real de um ativo ou moeda."""
    try:
        candidato = None
        if ticker_sugerido:
            candidato = str(ticker_sugerido)
        else:
            texto_limpo = re.sub(r'[^\w\s]', '', str(query_ou_ticker)).strip()
            palavras = texto_limpo.lower().split()

            termos_conhecidos = [
                'dolar', 'dólar', 'usd', 'euro', 'eur', 'bitcoin', 'btc', 
                'ethereum', 'eth', 'solana', 'sol', 'usdt', 'ibovespa', 'ibov',
                'sp500', 's&p500', 'nasdaq'
            ]
            for termo in termos_conhecidos:
                if termo in palavras:
                    candidato = termo
                    break

            if not candidato:
                for tok in texto_limpo.upper().split():
                    if re.match(r'^[A-Z]{4}\d{1,2}$', tok) or tok in ['USD', 'EUR', 'BTC', 'ETH', 'AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META']:
                        candidato = tok
                        break

            if not candidato and palavras:
                candidato = palavras[-1]

        if not candidato:
            return None

        resultado = buscar_dados_ativo(candidato)
        if resultado and resultado.get('status') == 'sucesso':
            data = resultado.get('data', {})
            return {
                "ticker": data.get('ticker') or candidato.upper(),
                "name": data.get('nome') or candidato.upper(),
                "price": float(data.get('preco', 0.0)),
                "change": f"{float(data.get('variacao_percentual', 0.0)):+.2f}%",
                "news": data.get('noticia')
            }
        return None
    except Exception as e:
        print(f"Erro ao buscar ativo para o Vision: {e}")
        return None


# ==============================================================================
# ORQUESTRADOR PRINCIPAL DO VISION
# ==============================================================================

def processar_interacao_vision(user_id, mensagem_usuario, usuario):
    """
    Processa a interação com o assistente para a interface web Vision.
    Retorna o texto humanizado e todos os widgets explicativos / gráficos / cards correspondentes.
    """
    session_key = f"platform_user_{user_id}"
    sessao = user_sessions.get(session_key, {})
    historico_chat = sessao.get('chat_history', [])
    historico_chat.append({"role": "user", "content": mensagem_usuario})

    # Chama o cérebro do assistente via AI Gateway (FreeLLMAPI com fallback Gemini)
    texto_para_usuario, acoes_a_executar = get_ai_response(
        user_id,
        historico_chat,
        nome_usuario_personalizado=usuario.name
    )

    resposta_final = texto_para_usuario or ""
    visuals = []

    # 1. Executa as ações acionadas pelo assistente
    recibos_gerados = []
    if acoes_a_executar:
        resultados_acoes = []
        for acao in acoes_a_executar:
            tipo = acao.get('type')
            dados = acao.get('data', {})

            # Lançamentos gerais -> Gera recibo visual
            if tipo == 'create_transaction':
                recibos_gerados.append({
                    "type": "receipt",
                    "title": "Lançamento Registrado",
                    "description": dados.get('description', 'Transação'),
                    "value": float(dados.get('value', 0)),
                    "type_trans": dados.get('type', 'saida'),
                    "category": dados.get('category_name', 'Geral'),
                    "bank_account": dados.get('bank_account_name') if str(dados.get('bank_account_name')).lower() != 'none' else None,
                    "timestamp": datetime.now().strftime("%d/%m/%Y às %H:%M")
                })

            # Lançamento Cartão -> Gera recibo de cartão
            elif tipo == 'lancar_gasto_cartao':
                recibos_gerados.append({
                    "type": "receipt",
                    "title": "Gasto no Cartão de Crédito",
                    "description": dados.get('description', 'Compra no Cartão'),
                    "value": float(dados.get('value', 0)),
                    "type_trans": "saida",
                    "category": "Cartão de Crédito",
                    "bank_account": dados.get('card_name', 'Cartão'),
                    "installments": dados.get('installments', 1),
                    "timestamp": datetime.now().strftime("%d/%m/%Y às %H:%M")
                })

            # Executa a ação no banco de dados (ignora ações puramente de leitura)
            if tipo not in ['pesquisar_na_internet', 'pesificar_na_internet', 'consultar_preco_ativo', 'consultar_transacoes', 'consultar_planejamento', 'consultar_agenda', 'consultar_contato']:
                resultado_acao = executar_acao_simplific(user_id, acao, session_key)
                if resultado_acao:
                    resultados_acoes.append(resultado_acao)

            # Reunião ou Compromisso recém-criado -> Adiciona card EXCLUSIVO deste evento
            if tipo in ['cadastrar_evento_agenda', 'create_agenda_item']:
                recem_criado = ScheduleEvent.query.filter_by(user_id=user_id).order_by(ScheduleEvent.id.desc()).first()
                if recem_criado:
                    meet_link = None
                    if recem_criado.description and ("meet.google.com" in recem_criado.description or "http" in recem_criado.description):
                        for word in recem_criado.description.split():
                            if "meet.google.com" in word or word.startswith("http"):
                                meet_link = word
                                break

                    data_card_fmt = recem_criado.date.strftime("%d/%m/%Y") if recem_criado.date else ""
                    time_card_fmt = str(recem_criado.time)[:5] if recem_criado.time else str(dados.get('time', ''))[:5]
                    
                    if not any(v.get('type') == 'schedule' for v in visuals):
                        visuals.append({
                            "type": "schedule",
                            "data": [{
                                "id": recem_criado.id,
                                "title": recem_criado.title or dados.get('title', 'Reunião'),
                                "date": data_card_fmt,
                                "time": time_card_fmt,
                                "meet_link": meet_link,
                                "attendee": dados.get('attendee_email')
                            }]
                        })

        if resultados_acoes:
            if not resposta_final or len(resposta_final.strip()) < 10:
                resposta_final = "\n\n".join(resultados_acoes)
            else:
                for res in resultados_acoes:
                    if res and res not in resposta_final:
                        resposta_final += f"\n\n{res}"

    # Limpeza de segurança contra resíduos de JSON ou mensagens internas
    resposta_final = re.sub(r'\{"status":\s*"sucesso"[^}]*\}', '', resposta_final)
    resposta_final = re.sub(r"Ação do tipo '.*?' não reconhecida\.?", '', resposta_final)
    resposta_final = resposta_final.strip()

    # 2. Anexa Recibos Visuais
    if recibos_gerados:
        for rec in recibos_gerados:
            visuals.append(rec)
        fin_data = coletar_dados_financeiros(user_id)
        if fin_data:
            visuals.append({"type": "finance_chart", "data": fin_data})

    # 3. Anexa Cards de Pesquisa na Web com Imagens Reais
    cards_pesquisa = obter_ultimos_cards_pesquisa(user_id)
    if cards_pesquisa:
        visuals.append({
            "type": "web_cards",
            "data": cards_pesquisa
        })

    # 4. Decisão contextual baseada nas ações executadas ou palavras da mensagem
    tipos_acoes = [a.get('type') for a in acoes_a_executar]
    texto_busca = (mensagem_usuario + " " + resposta_final).lower()

    # --- Se perguntou ou mexeu com Metas ---
    if any(t in ['criar_meta', 'add_value_to_goal'] for t in tipos_acoes) or any(k in texto_busca for k in ['meta', 'metas', 'quanto guardei', 'poupança', 'poupanca']):
        metas = coletar_dados_metas(user_id)
        if metas and not any(v['type'] == 'goals' for v in visuals):
            visuals.append({"type": "goals", "data": metas})

    # --- Se perguntou ou mexeu com Cartões ---
    if any(t in ['lancar_gasto_cartao', 'pay_credit_card_bill'] for t in tipos_acoes) or any(k in texto_busca for k in ['cartao', 'cartão', 'fatura', 'limite', 'cartões']):
        cartoes = coletar_dados_cartoes(user_id)
        if cartoes and not any(v['type'] == 'credit_cards' for v in visuals):
            visuals.append({"type": "credit_cards", "data": cartoes})

    # --- Se consultou a Agenda (Apenas quando explicitamente solicitado ou pela tool consultar_agenda) ---
    if not any(v.get('type') == 'schedule' for v in visuals):
        consultou_agenda = (
            'consultar_agenda' in tipos_acoes or
            any(termo in mensagem_usuario.lower() for termo in [
                'minha agenda', 'ver agenda', 'como está minha agenda', 'como esta minha agenda',
                'quais meus compromissos', 'quais são meus compromissos', 'o que tenho agendado',
                'o que tenho hoje', 'compromissos de hoje', 'compromissos da semana', 'consultar agenda',
                'próximos compromissos', 'proximos compromissos'
            ])
        )
        if consultou_agenda:
            agenda = coletar_dados_agenda(user_id)
            if agenda:
                visuals.append({"type": "schedule", "data": agenda})

    # --- Se perguntou por Ativo / Cotação ---
    if 'consultar_preco_ativo' in tipos_acoes or any(k in texto_busca for k in [
        'cotação', 'cotacao', 'quanto tá', 'quanto ta', 'preço', 'preco', 
        'dolar', 'dólar', 'usd', 'euro', 'eur', 'bitcoin', 'btc', 'ações', 'acoes', 'ibov', 'ibovespa'
    ]):
        ativo_param = None
        for a in acoes_a_executar:
            if a.get('type') == 'consultar_preco_ativo':
                ativo_param = a.get('data', {}).get('ativo')
                break

        cotacao = coletar_cotacao_ativo(mensagem_usuario, ticker_sugerido=ativo_param)
        if cotacao and not any(v['type'] == 'asset_quote' for v in visuals):
            visuals.append({"type": "asset_quote", "data": cotacao})

    # --- Se perguntou por Finanças / Gastos / Saldo / Orçamento (Gráficos) ---
    if any(t in ['consultar_planejamento', 'consultar_transacoes', 'gerar_resumo_visual'] for t in tipos_acoes) or \
       any(k in texto_busca for k in ['gasto', 'despesa', 'receita', 'saldo', 'como estao minhas financas', 'como estão minhas finanças', 'orçamento', 'orcamento', 'planejamento', 'extrato']):
        if not any(v['type'] == 'finance_chart' for v in visuals):
            fin_data = coletar_dados_financeiros(user_id)
            if fin_data:
                visuals.append({"type": "finance_chart", "data": fin_data})

    # Atualiza a sessão
    historico_chat.append({"role": "model", "content": resposta_final})
    sessao['chat_history'] = historico_chat
    user_sessions[session_key] = sessao

    return {
        "reply": resposta_final,
        "visuals": visuals
    }
