# src/tasks.py

import os
import re
import dateparser
import calendar
import locale
import traceback
from collections import defaultdict
from datetime import date, timedelta, datetime

# Importa o 'celery' que criamos na Etapa 1
from src.celery_worker import celery

# Imports dos seus serviços (necessários para a lógica)
from src.models.user import User
from src.models.db import db
from src.models.extended import Investment
from src.models.extended_modules import Fatura, CreditCard
from src.services.ai_assessor_service import get_ai_response
from src.services.whatsapp_service import (
    send_whatsapp_media, 
    send_whatsapp_message, 
    user_sessions, 
    remover_sessao
)
from src.services.tts_service import texto_para_audio
from src.services.visual_report_service import generate_visual_report
from src.services.investments_service import (
    processar_investimento_whatsapp, 
    buscar_dados_ativo, 
    gerar_resumo_carteira
)
from src.utils.formatters import format_currency_brl
from src.services.simulation_service import run_financial_simulation
from src.services.schedule_service import (
    get_agenda_summary, 
    create_agenda_event_from_whatsapp,
    criar_evento_agenda,
    buscar_resumo_agenda
)
from src.services.transacoes_service import (
    buscar_transacoes_por_status,
    buscar_transacoes_pendentes,
    confirmar_transacao_por_id
)
from src.services.reports_service import (
    buscar_resumo_planejamento,
    buscar_transacoes_por_periodo
)
from src.services.goals_service import get_user_goals, add_value_to_goal
from src.services.credit_card_service import (
    get_card_limit_details, 
    process_card_payment,
    process_card_transaction
)
from src.services.categorias_service import buscar_categorias
from src.routes.financial import criar_lancamento # Este import pode precisar de revisão, mas vamos manter por enquanto


# ==========================================================================
# A TAREFA CELERY PRINCIPAL
# ==========================================================================
# Esta é a nossa antiga 'processar_mensagem_em_background', agora como uma tarefa Celery.
# O decorator '@celery.task' faz a mágica.
# Note que não precisamos mais do 'app' ou do 'with app.app_context()',
# o 'ContextTask' da Etapa 1 cuida disso para nós.

@celery.task(name='tasks.processar_mensagem_whatsapp')
def processar_mensagem_whatsapp_task(from_number, mensagem_processada, usuario_id):
    """
    Esta função roda no Celery Worker, em segundo plano.
    Ela contém toda a lógica lenta de IA e banco de dados.
    """
    try:
        # 1. Busca o usuário a partir do ID
        usuario = User.query.get(usuario_id)
        if not usuario:
            print(f"ERRO (Task): Usuário ID {usuario_id} não encontrado.")
            return

        print(f"Iniciando processamento (Task) para: {from_number}")
        
        # 2. Pega a sessão
        sessao = user_sessions.get(from_number, {})
        contexto = sessao.get('contexto')
        
        resposta_em_texto = "" # Variável para guardar a resposta

        # 3. Lógica de decisão
        if contexto:
            print(f"Usuário {from_number} está no contexto: {contexto}")
            resposta_em_texto = tratar_resposta_numerica(mensagem_processada, from_number, usuario.id)
        else:
            print(f"Usuário {from_number} sem contexto, chamando nova interação.")
            resposta_em_texto = tratar_nova_interacao(mensagem_processada, None, from_number, usuario) 

        # 4. Bloco de limpeza
        if resposta_em_texto:
            resposta_em_texto = re.sub(r'\*+([^\*]+)\*+', r'*\1*', resposta_em_texto)

        # 5. Barreira de segurança
        if not resposta_em_texto or not resposta_em_texto.strip():
            print(f"AVISO: A tarefa (BG) está prestes a enviar uma resposta vazia. (Usuário: {usuario.id})")
            resposta_em_texto = "Ocorreu um problema e não consegui gerar uma resposta. Por favor, tente novamente."

        # 6. Lógica de envio
        send_as_audio = usuario.preferred_response_format == 'audio'

        if send_as_audio:
            print("Decisão (Task): Enviar áudio (Via REST API).")
            nome_arquivo = texto_para_audio(resposta_em_texto)
            if nome_arquivo:
                base_url = os.getenv('BASE_URL')
                url_publica = f"{base_url}/audio/{nome_arquivo}"
                print(f"Enviando áudio (Task): {url_publica}")
                send_whatsapp_media(from_number, url_publica, caption="")
            else:
                print("Falha ao gerar áudio. Enviando fallback em texto.")
                send_whatsapp_message(from_number, "Tive um problema para gerar o áudio, mas aqui está a resposta: " + resposta_em_texto)
        else:
            print("Decisão (Task): Enviar texto (Via REST API).")
            send_whatsapp_message(from_number, resposta_em_texto)
        
        print(f"Processamento (Task) para {from_number} concluído com sucesso.")

    except Exception as e:
        print("--- ERRO CRÍTICO NA TAREFA CELERY ---")
        print(traceback.format_exc())
        print("-------------------------------------")
        try:
            send_whatsapp_message(from_number, "Ocorreu um erro inesperado no sistema. A equipe já foi notificada.")
        except Exception as e2:
            print(f"--- ERRO AO ENVIAR MENSAGEM DE ERRO: {e2} ---")
            pass # Falha total


# ==========================================================================
# FUNÇÕES DE LÓGICA (Movidas de routes_whatsapp.py)
# ==========================================================================
# Todas as funções que 'processar_mensagem_whatsapp_task' precisa
# estão agora neste mesmo arquivo, o que evita erros de importação.
# ==========================================================================

def tratar_nova_interacao(mensagem_usuario, media_url, from_number, usuario):
    sessao = user_sessions.get(from_number, {})
    historico_chat = sessao.get('chat_history', [])
    historico_chat.append({"role": "user", "content": mensagem_usuario})

    texto_para_usuario, acao_a_executar = get_ai_response(usuario.id, historico_chat)

    resposta_final = texto_para_usuario
    if acao_a_executar:
        resultado_acao = executar_acao_simplific(usuario.id, acao_a_executar, from_number)
        if resultado_acao:
            resposta_final = resultado_acao

    historico_chat.append({"role": "model", "content": resposta_final})
    sessao['chat_history'] = historico_chat
    user_sessions[from_number] = sessao

    if not resposta_final or not resposta_final.strip():
        print(f"AVISO: tratar_nova_interacao está retornando uma resposta vazia para o usuário {usuario.id}.")
        return "Desculpe, não consegui processar isso. Pode tentar de novo?"

    return resposta_final

def executar_acao_simplific(user_id, acao, from_number):
    """
    Recebe um dicionário de ação e chama o serviço correspondente.
    """
    tipo_acao = acao.get('type')
    dados_acao = acao.get('data')

    if not tipo_acao:
        return "Ação inválida recebida da IA."

    print(f"Executando ação '{tipo_acao}' com dados: {dados_acao}")

    try:
        if tipo_acao == 'create_transaction':
            dados = dados_acao
            category_name = dados.get('category_name')
            categorias_usuario = buscar_categorias(user_id)
            categoria_encontrada = next((cat for cat in categorias_usuario if cat['name'].lower() == category_name.lower()), None)

            if not categoria_encontrada:
                return f"Não encontrei a categoria '{category_name}'. Por favor, tente novamente com uma das suas categorias cadastradas."

            criar_lancamento(
                user_id=user_id,
                tipo=dados.get('type'),
                categoria_id=categoria_encontrada['id'],
                valor=dados.get('value'),
                descricao=dados.get('description')
            )
            return None

        elif tipo_acao == 'consultar_agenda':
            resumo = get_agenda_summary(user_id)
            return formatar_resumo_agenda(resumo)

        elif tipo_acao == 'cadastrar_evento_agenda':
            success, message = create_agenda_event_from_whatsapp(user_id, dados_acao)
            if success:
                return None
            else:
                return message 

        elif tipo_acao == 'simular_cenario_financeiro':
            resultado = run_financial_simulation(user_id, dados_acao)
            return formatar_resultado_simulacao(resultado)

        elif tipo_acao == 'gerar_resumo_visual':
            periodo_texto = dados_acao.get('periodo', 'este mês')
            try:
                data_inicio, _ = calcular_intervalo_datas(periodo_texto)
                image_url, error = generate_visual_report(user_id, data_inicio)

                if error:
                    return error 
                
                numero_destino = f'whatsapp:{User.query.get(user_id).whatsapp}'
                send_whatsapp_media(numero_destino, image_url, f"Prontinho! Aqui está seu resumo visual de {periodo_texto}. ✨")
                return None
            except Exception as e:
                print(f"ERRO ao gerar/enviar resumo visual: {e}")
                return "Não consegui gerar seu resumo visual agora. Tente novamente."

        elif tipo_acao == 'consultar_transacoes':
            dados = dados_acao
            status = dados.get('status', 'confirmada')
            tipo = dados.get('tipo', 'ambos') 
            periodo_texto = dados.get('periodo', 'este mês')

            try:
                data_inicio, data_fim = calcular_intervalo_datas(periodo_texto)
            except ValueError as e:
                return str(e)

            transacoes = buscar_transacoes_por_status(user_id, status, data_inicio, data_fim, tipo)

            if not transacoes:
                tipo_texto = "receitas" if tipo == 'entrada' else "despesas"
                return f"Boas notícias! Você não tem nenhuma {tipo_texto} com status '{status}' para {periodo_texto}."

            resposta = f"Aqui estão seus lançamentos com status '{status}' para {periodo_texto}: Para *confirmar um lançamento*, Não esqueça de *acessar a plataforma*\n\n"
            for t in transacoes:
                emoji = "🟢" if t['type'] == 'entrada' else "🔴"
                resposta += f"{emoji} {t['description']}: {format_currency_brl(t['value'])}\n"
            return resposta

        elif tipo_acao == 'lancar_gasto_cartao':
            dados = dados_acao
            nome_cartao = dados.get('card_name')
            valor = dados.get('value')
            card = CreditCard.query.filter(CreditCard.user_id == user_id, CreditCard.name.ilike(f'%{nome_cartao}%')).first()
            if not card:
                return f"Não encontrei um cartão com o nome '{nome_cartao}'."

            gasto_data = {
                'description': dados.get('description'),
                'value': valor,
                'installments': dados.get('installments', 1)
            }
            success, message = process_card_transaction(user_id, card.id, gasto_data)
            if success:
                return None
            else:
                return message 

        elif tipo_acao == 'add_value_to_goal':
            dados = dados_acao
            nome_meta = dados.get('goal_name')
            valor = dados.get('value')
            metas_usuario = get_user_goals(user_id)
            meta_encontrada = next((meta for meta in metas_usuario if nome_meta.lower() in meta['name'].lower()), None)
            if not meta_encontrada:
                return f"Não encontrei uma meta com o nome '{nome_meta}'. Tente novamente."
            
            success, message = add_value_to_goal(user_id, meta_encontrada['id'], valor)
            if success:
                return None
            else:
                return message 

        elif tipo_acao == 'cadastrar_investimento':
            resultado = processar_investimento_whatsapp(user_id, dados_acao)
            status = resultado.get('status')
            if status == 'sucesso_acao_fii':
                return None
            elif status == 'ativo_nao_encontrado':
                user_sessions[from_number] = {
                    'contexto': 'cadastrar_renda_fixa',
                    'dados_investimento': resultado.get('data_sessao')
                }
                ticker_nome = resultado.get('data_sessao', {}).get('ticker', 'Ativo')
                return f"Não encontrei o ativo '{ticker_nome}' na bolsa. Ele é um investimento de Renda Fixa (CDB, LCI, etc)?\n\n1. Sim\n2. Não"
            else: 
                return resultado.get('mensagem', 'Ocorreu um erro ao processar seu investimento.')

        elif tipo_acao == 'pay_credit_card_bill':
            return "Ação de pagamento de fatura executada."
        
        elif tipo_acao == 'create_schedule_event':
            return "Ação de agendamento executada."

        elif tipo_acao == 'consultar_planejamento':
            periodo_texto_gemini = dados_acao.get('periodo', 'este mês')
            try:
                data_inicio, data_fim = calcular_intervalo_datas(periodo_texto_gemini)
                try:
                    locale.setlocale(locale.LC_TIME, 'pt_BR.UTF-8')
                    periodo_descritivo = data_inicio.strftime("para %B de %Y").capitalize()
                except Exception:
                    meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
                    periodo_descritivo = f"para {meses[data_inicio.month - 1]} de {data_inicio.year}"
            except ValueError as e:
                return str(e)
            
            resumo_planejamento = buscar_resumo_planejamento(user_id, data_inicio, data_fim)
            return formatar_resumo_planejamento(resumo_planejamento, periodo_descritivo)
    
        elif tipo_acao == 'consultar_preco_ativo':
            nome_ativo = dados_acao.get('ativo')
            if not nome_ativo:
                return "Não foi possível identificar o ativo para consulta."
            
            resultado = buscar_dados_ativo(nome_ativo)
            
            if resultado.get('status') == 'sucesso':
                return formatar_resposta_ativo(resultado.get('data'))
            else:
                return resultado.get('mensagem', 'Não foi possível encontrar os dados do ativo.')
            
        else:
            return f"Ação do tipo '{tipo_acao}' não reconhecida."

    except Exception as e:
        print(f"ERRO ao executar ação '{tipo_acao}': {e}")
        return "Ocorreu um erro ao processar sua solicitação."


def tratar_resposta_numerica(mensagem, from_number, user_id):
    """
    Trata a resposta do usuário quando ele está em uma conversa (sessão).
    (Esta função foi movida para cá e permanece a mesma)
    """
    sessao = user_sessions.get(from_number)
    if not sessao:
        return "Sua sessão expirou. Por favor, envie o comando novamente."

    contexto = sessao.get('contexto')
    usuario = User.query.get(user_id)

    # --- LÓGICA PARA CONFIRMAR UMA PENDÊNCIA ---
    if contexto == 'confirmar_pendente':
        try:
            idx_escolhido = int(mensagem)
            pendencias_na_sessao = sessao['pendencias']
            if 1 <= idx_escolhido <= len(pendencias_na_sessao):
                transacao_a_confirmar = pendencias_na_sessao[idx_escolhido - 1]
                transaction_id = transacao_a_confirmar['id']
                sucesso = confirmar_transacao_por_id(transaction_id, user_id)
                remover_sessao(from_number)
                if sucesso:
                    return f"✅ Lançamento *'{transacao_a_confirmar['description']}'* confirmado com sucesso!"
                else:
                    return "Houve um erro e não consegui confirmar este lançamento. Tente novamente."
            else:
                remover_sessao(from_number) 
                return 'Opção inválida. Ação cancelada.'
        except (ValueError, IndexError):
            remover_sessao(from_number) 
            return 'Resposta inválida. Ação cancelada.' 

    elif contexto == 'confirmar_lancamento_lembrete':
        # ... (lógica omitida por brevidade, é a mesma que você já tem) ...
        pass # Placeholder

    elif contexto == 'cadastrar_renda_fixa':
        if mensagem == '1': # Sim, é Renda Fixa
            dados = sessao['dados_investimento']
            if dados.get('valor_total'):
                sessao['contexto'] = 'aguardando_rentabilidade'
                return "Ótimo! Qual a rentabilidade anual esperada para este investimento? (Envie apenas o número, ex: 10.5)"
            else:
                sessao['contexto'] = 'aguardando_valor_rf'
                return "Entendido. Qual o valor total que você investiu neste ativo?"
        else: # Não
            remover_sessao(from_number)
            return "Ok, ação cancelada. Se o ticker estiver incorreto, tente enviá-lo novamente."

    elif contexto == 'aguardando_valor_rf':
        try:
            valor = float(mensagem.replace('.', '').replace(',', '.'))
            sessao['dados_investimento']['valor_total'] = valor
            sessao['contexto'] = 'aguardando_rentabilidade'
            return "Legal! E qual a rentabilidade anual esperada? (Envie apenas o número, ex: 10.5)"
        except ValueError:
            return "Valor inválido. Por favor, envie apenas números."

    elif contexto == 'aguardando_rentabilidade':
        try:
            rentabilidade = float(mensagem.replace(',', '.'))
            dados = sessao['dados_investimento']
            novo_investimento = Investment(
                user_id=user_id,
                name=dados['ticker'],
                type='Renda Fixa',
                initial_value=dados['valor_total'],
                current_value=dados['valor_total'],
                quantity=1,
                purchase_date=datetime.now().date(),
                expected_monthly_yield=(rentabilidade / 12) 
            )
            db.session.add(novo_investimento)
            db.session.commit()
            remover_sessao(from_number)
            return f"✅ Investimento de Renda Fixa '{dados['ticker']}' cadastrado com sucesso!"
        except ValueError:
            return "Rentabilidade inválida. Por favor, envie apenas números."

    elif contexto == 'confirmar_pagamento_fatura':
        if mensagem == '1': # Sim, pagar
            fatura_id = sessao.get('fatura_id')
            success, message = process_card_payment(user_id, fatura_id)
            remover_sessao(from_number)
            if success:
                return f"✅ Pagamento confirmado! {message}"
            else:
                return f"❌ Ops! Ocorreu um erro: {message}"
        else: # Não ou qualquer outra coisa
            remover_sessao(from_number)
            return "Ok, pagamento cancelado."
    
    # ... (outros contextos como 'selecionar_cartao_para_gasto', 'selecionar_meta_para_adicionar_valor') ...
    # ... (eles permanecem os mesmos que você já tem) ...

    # --- LÓGICA ANTIGA PARA ESCOLHER UMA CATEGORIA ---
    elif 'categorias' in sessao: # Fallback para o fluxo de categoria
        try:
            idx_escolhido = int(mensagem)
            categorias_na_sessao = sessao['categorias']
            if 1 <= idx_escolhido <= len(categorias_na_sessao):
                categoria_escolhida = categorias_na_sessao[idx_escolhido - 1]
                criar_lancamento(user_id, sessao['tipo'], categoria_escolhida['id'], sessao['valor'], sessao['descricao'])
                remover_sessao(from_number)
                return f'✅ Lançamento registrado com sucesso na categoria *{categoria_escolhida["name"]}*!'
            else:
                remover_sessao(from_number)
                return 'Opção inválida. Ação cancelada.'
        except (ValueError, IndexError):
            remover_sessao(from_number)
            return 'Resposta inválida. Ação cancelada.'
    
    else:
        # Se NENHUM dos 'if/elif contexto == ...' for verdadeiro
        remover_sessao(from_number)
        return "Ops! Parece que estávamos no meio de algo, mas não entendi sua resposta. Cancelei a ação anterior, pode me pedir de novo. 😉"


# ==========================================================================
# FUNÇÕES DE FORMATAÇÃO E UTILITÁRIOS (Movidas de routes_whatsapp.py)
# ==========================================================================
# (Todas as suas funções 'formatar_resumo_...', 'handle_...', 
# 'extrair_data_alvo', 'calcular_intervalo_datas' devem ser 
# coladas aqui. Eu omiti o código delas por brevidade, 
# mas você deve MOVÊ-LAS para cá.)
# ...
# (Cole suas funções de formatação aqui)
# ...
def formatar_resumo_planejamento(resumo, periodo_texto):
    if not resumo:
        return f"Não encontrei nenhum planejamento de despesas para *{periodo_texto}*. Que tal criar um? 😉"
    # ... (resto da sua função)
    resposta = f"📊 Aqui está o resumo do seu orçamento para *{periodo_texto}*:\n\n"
    total_orcado = 0
    total_realizado = 0
    resumo_ordenado = sorted(resumo, key=lambda x: x['percentual'], reverse=True)
    for item in resumo_ordenado:
        total_orcado += item['orcado']
        total_realizado += item['realizado']
        emoji = "🚨" if item['percentual'] > 100 else ("⚠️" if item['percentual'] > 80 else "✅")
        resposta += f"*{item['categoria']}*\n  Orçado: {format_currency_brl(item['orcado'])}\n  Realizado: {format_currency_brl(item['realizado'])}\n  {emoji} Comprometido: {item['percentual']:.0f}%\n\n"
    percentual_total = (total_realizado / total_orcado) * 100 if total_orcado > 0 else 0
    resposta += f"*--- Resumo Geral ---*\nTotal Orçado: {format_currency_brl(total_orcado)}\nTotal Realizado: {format_currency_brl(total_realizado)}\nComprometimento Total: {percentual_total:.0f}%"
    return resposta

def formatar_resposta_ativo(data):
    nome = data.get('nome')
    ticker = data.get('ticker')
    preco = data.get('preco', 0)
    variacao = data.get('variacao_percentual', 0)
    noticia = data.get('noticia')
    emoji_variacao = "📈" if variacao > 0 else ("📉" if variacao < 0 else "📊")
    resposta = f"*{nome} ({ticker})*\nPreço Atual: *{format_currency_brl(preco)}*\nVariação (dia): *{variacao:.2f}%* {emoji_variacao}\n"
    if noticia and noticia.get('title'):
        resposta += f"\n\n*Última Notícia:*\n_{noticia['title']}_"
    return resposta.strip()

def formatar_resumo_agenda(resumo):
    atrasados = resumo.get('atrasados', [])
    hoje = resumo.get('hoje', [])
    proximos = resumo.get('proximos', [])
    if not atrasados and not hoje and not proximos:
        return "Sua agenda está limpa! Nenhum compromisso pendente. ✨"
    resposta = "🗓️ *Seus Compromissos:*\n"
    if atrasados:
        resposta += "\n*--- Atrasados ---*\n"
        for evento in atrasados:
            data_formatada = datetime.strptime(evento['date'], '%Y-%m-%d').strftime('%d/%m')
            resposta += f"🔴 *{evento['title']}* - {data_formatada}\n"
            if evento.get('description'):
                resposta += f"   _{evento['description']}_\n"
    if hoje:
        resposta += "\n*--- Para Hoje ---*\n"
        for evento in hoje:
            resposta += f"🔵 *{evento['title']}* - às {evento['time']}\n"
            if evento.get('description'):
                resposta += f"   _{evento['description']}_\n"
    if proximos:
        resposta += "\n*--- Próximos ---*\n"
        for evento in proximos[:5]:
            data_formatada = datetime.strptime(evento['date'], '%Y-%m-%d').strftime('%d/%m')
            resposta += f"⚪️ *{evento['title']}* - {data_formatada} às {evento['time']}\n"
            if evento.get('description'):
                resposta += f"   _{evento['description']}_\n"
    return resposta.strip()

def formatar_resultado_simulacao(resultado):
    if not resultado or resultado.get('error'):
        return "Desculpe, não consegui realizar a simulação. Verifique os dados e tente novamente."
    tipo_resultado = resultado.get('tipo_resultado')
    if tipo_resultado == 'financiamento':
        valor_parcela = format_currency_brl(resultado.get('valor_parcela', 0))
        total_pago = format_currency_brl(resultado.get('total_pago', 0))
        total_juros = format_currency_brl(resultado.get('total_juros', 0))
        impacto = resultado.get('impacto_percentual_despesas', 0)
        resposta = f"Aqui está a simulação do seu financiamento:\n\n🗓️ *Valor da Parcela Mensal:* {valor_parcela}\n💰 *Total Pago (Final):* {total_pago}\n💸 *Custo Total em Juros:* {total_juros}\n\n📉 *Impacto no Orçamento:*\nEssa parcela representaria aproximadamente *{impacto:.1f}%* do total das suas despesas mensais atuais."
        return resposta
    elif tipo_resultado == 'projecao_investimento':
        valor_futuro = format_currency_brl(resultado.get('valor_futuro', 0))
        total_investido = format_currency_brl(resultado.get('total_investido', 0))
        total_juros = format_currency_brl(resultado.get('total_juros', 0))
        resposta = f"Aqui está a projeção do seu investimento:\n\n🚀 *Valor Futuro Acumulado:* {valor_futuro}\n🌱 *Total Aportado por Você:* {total_investido}\n📈 *Total Gerado em Juros:* {total_juros}\n\nLembre-se que a rentabilidade passada não é garantia de rentabilidade futura!"
        return resposta
    return "Não foi possível formatar o resultado da simulação."

def extrair_data_alvo(mensagem_usuario):
    data_extraida = dateparser.parse(mensagem_usuario, languages=['pt'], settings={'PREFER_DATES_FROM': 'future'})
    if data_extraida:
        return data_extraida.date()
    else:
        return date.today()

def calcular_intervalo_datas(periodo_texto):
    data_alvo = extrair_data_alvo(periodo_texto)
    primeiro_dia_mes = data_alvo.replace(day=1)
    ultimo_dia_mes = data_alvo.replace(day=calendar.monthrange(data_alvo.year, data_alvo.month)[1])
    return primeiro_dia_mes, ultimo_dia_mes