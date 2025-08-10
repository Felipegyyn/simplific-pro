import yfinance as yf
from datetime import datetime, timedelta
import time
from src.models.db import db
from src.models.extended import Investment
import os
import google.generativeai as genai

def format_currency_brl(value):
    """
    Formata um número como moeda brasileira (R$), de forma independente do locale do sistema.
    Ex: 1234.5 -> 'R$ 1.234,50'
    """
    if value is None:
        value = 0
    # Formata o número com 2 casas decimais, usando vírgula como separador decimal
    # e ponto como separador de milhar.
    formatted_value = "{:,.2f}".format(value).replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {formatted_value}"

# --- Bloco de Configuração do Gemini para Tradução ---
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Usamos um modelo rápido, ideal para tarefas de tradução/resumo
    translation_model = genai.GenerativeModel(model_name="models/gemini-1.5-flash-latest")
else:
    translation_model = None
# --- Fim do Bloco de Configuração ---

def _traduzir_e_resumir_noticia(titulo_em_ingles):
    """
    Usa o Gemini para traduzir e resumir uma manchete de notícia.
    """
    if not translation_model or not titulo_em_ingles:
        return titulo_em_ingles # Retorna o original se o Gemini não estiver configurado

    try:
        # Este é o prompt que ensina a IA a ser nosso editor
        prompt = f"Traduza a seguinte manchete de notícia financeira para o português do Brasil e a resuma em uma única frase completa, sem quebras de linha e sem reticências. Manchete original: '{titulo_em_ingles}'"
        response = translation_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Erro ao traduzir notícia com Gemini: {e}")
        return titulo_em_ingles # Em caso de erro, retorna o título original para não quebrar o fluxo

# --- FUNÇÕES AUXILIARES DE BUSCA DE PREÇO (Adaptadas do seu investments.py) ---

def _get_stock_price(ticker):
    """Busca o preço de mercado atual de um ativo."""
    try:
        if not ticker.upper().endswith('.SA'):
            ticker = f"{ticker.upper()}.SA"
        stock = yf.Ticker(ticker)
        # Tenta múltiplos campos para garantir que o preço seja encontrado
        price = stock.info.get('regularMarketPrice') or stock.info.get('currentPrice') or stock.info.get('ask')
        time.sleep(0.1) # Pequena pausa para não sobrecarregar a API do yfinance
        return float(price) if price else None
    except Exception:
        return None

def _get_historical_stock_price(ticker, purchase_date):
    """Busca o preço de fechamento de um ativo na data de compra."""
    if purchase_date > datetime.now().date():
        return None

    if not ticker.upper().endswith('.SA'):
        ticker = f"{ticker.upper()}.SA"
    
    for i in range(7): # Tenta buscar voltando até 7 dias
        try:
            target_date = purchase_date - timedelta(days=i)
            end_date = target_date + timedelta(days=1)
            data = yf.download(ticker, start=target_date, end=end_date, progress=False, auto_adjust=True)
            if not data.empty:
                return data['Close'].iloc[0].item()
            time.sleep(0.1)
        except Exception:
            continue
            
    return None

# --- FUNÇÃO PRINCIPAL (O NOSSO "MOTOR") ---

def processar_investimento_whatsapp(user_id, data_gemini):
    """
    Processa os dados de um novo investimento vindos do Gemini.
    Valida o ticker, calcula os valores e cria o registro no banco.
    """
    ticker = data_gemini.get('ticker')
    quantidade = data_gemini.get('quantidade')
    preco_unitario = data_gemini.get('preco_unitario')
    valor_total = data_gemini.get('valor_total')

    if not ticker:
        return {"status": "erro", "mensagem": "Não consegui identificar o nome do ativo. Tente novamente."}

    # 1. VALIDAÇÃO DO ATIVO COM YFINANCE
    current_price = _get_stock_price(ticker)
    
    # 2. FLUXO PARA ATIVOS VÁLIDOS (AÇÕES/FIIs)
    if current_price:
        purchase_date = datetime.now().date()
        
        # Lógica de cálculo flexível
        if valor_total:
            initial_value = float(valor_total)
            price_on_purchase_date = _get_historical_stock_price(ticker, purchase_date)
            if not price_on_purchase_date or price_on_purchase_date == 0:
                return {"status": "erro", "mensagem": f"Não consegui encontrar o preço de '{ticker}' para hoje. O mercado pode estar fechado."}
            quantity = initial_value / price_on_purchase_date
        elif quantidade and preco_unitario:
            quantity = float(quantidade)
            initial_value = quantity * float(preco_unitario)
        else:
            return {"status": "erro", "mensagem": "Preciso que você me informe a quantidade e o preço, ou o valor total investido."}

        current_value = current_price * quantity
        
        # Cria o objeto de investimento
        novo_investimento = Investment(
            user_id=user_id,
            name=ticker.upper(),
            type='Ações', # Assume 'Ações' como padrão, pode ser ajustado
            ticker=ticker.upper(),
            initial_value=initial_value,
            current_value=current_value,
            quantity=quantity,
            purchase_date=purchase_date
        )
        db.session.add(novo_investimento)
        db.session.commit()

        return {
            "status": "sucesso_acao_fii",
            "data": {
               "ticker": ticker.upper(),
                "quantity": quantity,
                "initial_value": initial_value
            }
        }

    # 3. FLUXO PARA ATIVOS NÃO ENCONTRADOS (RENDA FIXA)
    else:
        return {
            "status": "ativo_nao_encontrado",
            "data_sessao": {
                "ticker": ticker,
                "valor_total": valor_total
            }
        }
    
# --- NOVO MOTOR DE BUSCA DE COTAÇÕES ADICIONADO ABAIXO ---

def buscar_dados_ativo(nome_ativo):
    """
    Busca os dados de mercado (preço, variação, notícia) para um ativo específico.
    """
    # Dicionário para "traduzir" nomes comuns para os tickers oficiais do Yahoo Finance
    mapa_de_ativos = {
        "dolar": "BRL=X",
        "dólar": "BRL=X",
        "euro": "EURBRL=X",
        "ibovespa": "^BVSP",
        "ibov": "^BVSP",
    }
    
    # Limpa e verifica se o nome do ativo está no nosso mapa
    ticker_limpo = nome_ativo.lower().strip()
    ticker = mapa_de_ativos.get(ticker_limpo, ticker_limpo)

    # Adiciona o sufixo .SA para ativos brasileiros que não são moedas ou índices
    if not ticker.startswith('^') and not ticker.endswith('=X') and not '.' in ticker:
        ticker = f"{ticker.upper()}.SA"
    
    try:
        print(f"Buscando dados para o ticker: {ticker}")
        ativo_yf = yf.Ticker(ticker)
        info = ativo_yf.info
        
        # Tenta obter o preço. Se falhar, o ativo provavelmente não existe.
        preco_atual = info.get('regularMarketPrice') or info.get('currentPrice')
        if not preco_atual:
            return {"status": "nao_encontrado", "ativo": nome_ativo}

        preco_anterior = info.get('previousClose', 0)
        
        # Calcula a variação do dia
        variacao = ((preco_atual / preco_anterior) - 1) * 100 if preco_anterior > 0 else 0
    
        # Busca, traduz e resume a notícia mais recente
        noticias = ativo_yf.news
        noticia_recente = None
        if noticias:
            try:
                primeira_noticia = noticias[0]
                titulo_original = primeira_noticia.get('content', {}).get('title')
                link = primeira_noticia.get('content', {}).get('canonicalUrl', {}).get('url')
                
                if titulo_original and link:
                    # ▼▼▼ A MÁGICA ACONTECE AQUI ▼▼▼
                    titulo_traduzido = _traduzir_e_resumir_noticia(titulo_original)
                    noticia_recente = {'title': titulo_traduzido, 'link': link}

            except (IndexError, AttributeError):
                noticia_recente = None


        print(f"--- DEBUG: Notícias recebidas para {ticker}: {noticias}")
        
        return {
            "status": "sucesso",
            "data": {
                "nome": info.get('shortName', nome_ativo),
                "ticker": ticker.replace('.SA', ''),
                "preco": float(preco_atual),
                "variacao_percentual": float(variacao),
                "noticia": noticia_recente # Pode ser None se não houver notícias
            }
        }

    except Exception as e:
        print(f"Erro ao buscar dados do ativo '{ticker}': {e}")
        return {"status": "erro", "mensagem": f"Não foi possível buscar os dados para '{nome_ativo}'."}

# --- NOVO MOTOR DE ANÁLISE DE CARTEIRA ADICIONADO ABAIXO ---

def gerar_resumo_carteira(user_id):
    """
    Busca todos os investimentos de um usuário, atualiza seus valores
    e calcula a performance geral e individual.
    """
    # 1. Busca todos os investimentos ativos do usuário no banco
    investimentos = Investment.query.filter_by(user_id=user_id, is_active=True).all()

    if not investimentos:
        return None # Retorna None se o usuário não tiver investimentos

    resumo_geral = {
        'total_investido': 0,
        'total_atual': 0,
    }
    
    ativos_detalhados = []

    # 2. Itera sobre cada investimento para calcular sua performance
    for inv in investimentos:
        valor_atual_calculado = inv.current_value

        # Se for Ação/FII, busca o preço mais recente
        if inv.ticker:
            preco_atual = _get_stock_price(inv.ticker)
            if preco_atual:
                valor_atual_calculado = preco_atual * inv.quantity
        
        # Se for Renda Fixa, calcula o rendimento
        elif inv.expected_monthly_yield and inv.purchase_date:
            taxa_mensal = inv.expected_monthly_yield / 100
            # Calcula o número de meses completos desde a compra
            meses_passados = (datetime.now().date().year - inv.purchase_date.year) * 12 + datetime.now().date().month - inv.purchase_date.month
            if meses_passados > 0:
                valor_atual_calculado = inv.initial_value * ((1 + taxa_mensal) ** meses_passados)

        # Calcula a performance individual do ativo
        lucro_prejuizo = valor_atual_calculado - inv.initial_value
        rentabilidade = (lucro_prejuizo / inv.initial_value) * 100 if inv.initial_value > 0 else 0

        ativos_detalhados.append({
            'nome': inv.name,
            'valor_investido': inv.initial_value,
            'valor_atual': valor_atual_calculado,
            'lucro_prejuizo': lucro_prejuizo,
            'rentabilidade': rentabilidade
        })

        # Soma os totais para o resumo geral da carteira
        resumo_geral['total_investido'] += inv.initial_value
        resumo_geral['total_atual'] += valor_atual_calculado

    # 3. Calcula a performance geral da carteira
    lucro_geral = resumo_geral['total_atual'] - resumo_geral['total_investido']
    rentabilidade_geral = (lucro_geral / resumo_geral['total_investido']) * 100 if resumo_geral['total_investido'] > 0 else 0
    resumo_geral['lucro_prejuizo'] = lucro_geral
    resumo_geral['rentabilidade'] = rentabilidade_geral

    # 4. Retorna um dicionário com todos os dados calculados
    return {
        'resumo_geral': resumo_geral,
        'ativos': ativos_detalhados
    }

def get_investments_summary_for_ai(user_id):
    """Gera um resumo textual da carteira de investimentos para a IA."""
    # Reutiliza a função que já existe para gerar o resumo completo
    resumo_carteira = gerar_resumo_carteira(user_id)
    
    if not resumo_carteira or not resumo_carteira.get('resumo_geral'):
        return "Investimentos: Nenhuma carteira de investimentos encontrada."

    resumo_geral = resumo_carteira['resumo_geral']
    total_atual = resumo_geral.get('total_atual', 0)
    lucro_prejuizo = resumo_geral.get('lucro_prejuizo', 0)
    rentabilidade = resumo_geral.get('rentabilidade', 0)

    resumo = (
        f"Investimentos: Sua carteira tem um valor total de {format_currency_brl(total_atual)}, "
        f"com um resultado (lucro/prejuízo) de {format_currency_brl(lucro_prejuizo)} ({rentabilidade:+.2f}%)."
    )
    return resumo
