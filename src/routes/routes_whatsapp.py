# routes_whatsapp.py
from flask import Blueprint, request
from src.models.user import User
from src.services.schedule_service import criar_evento_agenda, buscar_resumo_agenda
from src.services.investments_service import processar_investimento_whatsapp, buscar_dados_ativo, gerar_resumo_carteira
import locale
from src.services.transacoes_service import format_currency_brl
from src.models.extended import Investment
from src.services.schedule_service import get_agenda_summary, create_agenda_event_from_whatsapp
from src.services.transacoes_service import buscar_transacoes_por_status
from src.services.transacoes_service import buscar_resumo_planejamento
from src.services.investments_service import buscar_dados_ativo
from src.services.goals_service import get_user_goals, add_value_to_goal
from src.services.credit_card_service import get_card_limit_details, process_card_payment
from src.models.extended_modules import Fatura, CreditCard
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
    criar_lancamento,
    buscar_transacoes_por_periodo,
    buscar_transacoes_pendentes,
    confirmar_transacao_por_id,
    buscar_resumo_planejamento # <-- ADICIONE ESTA LINHA
)
from src.services.categorias_service import buscar_categorias

whatsapp_bp = Blueprint('whatsapp', __name__)

# --------------------------------------------------------------------------
# FUNÇÃO PRINCIPAL DO WEBHOOK - PONTO DE ENTRADA
# --------------------------------------------------------------------------
# Em src/routes/whatsapp_routes.py
# Substitua a função receive_message inteira por esta versão

# --------------------------------------------------------------------------
# FUNÇÃO PRINCIPAL DO WEBHOOK - PONTO DE ENTRADA
# --------------------------------------------------------------------------
# Dentro de src/routes/routes_whatsapp.py

@whatsapp_bp.route('/receive_whatsapp', methods=['POST'])
def receive_message():
    """
    Esta função é o coração do webhook. Ela agora atua como um "roteador":
    - Se houver uma conversa em andamento (contexto), ela a continua.
    - Se não, ela inicia uma nova conversa com a IA.
    """
    incoming_msg = request.values.get('Body', '').strip()
    media_url = request.values.get('MediaUrl0', None)
    from_number = request.values.get('From', '')

    numero_normalizado = normalizar_numero(from_number)
    usuario = User.query.filter_by(whatsapp=numero_normalizado).first()

    if not usuario:
        resposta = 'Opa! 📲 Não encontrei seu número em nossa base. Verifique se o número está cadastrado corretamente no seu perfil do Simplific Pro.'
    else:
        # --- ESTA É A CORREÇÃO CRUCIAL ---
        sessao = user_sessions.get(from_number, {})
        contexto = sessao.get('contexto')

        # Se existe um contexto, significa que estamos no meio de uma conversa.
        if contexto:
            # A mensagem (ex: "1") é enviada para a função que sabe lidar com respostas numéricas.
            resposta = tratar_resposta_numerica(incoming_msg, from_number, usuario.id)
        else:
            # Se não há contexto, é uma nova conversa, então chamamos a IA.
            resposta = tratar_nova_interacao(incoming_msg, media_url, from_number, usuario)
        # --- FIM DA CORREÇÃO ---

    resp = MessagingResponse()
    resp.message(resposta)
    return str(resp)

# --------------------------------------------------------------------------
# ORQUESTRADOR PRINCIPAL DA IA
# --------------------------------------------------------------------------
# Em src/routes/whatsapp_routes.py

def tratar_nova_interacao(mensagem_usuario, media_url, from_number, usuario):
    sessao = user_sessions.get(from_number, {})
    historico_chat = sessao.get('chat_history', [])
    historico_chat.append({"role": "user", "content": mensagem_usuario})

    texto_para_usuario, acao_a_executar = get_ai_response(usuario.id, historico_chat)

    resposta_final = texto_para_usuario
    if acao_a_executar:
        resultado_acao = executar_acao_simplific(usuario.id, acao_a_executar, from_number)
        # Se a ação retornou um texto (como uma cotação), anexa à resposta
        if resultado_acao:
            # Se a ação retornou uma nova pergunta (como no caso da Renda Fixa),
            # essa pergunta se torna a resposta principal.
            resposta_final = resultado_acao

    historico_chat.append({"role": "model", "content": resposta_final})
    user_sessions[from_number] = {'chat_history': historico_chat}

    return resposta_final

# Em src/routes/whatsapp_routes.py
# Substitua a função inteira por esta versão com a indentação corrigida

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

            # 1. Busca as categorias do usuário para encontrar o ID correto
            categorias_usuario = buscar_categorias(user_id)
            categoria_encontrada = next((cat for cat in categorias_usuario if cat['name'].lower() == category_name.lower()), None)

            if not categoria_encontrada:
                # Se o Simplific não achou uma categoria, informa o usuário.
                return f"Não encontrei a categoria '{category_name}'. Por favor, tente novamente com uma das suas categorias cadastradas."

            # 2. Chama o serviço para criar o lançamento no banco de dados
            criar_lancamento(
                user_id=user_id,
                tipo=dados.get('type'),
                categoria_id=categoria_encontrada['id'],
                valor=dados.get('value'),
                descricao=dados.get('description')
            )

            # 3. Retorna None. Isso é crucial!
            # Ao retornar None, nós dizemos ao sistema para usar a resposta
            # conversacional e amigável que o Simplific já preparou, em vez
            # de uma mensagem robótica.
            return None

        elif tipo_acao == 'consultar_agenda':
            resumo = get_agenda_summary(user_id)
            return formatar_resumo_agenda(resumo) # Precisaremos criar esta função de formatação

        elif tipo_acao == 'cadastrar_evento_agenda':
            success, message = create_agenda_event_from_whatsapp(user_id, dados_acao)
            if success:
                # Retorna None para usar a resposta amigável do Simplific
                return None
            else:
                return message # Retorna a mensagem de erro

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
                resposta += f"{emoji} *{t['description']}*: {format_currency_brl(t['value'])}\n"

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
            periodo_texto = dados_acao.get('periodo', 'este mês')

            # Calcula as datas com base no texto (ex: "este mês")
            try:
                data_inicio, data_fim = calcular_intervalo_datas(periodo_texto)
            except ValueError as e:
                return str(e)
            
            # Chama o serviço para buscar os dados do Orçado vs. Realizado
            resumo_planejamento = buscar_resumo_planejamento(user_id, data_inicio, data_fim)
            # Chama a função que já existe para formatar a resposta para o usuário
            return formatar_resumo_planejamento(resumo_planejamento, periodo_texto)
            
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

# --------------------------------------------------------------------------
# FUNÇÕES AUXILIARES
# --------------------------------------------------------------------------
def calcular_intervalo_datas(periodo_texto):
    """
    Converte uma string de período (ex: "esta semana") em datas de início e fim.
    """
    hoje = date.today()
    if periodo_texto == "hoje":
        return hoje, hoje
    if periodo_texto == "ontem":
        ontem = hoje - timedelta(days=1)
        return ontem, ontem
    if periodo_texto == "esta semana":
        inicio_semana = hoje - timedelta(days=hoje.weekday())
        return inicio_semana, hoje
    if periodo_texto == "semana passada":
        fim_semana_passada = hoje - timedelta(days=hoje.weekday() + 1)
        inicio_semana_passada = fim_semana_passada - timedelta(days=6)
        return inicio_semana_passada, fim_semana_passada
    if periodo_texto == "este mês":
        inicio_mes = hoje.replace(day=1)
        return inicio_mes, hoje
    if periodo_texto == "mês passado":
        fim_mes_passado = hoje.replace(day=1) - timedelta(days=1)
        inicio_mes_passado = fim_mes_passado.replace(day=1)
        return inicio_mes_passado, fim_mes_passado
    
    raise ValueError("Período de tempo não reconhecido.")

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
