# routes_whatsapp.py
from flask import Blueprint, request, current_app
import os # <-- ADICIONE
import dateparser # <-- ADICIONE AQUI
import calendar   # <-- ADICIONE AQUI
from src.models.user import User
import threading
import traceback
from src.services.whatsapp_service import (
    send_whatsapp_media, 
    send_whatsapp_message,
    send_whatsapp_template,
    template_sids,
    user_sessions, 
    remover_sessao
)
from src.services.schedule_service import criar_evento_agenda, buscar_resumo_agenda
from src.services.visual_report_service import generate_visual_report
from src.services.whatsapp_service import send_whatsapp_media # Precisaremos desta nova função
from src.services.tts_service import texto_para_audio # <-- ADICIONE
from src.models.extended_modules import BankAccount
from src.models.contact import Contact  # <--- NOVO: Modelo de Contatos
from src.services.user_service import normalize_phone_number # <--- NOVO: Para salvar o zap do contato certo
from src.services.google_calendar_service import add_event_to_google # <--- NOVO: Para criar o Meet
from src.services.investments_service import processar_investimento_whatsapp, buscar_dados_ativo, gerar_resumo_carteira
import locale
from src.utils.formatters import format_currency_brl
from src.services.simulation_service import run_financial_simulation
from src.services.transcription_service import transcrever_audio_de_url # <-- ADICIONE ESTA LINHA
from src.models.extended import Investment, ScheduleEvent
from src.services.schedule_service import get_agenda_summary, create_agenda_event_from_whatsapp
from src.services.transacoes_service import buscar_transacoes_por_status
from src.services.reports_service import buscar_resumo_planejamento
from src.services.investments_service import buscar_dados_ativo
from src.services.goals_service import get_user_goals, add_value_to_goal
from src.services.credit_card_service import get_card_limit_details, process_card_payment
from src.models.extended_modules import Fatura, CreditCard
from sqlalchemy import or_  # <--- ADICIONE ISSO PARA PERMITIR A BUSCA DUPLA
from src.services.credit_card_service import process_card_transaction
from src.models.db import db
from twilio.twiml.messaging_response import MessagingResponse
import re
from datetime import date, timedelta, datetime
from collections import defaultdict

# --- NOSSOS SERVIÇOS ---
from src.services.ai_assessor_service import get_ai_response # <-- O NOVO CÉREBRO
from src.services.whatsapp_service import user_sessions, remover_sessao
from src.services.transacoes_service import (
    buscar_transacoes_pendentes,
    confirmar_transacao_por_id,
    processar_comprovante_imagem
)

from src.routes.financial import criar_lancamento
from src.services.reports_service import buscar_resumo_planejamento, buscar_transacoes_por_periodo
from src.services.reports_service import buscar_transacoes_por_periodo
from src.services.categorias_service import buscar_categorias


whatsapp_bp = Blueprint('whatsapp', __name__)

# Dentro de src/routes/routes_whatsapp.py

def processar_mensagem_em_background(app, from_number, usuario, mensagem_processada, media_url_imagem):
    """
    Esta função roda em um thread separado para não bloquear o webhook da Twilio.
    Ela contém toda a lógica lenta de IA e banco de dados.
    AGORA USANDO PRINT TRACEBACK.
    """
    with app.app_context():
        try:
            print(f"Iniciando processamento em background para: {from_number}")
            
            # 1. Pega a sessão
            sessao = user_sessions.get(from_number, {})
            contexto = sessao.get('contexto')
            
            resposta_em_texto = "" # Variável para guardar a resposta

            # 3. ▼▼▼ ESTA É A NOVA LÓGICA DE DECISÃO ▼▼▼
            if media_url_imagem:
                # Se recebemos uma URL de imagem, ela tem prioridade MÁXIMA
                print(f"Usuário {from_number} enviou uma IMAGEM. Processando comprovante...")
                
                # Chama nosso novo orquestrador da Fase 2
                resultado = processar_comprovante_imagem(usuario.id, media_url_imagem)
                
                # Pega a mensagem de sucesso ou erro do serviço
                resposta_em_texto = resultado.get('mensagem', "Não consegui processar seu comprovante.")
            
            elif contexto:
                # Se não for imagem E tiver contexto, trata resposta numérica
                print(f"Usuário {from_number} está no contexto: {contexto}")
                resposta_em_texto = tratar_resposta_numerica(mensagem_processada, from_number, usuario.id)
            
            elif mensagem_processada:
                # Se não for imagem, não tiver contexto, mas tiver texto, trata nova interação
                print(f"Usuário {from_number} sem contexto, chamando nova interação.")
                resposta_em_texto = tratar_nova_interacao(mensagem_processada, None, from_number, usuario)
            
            else:
                # Caso de segurança: recebeu nem imagem, nem texto, nem contexto
                print(f"AVISO: Processamento em background não recebeu dados (nem texto, nem imagem).")
                resposta_em_texto = "Não entendi o que você enviou. Pode tentar de novo?"
            # ▲▲▲ FIM DA NOVA LÓGICA DE DECISÃO ▲▲▲

            # 3. Bloco de limpeza
            if resposta_em_texto:
                resposta_em_texto = re.sub(r'\*+([^\*]+)\*+', r'*\1*', resposta_em_texto)

            # 4. Barreira de segurança
            if not resposta_em_texto or not resposta_em_texto.strip():
                print(f"AVISO: A rota /receive_whatsapp (BG) está prestes a enviar uma resposta vazia. (Usuário: {usuario.id})")
                resposta_em_texto = "Ocorreu um problema e não consegui gerar uma resposta. Por favor, tente novamente."

            # 5. Lógica de envio
            send_as_audio = usuario.preferred_response_format == 'audio'

            if send_as_audio:
                print("Decisão (BG): Enviar áudio (Via REST API).")
                nome_arquivo = texto_para_audio(resposta_em_texto)
                if nome_arquivo:
                    base_url = os.getenv('BASE_URL')
                    url_publica = f"{base_url}/audio/{nome_arquivo}"
                    print(f"Enviando áudio (BG): {url_publica}")
                    send_whatsapp_media(from_number, url_publica, caption="")
                else:
                    print("Falha ao gerar áudio. Enviando fallback em texto.")
                    send_whatsapp_message(from_number, "Tive um problema para gerar o áudio, mas aqui está a resposta: " + resposta_em_texto)
            else:
                print("Decisão (BG): Enviar texto (Via REST API).")
                send_whatsapp_message(from_number, resposta_em_texto)
            
            print(f"Processamento em background para {from_number} concluído com sucesso.")

        except Exception as e:
            # --- ESTA É A MUDANÇA CRÍTICA ---
            # Força o traceback completo do erro a ser impresso no log
            print("--- ERRO CRÍTICO NO THREAD DE PROCESSAMENTO ---")
            print(traceback.format_exc())
            print("-------------------------------------------------")
            # --- FIM DA MUDANÇA ---
            try:
                # Tenta enviar um erro final
                send_whatsapp_message(from_number, "Ocorreu um erro inesperado no sistema. A equipe já foi notificada.")
            except Exception as e2:
                print(f"--- ERRO AO ENVIAR MENSAGEM DE ERRO: {e2} ---")
                pass # Falha total

@whatsapp_bp.route('/receive_whatsapp', methods=['POST'])
def receive_message():
    """
    Função coração do webhook.
    Agora ela é RÁPIDA. Ela apenas coleta os dados, inicia um thread
    em segundo plano para fazer o trabalho pesado e retorna um 200 OK
    imediato para a Twilio para evitar timeout.
    """
    # 1. Coleta de dados
    incoming_msg_text = request.values.get('Body', '').strip()
    media_url = request.values.get('MediaUrl0', None)
    media_type = request.values.get('MediaContentType0', '')
    from_number = request.values.get('From', '')

    # 2. Transcrição (tarefa rápida, pode ficar aqui)
    is_incoming_audio = media_url and 'audio' in media_type
    is_incoming_image = media_url and 'image' in media_type
    mensagem_processada = incoming_msg_text

    # ▼▼▼ BLOCO MODIFICADO ▼▼▼
    if is_incoming_audio:
        texto_transcrito = transcrever_audio_de_url(media_url)
        if texto_transcrito:
            mensagem_processada = texto_transcrito
        else:
            # Falha na transcrição, retorna erro rápido
            resp = MessagingResponse()
            resp.message("Não consegui entender o que você disse no áudio. Pode tentar de novo? 🤔")
            return str(resp)
            
    # Se for uma imagem, não há texto para processar, mas não é um erro
    elif is_incoming_image:
        mensagem_processada = None # Não há texto
        
    elif not mensagem_processada:
        # Mensagem vazia (e não é áudio nem imagem), retorna rápido
        return str(MessagingResponse())
    # ▲▲▲ FIM DO BLOCO MODIFICADO ▲▲▲


    # 3. Lógica de "cancelar" (rápida, pode ficar aqui)
    # MODIFICADO: Verifica se mensagem_processada não é None antes de acessar .lower()
    if mensagem_processada and mensagem_processada.lower().strip() == 'cancelar':
        remover_sessao(from_number)
        resp = MessagingResponse()
        resp.message("Ok! Ação anterior cancelada. 👋\nEm que posso te ajudar agora?")
        return str(resp) # Retorno rápido

    # 4. Validação do usuário (BUSCA DUPLA: Titular ou Secundário)
    numero_normalizado = normalizar_numero(from_number)
    
    # AQUI ESTÁ A MÁGICA:
    # Procura um usuário onde o whats titular SEJA o número 
    # OU o whats secundário SEJA o número.
    usuario = User.query.filter(
        or_(
            User.whatsapp == numero_normalizado, 
            User.secondary_whatsapp == numero_normalizado
        )
    ).first()

    if not usuario:
        resp = MessagingResponse()
        resp.message('Opa! 📲 Não encontrei seu número em nossa base (nem como titular, nem como adicional). Verifique seu cadastro na plataforma.')
        return str(resp) # Retorno rápido
    
    if usuario.status != 'ativo':
        resp = MessagingResponse()
        resp.message("Sua conta Simplific Pro está inativa. Entre em contato com o suporte.")
        return str(resp) # Retorno rápido

    # --- A GRANDE MUDANÇA (COM INDENTAÇÃO CORRIGIDA) ---
    
    # 5. Pega o objeto 'app' real de dentro do proxy
    app_context = current_app._get_current_object()

    # ▼▼▼ ESTA É A MUDANÇA CRÍTICA NOS ARGUMENTOS DO THREAD ▼▼▼
    
    # Determina o que será passado para o background
    media_url_imagem_final = None
    if is_incoming_image:
        media_url_imagem_final = media_url # Passa a URL da imagem
    
    # 6. Inicia o processamento pesado em um thread separado
    thread = threading.Thread(
        target=processar_mensagem_em_background,
        args=(
            app_context, 
            from_number, 
            usuario,
            mensagem_processada,       # Passa o texto (ou None)
            media_url_imagem_final  # Passa a URL da imagem (ou None)
        )
    )
    # ▲▲▲ FIM DA MUDANÇA CRÍTICA ▲▲▲
    
    thread.start()

    # 7. Retorna o TwiML vazio IMEDIATAMENTE para a Twilio
    # (Esta linha também deve estar no mesmo nível)
    resp = MessagingResponse()
    return str(resp)

def tratar_nova_interacao(mensagem_usuario, media_url, from_number, usuario):
    sessao = user_sessions.get(from_number, {})
    historico_chat = sessao.get('chat_history', [])
    historico_chat.append({"role": "user", "content": mensagem_usuario})

    # ▼▼▼ NOVA LÓGICA DE NOME (Rayany vs Felipe) ▼▼▼
    # 1. Normaliza o número de quem enviou a mensagem agora
    numero_envio = normalizar_numero(from_number)
    
    # 2. Define o nome padrão como o do titular
    nome_exibicao = usuario.name 
    
    # 3. Se o número de envio bater com o secundário cadastrado, troca o nome
    if usuario.secondary_whatsapp and numero_envio == usuario.secondary_whatsapp:
        nome_exibicao = usuario.secondary_name or "Parceiro(a)"
    # ▲▲▲ FIM DA NOVA LÓGICA ▲▲▲

    # 4. Chama a IA passando o nome correto (nome_usuario_personalizado)
    texto_para_usuario, acao_a_executar = get_ai_response(
        usuario.id, 
        historico_chat, 
        nome_usuario_personalizado=nome_exibicao # <--- AQUI A MÁGICA ACONTECE
    )

    resposta_final = texto_para_usuario
    if acao_a_executar:
        resultado_acao = executar_acao_simplific(usuario.id, acao_a_executar, from_number)
        # Se a ação retornou um texto (como uma cotação), anexa à resposta
        if resultado_acao:
            # Se a ação retornou uma nova pergunta (como no caso da Renda Fixa),
            # essa pergunta se torna a resposta principal.
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
    Agora retorna uma string com o resultado da ação.
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
            bank_account_name = dados.get('bank_account_name') # <--- IA tentou extrair
            
            # 1. Busca a categoria
            categorias_usuario = buscar_categorias(user_id)
            categoria_encontrada = next((cat for cat in categorias_usuario if cat['name'].lower() == category_name.lower()), None)

            if not categoria_encontrada:
                return f"Não encontrei a categoria '{category_name}'. Tente novamente com uma categoria válida."

            # 2. Lógica da Conta Bancária
            conta_encontrada = None
            
            # Cenário A: IA identificou um nome de banco
            if bank_account_name:
                conta_encontrada = BankAccount.query.filter(
                    BankAccount.user_id == user_id,
                    BankAccount.bank_name.ilike(f'%{bank_account_name}%')
                ).first()
                
                if not conta_encontrada:
                    # Se falou nome mas não achou, avisa e pede pra selecionar manual depois
                    # (Ou podemos seguir sem conta, mas melhor avisar)
                    pass 

            # Cenário B: Não temos conta definida. Vamos perguntar!
            if not conta_encontrada:
                # Salva os dados na sessão para concluir depois
                user_sessions[from_number] = {
                    'contexto': 'perguntar_vincular_conta',
                    'dados_lancamento': {
                        'user_id': user_id,
                        'tipo': dados.get('type'),
                        'categoria_id': categoria_encontrada['id'],
                        'categoria_nome': categoria_encontrada['name'], # Para exibir na msg
                        'valor': dados.get('value'),
                        'descricao': dados.get('description')
                    }
                }
                
                # Retorna a pergunta interativa
                return (
                    f"Entendi! Vou lançar *{dados.get('description')}* (R$ {dados.get('value')}) em *{category_name}*.\n\n"
                    f"Deseja vincular a uma conta bancária para atualizar o saldo?\n"
                    f"1. Sim\n"
                    f"2. Não (Lançar sem conta)"
                )

            # Cenário C: Temos a conta! Lança direto.
            criar_lancamento(
                user_id=user_id,
                tipo=dados.get('type'),
                categoria_id=categoria_encontrada['id'],
                valor=dados.get('value'),
                descricao=dados.get('description'),
                bank_account_id=conta_encontrada.id
            )
            
            # Retorna None para usar a resposta padrão da IA (que geralmente confirma o feito)
            # Mas como alteramos o fluxo, a IA pode ter dito "Vou lançar...", então aqui confirmamos.
            emoji = "💰" if dados.get('type') == 'entrada' else "💸"
            return f"Feito! {emoji} Lançamento registrado na conta *{conta_encontrada.bank_name}* e saldo atualizado."

        elif tipo_acao == 'consultar_agenda':
            resumo = get_agenda_summary(user_id)
            return formatar_resumo_agenda(resumo) # Precisaremos criar esta função de formatação

        elif tipo_acao == 'cadastrar_evento_agenda':
            # Verifica se é uma reunião com Meet (novo fluxo)
            if dados_acao.get('create_meet'):
                return handle_agendar_reuniao_meet(dados_acao, user_id)
            else:
                # Fluxo antigo (lembrete simples)
                success, message = create_agenda_event_from_whatsapp(user_id, dados_acao)
                if success:
                    return None
                else:
                    return message

        # ▼▼▼ NOVAS AÇÕES DE CONTATO ▼▼▼
        elif tipo_acao == 'consultar_contato':
            nome_busca = dados_acao.get('nome')
            return handle_consultar_contato(user_id, nome_busca)

        elif tipo_acao == 'cadastrar_contato':
            return handle_cadastrar_contato(user_id, dados_acao)
        # ▲▲▲ FIM DAS NOVAS AÇÕES ▲▲▲

        elif tipo_acao == 'simular_cenario_financeiro':
            # 1. Chama o nosso novo motor de simulação com os dados extraídos pela IA
            resultado = run_financial_simulation(user_id, dados_acao)

            # 2. Envia o resultado numérico para ser "traduzido" para uma mensagem amigável
            return formatar_resultado_simulacao(resultado)

        # ▲▲▲ FIM DO BLOCO ▲▲▲

        elif tipo_acao == 'gerar_resumo_visual':
            periodo_texto = dados_acao.get('periodo', 'este mês')
            try:
                # Reutilizamos nossa função de datas para entender o período
                data_inicio, _ = calcular_intervalo_datas(periodo_texto)

                # Chama o motor para gerar a imagem
                image_url, error = generate_visual_report(user_id, data_inicio)

                if error:
                    return error # Retorna a mensagem de erro para o usuário

                # Envia a imagem diretamente pelo WhatsApp
                numero_destino = f'whatsapp:{User.query.get(user_id).whatsapp}'
                send_whatsapp_media(numero_destino, image_url, f"Prontinho! Aqui está seu resumo visual de {periodo_texto}. ✨")

                # Retorna None para que a IA não envie uma mensagem de texto duplicada
                return None

            except Exception as e:
                print(f"ERRO ao gerar/enviar resumo visual: {e}")
                return "Não consegui gerar seu resumo visual agora. Tente novamente."

        elif tipo_acao == 'consultar_transacoes':
            dados = dados_acao
            status = dados.get('status', 'confirmada')
            tipo = dados.get('tipo', 'ambos') # Pega o tipo extraído pelo Gemini
            periodo_texto = dados.get('periodo', 'este mês')

            try:
                data_inicio, data_fim = calcular_intervalo_datas(periodo_texto)
            except ValueError as e:
                return str(e)

            # Chama a nova função de serviço com o filtro de tipo
            transacoes = buscar_transacoes_por_status(user_id, status, data_inicio, data_fim, tipo)

            if not transacoes:
                tipo_texto = "receitas" if tipo == 'entrada' else "despesas"
                return f"Boas notícias! Você não tem nenhuma {tipo_texto} com status '{status}' para {periodo_texto}."

            # Formata a resposta diferenciando Receitas de Despesas
            resposta = f"Aqui estão seus lançamentos com status '{status}' para {periodo_texto}: Para *confirmar um lançamento*, Não esqueça de *acessar a plataforma*\n\n"
            for t in transacoes:
                # Adiciona um emoji para diferenciar entrada e saída
                emoji = "🟢" if t['type'] == 'entrada' else "🔴"
                resposta += f"{emoji} {t['description']}: {format_currency_brl(t['value'])}\n"

            return resposta

        # LANÇAR GASTOS NO CARTÃO
        elif tipo_acao == 'lancar_gasto_cartao':
            dados = dados_acao
            nome_cartao = dados.get('card_name')
            valor = dados.get('value')
            
            # Lógica para encontrar o cartão pelo nome
            card = CreditCard.query.filter(CreditCard.user_id == user_id, CreditCard.name.ilike(f'%{nome_cartao}%')).first()
            if not card:
                return f"Não encontrei um cartão com o nome '{nome_cartao}'."

            # Prepara os dados para o serviço
            gasto_data = {
                'description': dados.get('description'),
                'value': valor,
                'installments': dados.get('installments', 1)
            }
            
            # Chama o serviço correto que atualiza a fatura e o limite
            success, message = process_card_transaction(user_id, card.id, gasto_data)

            # Retorna None para que a resposta original e amigável do Simplific seja usada
            if success:
                return None
            else:
                return message # Retorna a mensagem de erro se houver

        elif tipo_acao == 'add_value_to_goal':
            dados = dados_acao
            nome_meta = dados.get('goal_name')
            valor = dados.get('value')

            # 1. Busca as metas do usuário para encontrar o ID correto
            metas_usuario = get_user_goals(user_id)
            meta_encontrada = next((meta for meta in metas_usuario if nome_meta.lower() in meta['name'].lower()), None)

            if not meta_encontrada:
                return f"Não encontrei uma meta com o nome '{nome_meta}'. Tente novamente."

            # 2. Chama o serviço que faz todo o trabalho (atualiza a meta E cria a despesa)
            success, message = add_value_to_goal(user_id, meta_encontrada['id'], valor)

            # 3. Retorna None para que a resposta original e amigável do Simplific seja usada
            if success:
                return None
            else:
                return message # Retorna a mensagem de erro se houver


        elif tipo_acao == 'cadastrar_investimento':
            resultado = processar_investimento_whatsapp(user_id, dados_acao)
            status = resultado.get('status')

            if status == 'sucesso_acao_fii':
                dados_sucesso = resultado.get('data', {})
                ticker = dados_sucesso.get('ticker')
                # Retorna None para que a resposta original do Simplific seja usada
                return None

            elif status == 'ativo_nao_encontrado':
                # Inicia o fluxo interativo para Renda Fixa
                user_sessions[from_number] = {
                    'contexto': 'cadastrar_renda_fixa',
                    'dados_investimento': resultado.get('data_sessao')
                }
                ticker_nome = resultado.get('data_sessao', {}).get('ticker', 'Ativo')
                # Retorna a pergunta para o usuário     
                return f"Não encontrei o ativo '{ticker_nome}' na bolsa. Ele é um investimento de Renda Fixa (CDB, LCI, etc)?\n\n1. Sim\n2. Não"

            else: # Se for 'erro'
                return resultado.get('mensagem', 'Ocorreu um erro ao processar seu investimento.')

        elif tipo_acao == 'pay_credit_card_bill':
            # Lógica para encontrar o ID da fatura a partir do nome do cartão
            return "Ação de pagamento de fatura executada."
        
        elif tipo_acao == 'create_schedule_event':
            # Lógica para criar o evento
            return "Ação de agendamento executada."

        elif tipo_acao == 'consultar_planejamento':
            # 1. Pega o período que o Gemini extraiu, ou usa 'este mês' como padrão.
            periodo_texto_gemini = dados_acao.get('periodo', 'este mês')

            try:
                # 2. Calcula as datas de início e fim.
                data_inicio, data_fim = calcular_intervalo_datas(periodo_texto_gemini)

                # 3. (A MELHORIA) Cria um texto descritivo baseado na data REAL calculada.
                # Isso garante que a resposta esteja sempre certa, independente do texto do Gemini.
                try:
                    # Tenta usar a biblioteca 'locale' para o nome do mês em português.
                    locale.setlocale(locale.LC_TIME, 'pt_BR.UTF-8')
                    periodo_descritivo = data_inicio.strftime("para %B de %Y").capitalize()
                except Exception:
                    # Se 'locale' falhar no servidor (comum), usa uma lista manual. É mais garantido.
                    meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
                    periodo_descritivo = f"para {meses[data_inicio.month - 1]} de {data_inicio.year}"
            
            except ValueError as e:
                return str(e)

            # 4. Busca os dados do planejamento no banco.
            resumo_planejamento = buscar_resumo_planejamento(user_id, data_inicio, data_fim)

            # 5. Formata a resposta usando nosso novo texto descritivo e inteligente.
            return formatar_resumo_planejamento(resumo_planejamento, periodo_descritivo)
   
        elif tipo_acao == 'consultar_preco_ativo':
            # A indentação correta começa aqui
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



# --------------------------------------------------------------------------
# FUNÇÕES DE LÓGICA (HANDLERS)
# --------------------------------------------------------------------------
def handle_criar_lancamento(data, from_number, usuario, categorias_usuario):
    """
    Lida com a lógica de criar um novo lançamento.
    """
    descricao = data.get('descricao')
    valor = data.get('valor')
    tipo = data.get('tipo')
    categoria_nome = data.get('categoria')

    # Cenário 1: Gemini entendeu tudo
    if descricao and valor and tipo and categoria_nome:
        categoria_encontrada = next((cat for cat in categorias_usuario if cat['name'].lower() == categoria_nome.lower()), None)
        if categoria_encontrada:
            criar_lancamento(usuario.id, tipo, categoria_encontrada['id'], valor, descricao)
            if tipo == 'saida':
                mensagem_sucesso = f'Anotado! 📝\n\nSua despesa de *{descricao.capitalize()}* na categoria *{categoria_nome}* (R$ {valor:.2f}) já tá na conta. Manda a próxima! 😉'
            else: # Se for 'entrada'
                mensagem_sucesso = f'Anotado! 💰\n\nSua receita de *{descricao.capitalize()}* na categoria *{categoria_nome}* (R$ {valor:.2f}) entrou na conta. Coisa boa! 💰🤑'
            return mensagem_sucesso

        else:
            categoria_nome = None # Força a queda para o cenário 2

    # Cenário 2: Faltou a categoria
    if descricao and valor and tipo:
        categorias_compativeis = [cat for cat in categorias_usuario if cat['type'] == tipo]
        if not categorias_compativeis:
            return f"Entendi um lançamento de '{descricao}', mas você não tem categorias do tipo '{tipo}' cadastradas."

        user_sessions[from_number] = {'tipo': tipo, 'valor': valor, 'descricao': descricao, 'categorias': categorias_compativeis}
        
        resposta = f'Entendi! Um(a) {tipo} de R$ {valor:.2f} referente a "{descricao}".\n\nEm qual categoria você quer lançar? 👇\n'
        for idx, cat in enumerate(categorias_compativeis, start=1):
            resposta += f'{idx}. {cat["name"]}\n'
        return resposta

    return 'Não consegui extrair as informações para criar o lançamento. Por favor, tente ser mais específico.'

def handle_consultar_resumo(data, usuario):
    """
    Lida com a lógica de consultar um resumo de transações.
    """
    periodo_texto = data.get('periodo', 'este mês')
    tipo_consulta = data.get('tipo_consulta', 'ambos')

    # 1. Converte o período em texto para datas reais
    try:
        data_inicio, data_fim = calcular_intervalo_datas(periodo_texto)
    except ValueError as e:
        return str(e)

    # 2. Busca as transações no banco de dados
    transacoes = buscar_transacoes_por_periodo(usuario.id, data_inicio, data_fim, tipo_consulta)

    # 3. Formata a resposta para o usuário
    return formatar_resumo_transacoes(transacoes, periodo_texto, tipo_consulta)

def handle_consultar_pendentes(from_number, usuario, from_session=False):
    """
    Busca transações pendentes (do banco ou da sessão) e as apresenta ao usuário.
    """
    # Se a chamada vier de uma continuação, pega as pendências restantes da sessão
    if from_session:
        sessao = user_sessions.get(from_number, {})
        pendentes = sessao.get('pendencias', [])
    else:
        # Senão, busca do banco de dados como antes
        pendentes = buscar_transacoes_pendentes(usuario.id)

    if not pendentes:
        remover_sessao(from_number) # Limpa a sessão se não houver mais nada
        return "Boas notícias! ✨ Você não tem mais lançamentos pendentes para confirmar."

    # Salva (ou atualiza) a lista de pendências na sessão
    user_sessions[from_number] = {
        'contexto': 'confirmar_pendente',
        'pendencias': pendentes
    }

    resposta = "Olha só! Estes lançamentos ainda estão pendentes 👀📝:\n\n"
    for idx, p in enumerate(pendentes, start=1):
        tipo_emoji = "➡️" if p['type'] == 'saida' else "⬅️"
        resposta += f"{idx}. {tipo_emoji} *{p['description']}* - {format_currency_brl(p['value'])}\n"
    
    resposta += "\nQuer confirmar algum? É só mandar o número 📝 Se mudar de ideia, digita qualquer coisa pra cancelar. 😉"
    return resposta

def handle_consultar_planejamento(data, usuario):
    """
    Lida com a lógica de consultar um resumo do planejamento.
    """
    periodo_texto = data.get('periodo', 'este mês')

    try:
        data_inicio, data_fim = calcular_intervalo_datas(periodo_texto)
    except ValueError as e:
        return str(e)

    # Chama o novo motor de análise que criamos
    resumo_planejamento = buscar_resumo_planejamento(usuario.id, data_inicio, data_fim)

    # Formata a resposta para o usuário
    return formatar_resumo_planejamento(resumo_planejamento, periodo_texto)

def handle_cadastrar_investimento(data, from_number, usuario):
    """
    Lida com a lógica de cadastrar um novo investimento.
    """
    # Chama o nosso "motor" de investimentos
    resultado = processar_investimento_whatsapp(usuario.id, data)
    
    status = resultado.get('status')
    
    if status == 'sucesso_acao_fii':
        dados_sucesso = resultado.get('data', {})
        ticker = dados_sucesso.get('ticker')
        quantity = dados_sucesso.get('quantity', 0)
        initial_value = dados_sucesso.get('initial_value', 0)

        # Formata os números para o padrão brasileiro
        # Para a quantidade, trocamos o ponto decimal por vírgula
        quantidade_formatada = f"{quantity:.4f}".replace('.', ',')
        # Para o valor, usamos a função de formatação de moeda que já temos
        valor_formatado = format_currency_brl(initial_value)

        mensagem = (
            f"✅ Investimento em *{ticker}* cadastrado com sucesso!\n\n"
            f"- Quantidade: *{quantidade_formatada}* cotas\n"
            f"- Valor Total: *{valor_formatado}*"
        )
        return mensagem
        
    elif status == 'ativo_nao_encontrado':
        # Inicia o fluxo de Renda Fixa
        user_sessions[from_number] = {
            'contexto': 'cadastrar_renda_fixa',
            'dados_investimento': resultado.get('data_sessao')
        }
        ticker_nome = resultado.get('data_sessao', {}).get('ticker', 'Ativo')
        return f"Não encontrei o ativo '{ticker_nome}' na bolsa. Ele é um investimento de Renda Fixa (CDB, LCI, etc)?\n\n1. Sim\n2. Não"
        
    else: # Se for 'erro'
        return resultado.get('mensagem', 'Ocorreu um erro ao processar seu investimento.')

def handle_consultar_preco_ativo(data):
    """
    Lida com a lógica de consultar o preço de um ativo.
    """
    nome_ativo = data.get('ativo')
    if not nome_ativo:
        return "Não consegui identificar qual ativo você quer consultar. Tente de novo, por exemplo: 'preço da PETR4'."

    # Chama o nosso "motor" de busca de cotações
    resultado = buscar_dados_ativo(nome_ativo)
    
    status = resultado.get('status')

    if status == 'sucesso':
        # Se encontrou, formata a mensagem de resposta
        return formatar_resposta_ativo(resultado.get('data'))
    elif status == 'nao_encontrado':
        return f"Desculpe, não encontrei nenhum ativo com o nome '{nome_ativo}'. Verifique se o código está correto."
    else: # erro
        return resultado.get('mensagem', 'Ocorreu um erro ao buscar os dados do ativo.')

def handle_consultar_carteira(usuario):
    """
    Lida com a lógica de consultar a performance da carteira de investimentos.
    """
    # Chama o nosso "motor" de análise de carteira
    resumo_carteira = gerar_resumo_carteira(usuario.id)
    
    if not resumo_carteira:
        return "Você ainda não possui investimentos cadastrados para que eu possa analisar. Que tal começar?"

    # Se a análise foi bem-sucedida, formata a mensagem de resposta
    return formatar_resumo_carteira(resumo_carteira)

def handle_cadastrar_evento_agenda(data, usuario):
    """
    Lida com a lógica de cadastrar um novo evento na agenda.
    """
    titulo = data.get('titulo')
    data_evento = data.get('data_evento')

    if not titulo or not data_evento:
        return "Não consegui entender os detalhes do evento. Tente de novo, por exemplo: 'marcar reunião amanhã às 10h'."

    evento_criado = criar_evento_agenda(usuario.id, titulo, data_evento)

    if evento_criado:
        # Formata a data para uma leitura mais amigável
        data_formatada = evento_criado.date.strftime('%d/%m/%Y')
        hora_formatada = evento_criado.time
        return f"✅ Agendado! Lembrete para '{titulo}' foi marcado para o dia {data_formatada} às {hora_formatada}."
    else:
        return "Ocorreu um erro ao tentar agendar seu evento. Tente novamente."

def handle_consultar_agenda(usuario):
    """
    Lida com a lógica de consultar os compromissos da agenda.
    """
    resumo_agenda = buscar_resumo_agenda(usuario.id)
    return formatar_resumo_agenda(resumo_agenda)


# ▼▼▼ COLE AS TRÊS NOVAS FUNÇÕES ABAIXO AQUI ▼▼▼

# Substitua a função inteira por esta versão corrigida

def handle_lancar_gasto_cartao(data, from_number, usuario):
    """
    Lida com a lógica de lançar um gasto no cartão de crédito,
    chamando o serviço interno em vez da rota da API.
    """
    descricao = data.get('descricao')
    valor = data.get('valor')
    nome_cartao = data.get('nome_cartao')
    parcelas = data.get('parcelas') or 1

    if not descricao or not valor:
        return "Não consegui entender os detalhes do gasto. Tente de novo."

    gasto_data = {
        'description': descricao,
        'value': valor,
        'installments': parcelas,
        'category_id': 6 # Categoria padrão "Compras". Ajuste se necessário.
    }

    # Cenário 1: O usuário especificou o nome do cartão
    if nome_cartao:
        card = CreditCard.query.filter(CreditCard.user_id == usuario.id, CreditCard.name.ilike(f'%{nome_cartao}%')).first()
        if not card:
            return f"Não encontrei um cartão com o nome '{nome_cartao}'."

        # Chama o SERVIÇO, não a rota da API
        success, message = process_card_transaction(usuario.id, card.id, gasto_data)

        if success:
            return f"✅ Gasto de *{format_currency_brl(valor)}* em *{descricao}* lançado com sucesso no cartão *{card.name}*!"
        else:
            return f"❌ Ops! {message}"

    # Cenário 2: O usuário NÃO especificou o cartão
    else:
        cards = CreditCard.query.filter_by(user_id=usuario.id, is_active=True).all()
        if not cards:
            return "Você não tem nenhum cartão de crédito cadastrado."

        # Se só tem um cartão, usa ele direto
        if len(cards) == 1:
            card = cards[0]
            success, message = process_card_transaction(usuario.id, card.id, gasto_data)
            if success:
                return f"✅ Gasto de *{format_currency_brl(valor)}* em *{descricao}* lançado no seu cartão *{card.name}*!"
            else:
                return f"❌ Ops! {message}"

        # Se tem múltiplos cartões, inicia a conversa
        else:
            user_sessions[from_number] = {
                'contexto': 'selecionar_cartao_para_gasto',
                'gasto_data': gasto_data,
                'lista_cartoes': [{'id': c.id, 'name': c.name, 'available_limit': c.available_limit} for c in cards]
            }
            resposta = f"Entendi o gasto. Em qual cartão você quer lançar? 👇\n"
            for idx, c in enumerate(cards, start=1):
                resposta += f"{idx}. {c.name} (Disp: {format_currency_brl(c.available_limit)})\n"
            return resposta

def handle_consultar_limite_cartao(data, usuario):
    """
    Lida com a consulta de limites de cartão de crédito.
    """
    card_name = data.get('nome_cartao')
    # Chama a função do nosso novo serviço para buscar os dados
    limites = get_card_limit_details(usuario.id, card_name)

    if not limites:
        return f"Não encontrei nenhum cartão com o nome '{card_name}'." if card_name else "Você não tem cartões cadastrados."

    resposta = "💳 *Resumo dos Limites dos Seus Cartões:*\n"
    for cartao in limites:
        resposta += (
            f"\n*{cartao['name']}*\n"
            f"  Limite Total: {format_currency_brl(cartao['limit'])}\n"
            f"  Limite Usado: {format_currency_brl(cartao['used_limit'])}\n"
            f"  Disponível: *{format_currency_brl(cartao['available_limit'])}*\n"
            f"  Comprometido: {cartao['usage_percentage']:.0f}% {'⚠️' if cartao['usage_percentage'] > 80 else '✅'}\n"
        )
    return resposta

def handle_pagar_fatura_cartao(data, from_number, usuario):
    """
    Inicia o fluxo para pagamento de uma fatura de cartão.
    """
    card_name = data.get('nome_cartao')
    if not card_name:
        return "Para pagar uma fatura, preciso que você me diga de qual cartão. Ex: 'pagar fatura do nubank'."

    card = CreditCard.query.filter(CreditCard.user_id == usuario.id, CreditCard.name.ilike(f'%{card_name}%')).first()
    if not card:
        return f"Não encontrei um cartão com o nome '{card_name}'."

    fatura = Fatura.query.filter_by(cartao_id=card.id, user_id=usuario.id, status='aberta').first()
    if not fatura:
        return f"Boas notícias! Não há faturas abertas para o cartão *{card.name}*."

    # Inicia uma sessão para confirmar o pagamento com o usuário
    user_sessions[from_number] = {
        'contexto': 'confirmar_pagamento_fatura',
        'fatura_id': fatura.id
    }
    
    return (
        f"Encontrei a fatura aberta do cartão *{card.name}* no valor de *{format_currency_brl(fatura.valor_total)}*.\n\n"
        f"Você confirma o pagamento?\n"
        f"1. Sim, pagar agora\n"
        f"2. Não"
    )

def handle_consultar_metas(usuario):
    metas = get_user_goals(usuario.id)
    if not metas:
        return "Você ainda não tem nenhuma meta cadastrada. Que tal criar sua primeira na plataforma? ✨"
    return formatar_resumo_metas(metas)

# Em src/routes/whatsapp_routes.py
# Substitua a função inteira por esta versão mais inteligente

def handle_adicionar_valor_meta(data, from_number, usuario):
    """
    Lida com a lógica de adicionar valor a uma meta de forma dinâmica.
    """
    valor = data.get('valor')
    nome_meta_gemini = data.get('nome_meta') # O nome que o Gemini extraiu

    if not valor:
        return "Não entendi o valor que você quer adicionar. Tente de novo, por exemplo: 'guardar 50 para a meta Viagem'."

    metas_usuario = get_user_goals(usuario.id)
    if not metas_usuario:
        return "Você precisa ter ao menos uma meta cadastrada para poder adicionar valores a ela."

    # --- LÓGICA DINÂMICA ---
    # 1. Tenta encontrar a meta diretamente se o Gemini forneceu um nome
    if nome_meta_gemini:
        # Procura por uma meta que contenha o nome extraído (sem diferenciar maiúsculas/minúsculas)
        matches = [meta for meta in metas_usuario if nome_meta_gemini.lower() in meta['name'].lower()]
        
        # Se encontrou EXATAMENTE UMA meta, adiciona o valor diretamente!
        if len(matches) == 1:
            meta_encontrada = matches[0]
            success, message = add_value_to_goal(usuario.id, meta_encontrada['id'], valor)
            remover_sessao(from_number) # Limpa a sessão pois a ação foi concluída
            if success:
                return f"✅ Sucesso! {message}"
            else:
                return f"❌ Ops! {message}"

    # 2. Se não encontrou a meta ou se o Gemini não forneceu um nome,
    #    inicia a conversa para o usuário escolher.
    user_sessions[from_number] = {
        'contexto': 'selecionar_meta_para_adicionar_valor',
        'valor_adicionar': valor,
        'lista_metas': metas_usuario
    }
    
    resposta = f"Entendi! Você quer adicionar *{format_currency_brl(valor)}*. Para qual meta? 👇\n"
    for idx, meta in enumerate(metas_usuario, start=1):
        resposta += f"{idx}. {meta['name']}\n"
    return resposta

def formatar_resumo_metas(metas):
    resposta = "🎯 *Suas Metas Atuais:*\n"
    for meta in metas:
        progresso = meta['progress_percentage']
        emoji = "🏆" if progresso >= 100 else "⏳"
        barra_progresso = '🟩' * int(progresso / 10) + '⬜️' * (10 - int(progresso / 10))

        # --- CORREÇÃO DA DATA APLICADA AQUI ---
        prazo_iso = meta.get('target_date')
        if prazo_iso:
            # Converte a data do formato 'YYYY-MM-DD' para 'DD/MM/YYYY'
            prazo_br = datetime.strptime(prazo_iso, '%Y-%m-%d').strftime('%d/%m/%Y')
        else:
            prazo_br = 'Sem prazo'
        # --- FIM DA CORREÇÃO ---

        resposta += (
            f"\n{meta['name']} {emoji}\n"
            f"  Progresso: {format_currency_brl(meta['current_value'])} / {format_currency_brl(meta['target_value'])}\n"
            f"  {barra_progresso} *{progresso:.1f}%*\n"
            
            f"  Prazo: {prazo_br}\n" # Usa a data já formatada
        )
    return resposta

@whatsapp_bp.route('/whatsapp_status', methods=['POST'])
def whatsapp_status_root():
    """Captura o status se a Twilio chamar sem /api"""
    return "OK", 200

@whatsapp_bp.route('/api/whatsapp_status', methods=['POST'])
def whatsapp_status_api():
    """Captura o status se a Twilio chamar com /api explícito"""
    return "OK", 200

# --------------------------------------------------------------------------
# FUNÇÕES AUXILIARES
# --------------------------------------------------------------------------

def extrair_data_alvo(mensagem_usuario):
    """
    Analisa a mensagem do usuário para encontrar uma referência de data.
    Se não encontrar, retorna a data de hoje.
    """
    # Configurações para entender português e preferir datas futuras se for ambíguo
    data_extraida = dateparser.parse(mensagem_usuario, languages=['pt'], settings={'PREFER_DATES_FROM': 'future'})

    if data_extraida:
        return data_extraida.date()
    else:
        # Se não entender nada, retorna o dia de hoje como padrão
        return date.today()

# A função calcular_intervalo_datas virá logo abaixo


# DENTRO DE src/routes/routes_whatsapp.py

def calcular_intervalo_datas(periodo_texto):
    """
    Converte uma string de período (ex: "outubro", "mês passado") em datas de início e fim do mês correspondente.
    """
    # Usa nossa nova função inteligente para "traduzir" o texto para uma data
    data_alvo = extrair_data_alvo(periodo_texto)

    # Com a data em mãos, calculamos o primeiro e o último dia do mês dela
    primeiro_dia_mes = data_alvo.replace(day=1)
    ultimo_dia_mes = data_alvo.replace(day=calendar.monthrange(data_alvo.year, data_alvo.month)[1])

    return primeiro_dia_mes, ultimo_dia_mes

def formatar_resumo_transacoes(transacoes, periodo_texto, tipo_consulta):
    """
    Pega uma lista de transações e cria uma mensagem de resumo formatada,
    calculando o saldo corretamente.
    """
    if not transacoes:
        return f"Não encontramos lançamentos no intervalo informado 📆🚫: *{periodo_texto}*."

    # --- LÓGICA DE CÁLCULO ATUALIZADA ---
    total_receitas = 0
    total_despesas = 0
    receitas_por_categoria = defaultdict(float)
    despesas_por_categoria = defaultdict(float)

    for t in transacoes:
        if t['type'] == 'entrada':
            total_receitas += t['value']
            receitas_por_categoria[t['category_name']] += t['value']
        elif t['type'] == 'saida':
            total_despesas += t['value']
            despesas_por_categoria[t['category_name']] += t['value']

    saldo_final = total_receitas - total_despesas

    # --- LÓGICA DE MONTAGEM DA MENSAGEM ATUALIZADA ---
    resposta = f"Aqui está o resumo para *{periodo_texto}*:\n"

    if tipo_consulta == 'receitas' or (tipo_consulta == 'ambos' and total_receitas > 0):
        resposta += "\n*--- Receitas ---*\n"
        for categoria, total in sorted(receitas_por_categoria.items()):
            resposta += f"*{categoria}:* {format_currency_brl(total)}\n"
        resposta += f"*Total de Receitas:* {format_currency_brl(total_receitas)}\n"

    if tipo_consulta == 'despesas' or (tipo_consulta == 'ambos' and total_despesas > 0):
        resposta += "\n*--- Despesas ---*\n"
        for categoria, total in sorted(despesas_por_categoria.items()):
            resposta += f"*{categoria}:* {format_currency_brl(total)}\n"
        resposta += f"*Total de Despesas:* {format_currency_brl(total_despesas)}\n"

    # Adiciona o Saldo Final apenas se for uma consulta de "ambos"
    if tipo_consulta == 'ambos':
        emoji_saldo = "📈" if saldo_final >= 0 else "📉"
        resposta += f"\n{emoji_saldo} *Saldo do Período:* {format_currency_brl(saldo_final)}"

    return resposta.strip()

def formatar_resumo_planejamento(resumo, periodo_texto):
    """
    Pega os dados do planejamento e cria uma mensagem de resumo formatada.
    """
    if not resumo:
        return f"Não encontrei nenhum planejamento de despesas para *{periodo_texto}*. Que tal criar um? 😉"

    resposta = f"📊 Aqui está o resumo do seu orçamento para *{periodo_texto}*:\n\n"
    
    total_orcado = 0
    total_realizado = 0

    # Ordena por percentual, do mais comprometido para o menos
    resumo_ordenado = sorted(resumo, key=lambda x: x['percentual'], reverse=True)

    for item in resumo_ordenado:
        total_orcado += item['orcado']
        total_realizado += item['realizado']
        
        # Emoji para indicar o status do orçamento da categoria
        if item['percentual'] > 100:
            emoji = "🚨" # Alerta máximo
        elif item['percentual'] > 80:
            emoji = "⚠️" # Atenção
        else:
            emoji = "✅" # Tudo certo

        resposta += (
            f"*{item['categoria']}*\n"
            f"  Orçado: {format_currency_brl(item['orcado'])}\n"
            f"  Realizado: {format_currency_brl(item['realizado'])}\n"
            f"  {emoji} Comprometido: {item['percentual']:.0f}%\n\n"
        )
    
    percentual_total = (total_realizado / total_orcado) * 100 if total_orcado > 0 else 0
    
    resposta += (
        "*--- Resumo Geral ---*\n"
        f"Total Orçado: {format_currency_brl(total_orcado)}\n"
        f"Total Realizado: {format_currency_brl(total_realizado)}\n"
        f"Comprometimento Total: {percentual_total:.0f}%"
    )

    return resposta

def formatar_resposta_ativo(data):
    """
    Pega os dados de um ativo e cria uma mensagem de cotação formatada.
    """
    nome = data.get('nome')
    ticker = data.get('ticker')
    preco = data.get('preco', 0)
    variacao = data.get('variacao_percentual', 0)
    noticia = data.get('noticia')

    # Define o emoji com base na variação do dia
    if variacao > 0:
        emoji_variacao = "📈"
    elif variacao < 0:
        emoji_variacao = "📉"
    else:
        emoji_variacao = "📊"

    # Monta a parte principal da mensagem
    resposta = (
        f"*{nome} ({ticker})*\n"
        f"Preço Atual: *{format_currency_brl(preco)}*\n"
        f"Variação (dia): *{variacao:.2f}%* {emoji_variacao}\n"
    )

    # Adiciona a notícia mais recente, se houver
    if noticia and noticia.get('title'):
        resposta += f"\n\n*Última Notícia:*\n_{noticia['title']}_"
            # O WhatsApp não torna links clicáveis em todas as versões,
            # mas é uma boa prática incluí-lo.
            # resposta += f"\nSaiba mais: {link_noticia}"

    return resposta.strip()

def formatar_resumo_carteira(resumo):
    """
    Pega os dados da carteira e cria um relatório de performance formatado.
    """
    resumo_geral = resumo['resumo_geral']
    ativos = resumo['ativos']

    lucro_geral = resumo_geral['lucro_prejuizo']
    rentabilidade_geral = resumo_geral['rentabilidade']
    
    emoji_geral = "🚀" if lucro_geral >= 0 else "🔥"

    # --- Monta o Resumo Geral ---
    resposta = (
        f"📊 *Resumo da sua Carteira de Investimentos*\n\n"
        f"Valor Investido: *{format_currency_brl(resumo_geral['total_investido'])}*\n"
        f"Valor Atual: *{format_currency_brl(resumo_geral['total_atual'])}*\n"
        f"Resultado: *{format_currency_brl(lucro_geral)}* ({rentabilidade_geral:+.2f}%) {emoji_geral}\n"
    )
    
    resposta += "\n*--- Desempenho por Ativo ---*\n"

    # --- Monta o Detalhe de Cada Ativo ---
    # Ordena os ativos pelo maior lucro/prejuízo
    ativos_ordenados = sorted(ativos, key=lambda x: x['lucro_prejuizo'], reverse=True)

    for ativo in ativos_ordenados:
        lucro_ativo = ativo['lucro_prejuizo']
        rentabilidade_ativo = ativo['rentabilidade']
        emoji_ativo = "🟢" if lucro_ativo >= 0 else "🔴"

        resposta += (
            f"\n*{ativo['nome']}*\n"
            f"  Resultado: {format_currency_brl(lucro_ativo)} ({rentabilidade_ativo:+.2f}%) {emoji_ativo}\n"
            f"  Investido: {format_currency_brl(ativo['valor_investido'])} | Atual: {format_currency_brl(ativo['valor_atual'])}"
        )

    return resposta.strip()

def formatar_resumo_agenda(resumo):
    """
    Pega os dados da agenda e cria uma mensagem formatada para o usuário.
    """
    atrasados = resumo.get('atrasados', [])
    hoje = resumo.get('hoje', [])
    proximos = resumo.get('proximos', [])

    if not atrasados and not hoje and not proximos:
        return "Sua agenda está limpa! Nenhum compromisso pendente. ✨"

    resposta = "🗓️ *Seus Compromissos:*\n"

    if atrasados:
        resposta += "\n*--- Atrasados ---*\n" # <-- Palavra "overdue" removida
        for evento in atrasados:
            data_formatada = datetime.strptime(evento['date'], '%Y-%m-%d').strftime('%d/%m')
            resposta += f"🔴 *{evento['title']}* - {data_formatada}\n"
            # Adiciona a descrição se ela existir
            if evento.get('description'):
                resposta += f"   _{evento['description']}_\n"

    if hoje:
        resposta += "\n*--- Para Hoje ---*\n"
        for evento in hoje:
            resposta += f"🔵 *{evento['title']}* - às {evento['time']}\n"
            # Adiciona a descrição se ela existir
            if evento.get('description'):
                resposta += f"   _{evento['description']}_\n"

    if proximos:
        resposta += "\n*--- Próximos ---*\n"
        for evento in proximos[:5]:
            data_formatada = datetime.strptime(evento['date'], '%Y-%m-%d').strftime('%d/%m')
            resposta += f"⚪️ *{evento['title']}* - {data_formatada} às {evento['time']}\n"
            # Adiciona a descrição se ela existir
            if evento.get('description'):
                resposta += f"   _{evento['description']}_\n"

    return resposta.strip()

def tratar_resposta_numerica(mensagem, from_number, user_id):
    """
    Trata a resposta do usuário quando ele está em uma conversa (sessão).
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
                remover_sessao(from_number) # Limpa a sessão se a opção for inválida
                return 'Opção inválida. Ação cancelada.'
        except (ValueError, IndexError):
            remover_sessao(from_number) # Limpa a sessão em caso de erro
            return 'Resposta inválida. Ação cancelada.' 


    elif contexto == 'confirmar_lancamento_lembrete':
        sessao = buscar_sessao(from_number) # Importar buscar_sessao
        transaction_id = sessao.get('transaction_id')
        resposta_usuario = mensagem.strip().lower()

        if resposta_usuario in ['sim', 's']:
            # Importar a função de confirmar
            from src.services.transacoes_service import confirmar_transacao_por_id

            sucesso = confirmar_transacao_por_id(transaction_id, user_id)
            if sucesso:
                remover_sessao(from_number)
                return "Confirmado! Seu lançamento foi atualizado. ✅"
            else:
                remover_sessao(from_number)
                return "Ocorreu um erro ao tentar confirmar. Por favor, confirme manualmente na plataforma."

        elif resposta_usuario in ['não', 'nao', 'n']:
            remover_sessao(from_number)
            return "Ok! Não esqueça de confirmar o lançamento quando ele for concluído. 😉"
        
        else:
            # Não remove a sessão, para o usuário poder tentar de novo
            return "Não entendi sua resposta. Por favor, responda apenas com 'Sim' ou 'Não'."
    # ▲▲▲ FIM DO NOVO BLOCO ▲▲▲

    # --- NOVO FLUXO: CONFIRMAR SE É RENDA FIXA ---
    elif contexto == 'cadastrar_renda_fixa':
        if mensagem == '1': # Sim, é Renda Fixa
            dados = sessao['dados_investimento']
            if dados.get('valor_total'):
                # Se já temos o valor, pula para a pergunta da rentabilidade
                sessao['contexto'] = 'aguardando_rentabilidade'
                return "Ótimo! Qual a rentabilidade anual esperada para este investimento? (Envie apenas o número, ex: 10.5)"
            else:
                # Se não temos o valor, pergunta primeiro
                sessao['contexto'] = 'aguardando_valor_rf'
                return "Entendido. Qual o valor total que você investiu neste ativo?"
        else: # Não
            remover_sessao(from_number)
            return "Ok, ação cancelada. Se o ticker estiver incorreto, tente enviá-lo novamente."

    # --- NOVO FLUXO: RECEBER VALOR DA RENDA FIXA ---
    elif contexto == 'aguardando_valor_rf':
        try:
            valor = float(mensagem.replace('.', '').replace(',', '.'))
            sessao['dados_investimento']['valor_total'] = valor
            sessao['contexto'] = 'aguardando_rentabilidade'
            return "Legal! E qual a rentabilidade anual esperada? (Envie apenas o número, ex: 10.5)"
        except ValueError:
            return "Valor inválido. Por favor, envie apenas números."

    # --- NOVO FLUXO: RECEBER RENTABILIDADE E FINALIZAR ---
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
                expected_monthly_yield=(rentabilidade / 12) # Converte anual para mensal
            )
            db.session.add(novo_investimento)
            db.session.commit()
            
            remover_sessao(from_number)
            return f"✅ Investimento de Renda Fixa '{dados['ticker']}' cadastrado com sucesso!"
        except ValueError:
            return "Rentabilidade inválida. Por favor, envie apenas números."

    # ▼▼▼ ADICIONE O NOVO BLOCO EXATAMENTE AQUI ▼▼▼
    # --- NOVO FLUXO: CONFIRMAR PAGAMENTO DE FATURA ---
    elif contexto == 'confirmar_pagamento_fatura':
        if mensagem == '1': # Sim, pagar
            fatura_id = sessao.get('fatura_id')
            # Chama a lógica de negócio que está no serviço
            success, message = process_card_payment(user_id, fatura_id)
            remover_sessao(from_number)
            if success:
                return f"✅ Pagamento confirmado! {message}"
            else:
                return f"❌ Ops! Ocorreu um erro: {message}"
        else: # Não ou qualquer outra coisa
            remover_sessao(from_number)
            return "Ok, pagamento cancelado."
    # ▲▲▲ FIM DO NOVO BLOCO ▲▲▲

    #--- NOVO FLUXO: SELECIONAR CARTÃO PARA LANÇAR GASTO ---
    elif contexto == 'selecionar_cartao_para_gasto':
        try:
            idx_escolhido = int(mensagem)
            lista_cartoes = sessao['lista_cartoes']
            gasto_data = sessao['gasto_data']

            if 1 <= idx_escolhido <= len(lista_cartoes):
                cartao_escolhido = lista_cartoes[idx_escolhido - 1]

                # Checa o limite novamente
                if gasto_data['value'] > cartao_escolhido['available_limit']:
                    remover_sessao(from_number)
                    return f"❌ Limite insuficiente no cartão *{cartao_escolhido['name']}*! Ação cancelada."

                # Lança a transação
                create_credit_card_transaction(cartao_escolhido['id'], payload=gasto_data)
                remover_sessao(from_number)
                return f"✅ Gasto lançado com sucesso no cartão *{cartao_escolhido['name']}*!"
            else:
                remover_sessao(from_number)
                return 'Opção inválida. Ação cancelada.'
        except (ValueError, IndexError, KeyError):
            remover_sessao(from_number)
            return 'Resposta inválida. Ação cancelada.'
            # ▲▲▲ FIM DO NOVO BLOCO ▲▲▲

    # --- NOVO FLUXO: SELECIONAR META PARA ADICIONAR VALOR ---
    elif contexto == 'selecionar_meta_para_adicionar_valor':
        try:
            idx_escolhido = int(mensagem)
            lista_metas = sessao['lista_metas']
            valor_adicionar = sessao['valor_adicionar']

            if 1 <= idx_escolhido <= len(lista_metas):
                meta_escolhida = lista_metas[idx_escolhido - 1]
                
                success, message = add_value_to_goal(user_id, meta_escolhida['id'], valor_adicionar)
                remover_sessao(from_number)
                
                if success:
                    return f"✅ Sucesso! {message}"
                else:
                    return f"❌ Ops! {message}"
            else:
                remover_sessao(from_number)
                return 'Opção inválida. Ação cancelada.'
        except (ValueError, IndexError, KeyError):
            remover_sessao(from_number)
            return 'Resposta inválida. Ação cancelada.'

    # --- NOVO FLUXO: PERGUNTAR SE QUER VINCULAR CONTA ---
    elif contexto == 'perguntar_vincular_conta':
        dados_lancamento = sessao['dados_lancamento']
        
        if mensagem == '1': # Sim, quer vincular
            # Busca as contas do usuário para mostrar a lista
            contas = BankAccount.query.filter_by(user_id=user_id, is_active=True).all()
            
            if not contas:
                # Se disse sim mas não tem contas cadastradas
                criar_lancamento(
                    dados_lancamento['user_id'], dados_lancamento['tipo'], 
                    dados_lancamento['categoria_id'], dados_lancamento['valor'], 
                    dados_lancamento['descricao'], bank_account_id=None
                )
                remover_sessao(from_number)
                return "Você não tem contas cadastradas ainda! O lançamento foi salvo sem vínculo. Crie uma conta no menu Configurações."

            # Lista as contas
            sessao['contexto'] = 'selecionar_conta_bancaria'
            sessao['lista_contas'] = contas # Guarda a lista na sessão
            
            resposta = "Selecione a conta:\n"
            for idx, conta in enumerate(contas, start=1):
                resposta += f"{idx}. {conta.bank_name} (Saldo: R$ {conta.current_balance:.2f})\n"
            
            return resposta

        else: # Não (ou qualquer outra coisa), lança sem conta
            criar_lancamento(
                dados_lancamento['user_id'], dados_lancamento['tipo'], 
                dados_lancamento['categoria_id'], dados_lancamento['valor'], 
                dados_lancamento['descricao'], bank_account_id=None
            )
            remover_sessao(from_number)
            return f"Ok! Lançamento registrado em *{dados_lancamento['categoria_nome']}* sem vínculo bancário. 👍"

    # --- NOVO FLUXO: SELECIONAR A CONTA DA LISTA ---
    elif contexto == 'selecionar_conta_bancaria':
        try:
            idx = int(mensagem)
            contas = sessao['lista_contas']
            dados_lancamento = sessao['dados_lancamento']
            
            if 1 <= idx <= len(contas):
                conta_escolhida = contas[idx - 1]
                
                # CRIA O LANÇAMENTO VINCULADO
                criar_lancamento(
                    dados_lancamento['user_id'], dados_lancamento['tipo'], 
                    dados_lancamento['categoria_id'], dados_lancamento['valor'], 
                    dados_lancamento['descricao'], bank_account_id=conta_escolhida.id
                )
                
                remover_sessao(from_number)
                return f"Pronto! Lançado na conta *{conta_escolhida.bank_name}*. Saldo atualizado! ✅"
            else:
                return "Opção inválida. Tente novamente."
        except ValueError:
            return "Por favor, digite o número da conta."

    # --- LÓGICA ANTIGA PARA ESCOLHER UMA CATEGORIA ---
    else: # Se não houver contexto, assume que é para escolher categoria
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

def normalizar_numero(numero):
    """
    Normaliza o número de telefone para o padrão E.164 (+55119XXXXXXXX).
    (Esta função permanece a mesma)
    """
    numero_limpo = re.sub(r'\D', '', numero)
    if len(numero_limpo) == 13 and numero_limpo.startswith('55'): return f'+{numero_limpo}'
    if len(numero_limpo) == 12 and numero_limpo.startswith('55'):
        ddd = numero_limpo[2:4]; resto = numero_limpo[4:]
        return f'+55{ddd}9{resto}'
    if len(numero_limpo) <= 11: return f'+55{numero_limpo}'
    return f'+{numero_limpo}'


# ▼▼▼ COLE ESTA NOVA FUNÇÃO NO FINAL DO ARQUIVO routes_whatsapp.py ▼▼▼

def formatar_resultado_simulacao(resultado):
    """
    Pega o dicionário de resultados da simulação e o transforma em uma
    mensagem de texto formatada para o usuário.
    """
    if not resultado or resultado.get('error'):
        return "Desculpe, não consegui realizar a simulação. Verifique os dados e tente novamente."

    tipo_resultado = resultado.get('tipo_resultado')

    if tipo_resultado == 'financiamento':
        valor_parcela = format_currency_brl(resultado.get('valor_parcela', 0))
        total_pago = format_currency_brl(resultado.get('total_pago', 0))
        total_juros = format_currency_brl(resultado.get('total_juros', 0))
        impacto = resultado.get('impacto_percentual_despesas', 0)

        resposta = (
            f"Aqui está a simulação do seu financiamento:\n\n"
            f"🗓️ *Valor da Parcela Mensal:* {valor_parcela}\n"
            f"💰 *Total Pago (Final):* {total_pago}\n"
            f"💸 *Custo Total em Juros:* {total_juros}\n\n"
            f"📉 *Impacto no Orçamento:*\n"
            f"Essa parcela representaria aproximadamente *{impacto:.1f}%* do total das suas despesas mensais atuais."
        )
        return resposta

    elif tipo_resultado == 'projecao_investimento':
        valor_futuro = format_currency_brl(resultado.get('valor_futuro', 0))
        total_investido = format_currency_brl(resultado.get('total_investido', 0))
        total_juros = format_currency_brl(resultado.get('total_juros', 0))

        resposta = (
            f"Aqui está a projeção do seu investimento:\n\n"
            f"🚀 *Valor Futuro Acumulado:* {valor_futuro}\n"
            f"🌱 *Total Aportado por Você:* {total_investido}\n"
            f"📈 *Total Gerado em Juros:* {total_juros}\n\n"
            f"Lembre-se que a rentabilidade passada não é garantia de rentabilidade futura!"
        )
        return resposta

    return "Não foi possível formatar o resultado da simulação."

# ▲▲▲ FIM DA FUNÇÃO ▲▲▲

# ▼▼▼ COLE NO FINAL DO ARQUIVO routes_whatsapp.py ▼▼▼

def handle_consultar_contato(user_id, nome_busca):
    """
    Busca um contato no banco de dados pelo nome (busca parcial).
    """
    if not nome_busca:
        return "Preciso de um nome para buscar."

    # Busca case-insensitive
    contato = Contact.query.filter(
        Contact.user_id == user_id, 
        Contact.name.ilike(f'%{nome_busca}%')
    ).first()

    if contato:
        dados = f"nome: {contato.name}, email: {contato.email or 'N/A'}, whatsapp: {contato.whatsapp or 'N/A'}"
        return f"Encontrei este contato na sua agenda: {dados}. Posso prosseguir com o agendamento?"
    else:
        # Retorna mensagem instruindo a IA a pedir os dados
        return f"Opa! encontrei o contato chamado '{nome_busca}'. Por favor, me informe o nome, e-mail e o WhatsApp(opcional) para eu cadastrar ele aqui rapidinho. Pode enviar tudo em uma mensagem só que eu entendo. 🫡😎"

def handle_cadastrar_contato(user_id, dados):
    """
    Cadastra um novo contato recebido via chat.
    """
    nome = dados.get('name')
    email = dados.get('email')
    whatsapp = dados.get('whatsapp')

    if not nome:
        return "O nome é obrigatório para cadastrar."

    # Normaliza o zap se vier
    whatsapp_norm = normalize_phone_number(whatsapp) if whatsapp else None

    # Verifica se já existe
    existente = Contact.query.filter_by(user_id=user_id, name=nome).first()
    if existente:
        # Atualiza dados faltantes
        if email and not existente.email: existente.email = email
        if whatsapp_norm and not existente.whatsapp: existente.whatsapp = whatsapp_norm
        db.session.commit()
        return f"Atualizei os dados do contato existente '{nome}'. Podemos agendar agora?"

    novo_contato = Contact(user_id=user_id, name=nome, email=email, whatsapp=whatsapp_norm)
    db.session.add(novo_contato)
    db.session.commit()

    return f"Contato '{nome}' cadastrado com sucesso! Agora posso agendar a reunião."

# ==============================================================================
# CORREÇÃO 2: Função de Agendamento com Prefixo 'whatsapp:'
# ==============================================================================
def handle_agendar_reuniao_meet(dados, user_id):
    user = User.query.get(user_id)
    
    # 1. Cria evento (Lógica Google - Mantida)
    class EventoSimples:
        def __init__(self, title, date_str, time_str, desc):
            self.title = title
            self.date = date_str
            self.time = time_str
            self.description = desc
            self.type = 'reuniao'

    evento = EventoSimples(
        title=dados.get('title'),
        date_str=dados.get('event_date'),
        time_str=dados.get('time', '10:00'),
        desc="Agendado via Simplific Pro"
    )
    attendee_email = dados.get('attendee_email')

    resultado_google = add_event_to_google(user, evento, attendee_email=attendee_email, create_meet=True)
    if not resultado_google:
        return "Tive um problema para conectar com o Google Agenda."

    meet_link = resultado_google.get('meet_link')
    google_event_id = resultado_google.get('id')
    data_formatada = datetime.strptime(evento.date, '%Y-%m-%d').strftime('%d/%m/%Y')
    
    # Salva no Banco Local
    try:
        novo_evento_db = ScheduleEvent(
            user_id=user.id,
            title=evento.title,
            description=f"{evento.description}\nLink do Meet: {meet_link}",
            date=datetime.strptime(evento.date, '%Y-%m-%d').date(),
            time=evento.time,
            type='reuniao',
            category='Reunião',
            google_event_id=google_event_id
        )
        db.session.add(novo_evento_db)
        db.session.commit()
    except Exception as e:
        print(f"Erro ao salvar no banco local: {e}")

    # 3. Disparar WhatsApp (A CORREÇÃO ESTÁ AQUI)
    status_envio = ""
    contato_encontrado = None

    if attendee_email:
        contato_encontrado = Contact.query.filter_by(user_id=user_id, email=attendee_email).first()
    
    if not contato_encontrado and evento.title:
        palavras = evento.title.split()
        for palavra in palavras:
            if len(palavra) > 3 and palavra.lower() not in ['com', 'para', 'reuniao', 'reunião']:
                possivel_contato = Contact.query.filter(Contact.user_id == user_id, Contact.name.ilike(f'%{palavra}%')).first()
                if possivel_contato:
                    contato_encontrado = possivel_contato
                    break

    if contato_encontrado and contato_encontrado.whatsapp:
        # 1. Normaliza o número (+55...)
        numero_limpo = normalize_phone_number(contato_encontrado.whatsapp)
        
        # 2. ADICIONA O PREFIXO OBRIGATÓRIO PARA A TWILIO
        if not numero_limpo.startswith('whatsapp:'):
            whatsapp_destino = f"whatsapp:{numero_limpo}"
        else:
            whatsapp_destino = numero_limpo
            
        print(f" >>> ENVIANDO TEMPLATE PARA: {whatsapp_destino}") # Log claro

        variaveis = {
            '1': contato_encontrado.name,       
            '2': user.name,          
            '3': data_formatada,     
            '4': evento.time,        
            '5': meet_link           
        }

        resultado_envio = send_whatsapp_template(
            to=whatsapp_destino, 
            template_sid=template_sids['convite_reuniao'], 
            content_variables=variaveis
        )

        if resultado_envio.get('status') == 'success':
            status_envio = f"✅ Convite enviado para o WhatsApp de {contato_encontrado.name}."
        else:
            erro = resultado_envio.get('message') or resultado_envio.get('error_message')
            print(f" >>> ERRO TWILIO: {erro}")
            status_envio = f"⚠️ Erro ao enviar WhatsApp: {erro}"

    else:
        status_envio = "⚠️ Contato não encontrado ou sem WhatsApp cadastrado."
    
    return (
        f"✅ *Reunião Agendada!* \n\n"
        f"🔗 *Link:* {meet_link}\n"
        f"📧 E-mail enviado.\n"
        f"{status_envio}"
    )