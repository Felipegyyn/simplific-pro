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
        hoje = date.today()
        inicio_mes = hoje.replace(day=1)

        # 1. Totais do mês
        totals = db.session.query(
            func.sum(case((Transaction.type == 'entrada', Transaction.value), else_=0)).label('total_revenue'),
            func.sum(case((Transaction.type == 'saida', Transaction.value), else_=0)).label('total_expense')
        ).filter(
            Transaction.user_id == user_id,
            Transaction.date.between(inicio_mes, hoje),
            Transaction.status == 'confirmada'
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
            Transaction.date.between(inicio_mes, hoje),
            Transaction.type == 'saida',
            Transaction.status == 'confirmada'
        ).group_by(Category.name).order_by(func.sum(Transaction.value).desc()).limit(6).all()

        categorias = [
            {
                "name": cat,
                "value": float(val),
                "color": PALETTE_COLORS[i % len(PALETTE_COLORS)]
            }
            for i, (cat, val) in enumerate(expenses_by_cat)
        ]

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
            "tem_dados": (receitas > 0 or despesas > 0)
        }
    except Exception as e:
        print(f"Erro ao coletar dados financeiros para o Vision: {e}")
        return None


def coletar_dados_cartoes(user_id):
    """Coleta o status dos cartões de crédito para o widget."""
    try:
        cards = CreditCard.query.filter_by(user_id=user_id).all()
        if not cards:
            return None

        result = []
        for c in cards:
            limit = float(c.credit_limit or 0)
            fatura_aberta = Fatura.query.filter_by(credit_card_id=c.id, status='aberta').first()
            fatura_val = float(fatura_aberta.valor_total) if fatura_aberta else 0.0

            result.append({
                "id": c.id,
                "name": c.name,
                "limit_total": limit,
                "invoice_current": fatura_val,
                "limit_available": max(0.0, limit - fatura_val),
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
        goals = Goal.query.filter_by(user_id=user_id).all()
        if not goals:
            return None

        result = []
        for g in goals:
            target = float(g.target_amount or 0)
            current = float(g.current_amount or 0)
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
            ScheduleEvent.event_date >= hoje
        ).order_by(ScheduleEvent.event_date.asc()).limit(4).all()

        if not events:
            return None

        result = []
        for e in events:
            result.append({
                "id": e.id,
                "title": e.title,
                "date": e.event_date.strftime("%d/%m/%Y") if e.event_date else "",
                "time": str(e.event_time)[:5] if e.event_time else "",
                "meet_link": e.meet_link,
                "attendee": e.attendee_email
            })
        return result
    except Exception as e:
        print(f"Erro ao coletar agenda para o Vision: {e}")
        return None


def coletar_cotacao_ativo(query_ou_ticker):
    """Busca cotação em tempo real de um ativo ou moeda."""
    try:
        # Extrai ticker provável (ex: 'cotação petr4' -> 'PETR4')
        tokens = query_ou_ticker.upper().replace('R$', '').split()
        ticker_candidato = None
        for tok in tokens:
            if re.match(r'^[A-Z]{4}\d{1,2}$', tok) or tok in ['USD', 'EUR', 'BTC', 'ETH', 'AAPL', 'NVDA', 'TSLA']:
                ticker_candidato = tok
                break
        
        if not ticker_candidato and tokens:
            ticker_candidato = tokens[-1]

        if not ticker_candidato:
            return None

        dados = buscar_dados_ativo(ticker_candidato)
        if dados and not dados.get('erro'):
            return {
                "ticker": dados.get('ticker', ticker_candidato),
                "name": dados.get('nome', ticker_candidato),
                "price": dados.get('preco_atual', 0.0),
                "change": dados.get('variacao_dia', '0.0%'),
                "high": dados.get('maxima_dia'),
                "low": dados.get('minima_dia')
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

    resposta_final = texto_para_usuario
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

            # Executa a ação no banco de dados
            resultado_acao = executar_acao_simplific(user_id, acao, session_key)
            if resultado_acao:
                resultados_acoes.append(resultado_acao)

        if resultados_acoes:
            if len(resultados_acoes) == 1:
                resposta_final = resultados_acoes[0]
            else:
                resposta_final += "\n\n" + "\n".join(resultados_acoes)

    # 2. Anexa Recibos Visuais
    if recibos_gerados:
        for rec in recibos_gerados:
            visuals.append(rec)
        # Sempre que houver lançamento, anexa também o gráfico atualizado das finanças
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
    if any(t in ['criar_meta', 'add_value_to_goal'] for t in tipos_acoes) or any(k in texto_busca for k in ['meta', 'metas', 'quanto guardei', 'poupança']):
        metas = coletar_dados_metas(user_id)
        if metas and not any(v['type'] == 'goals' for v in visuals):
            visuals.append({"type": "goals", "data": metas})

    # --- Se perguntou ou mexeu com Cartões ---
    if any(t in ['lancar_gasto_cartao', 'pay_credit_card_bill'] for t in tipos_acoes) or any(k in texto_busca for k in ['cartao', 'cartão', 'fatura', 'limite']):
        cartoes = coletar_dados_cartoes(user_id)
        if cartoes and not any(v['type'] == 'credit_cards' for v in visuals):
            visuals.append({"type": "credit_cards", "data": cartoes})

    # --- Se perguntou ou mexeu com Agenda ---
    if any(t in ['cadastrar_evento_agenda', 'consultar_agenda', 'create_agenda_item'] for t in tipos_acoes) or any(k in texto_busca for k in ['agenda', 'compromisso', 'reuniao', 'reunião', 'meet']):
        agenda = coletar_dados_agenda(user_id)
        if agenda and not any(v['type'] == 'schedule' for v in visuals):
            visuals.append({"type": "schedule", "data": agenda})

    # --- Se perguntou por Ativo / Cotação ---
    if 'consultar_preco_ativo' in tipos_acoes or any(k in texto_busca for k in ['cotação', 'cotacao', 'quanto tá', 'quanto ta', 'preço da ação', 'preco da acao']):
        cotacao = coletar_cotacao_ativo(mensagem_usuario)
        if cotacao and not any(v['type'] == 'asset_quote' for v in visuals):
            visuals.append({"type": "asset_quote", "data": cotacao})

    # --- Se perguntou por Finanças / Gastos / Saldo / Orçamento (Gráficos) ---
    if any(t in ['consultar_planejamento', 'consultar_transacoes', 'gerar_resumo_visual'] for t in tipos_acoes) or \
       any(k in texto_busca for k in ['gasto', 'despesa', 'receita', 'saldo', 'como estao minhas financas', 'como estão minhas finanças', 'orçamento', 'planejamento', 'extrato']):
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
