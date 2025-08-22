from flask import Blueprint, jsonify, request, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.extended import Investment, InvestmentTransaction
from src.routes.user import active_user_required
from src.models.db import db
from sqlalchemy import func, case
from datetime import datetime, timedelta # <-- ADICIONE O TIMEDELTA
import yfinance as yf
import time

investments_bp = Blueprint('investments', __name__)

# NOVO CÓDIGO A SER SUBSTITUÍDO
def get_stock_growth_projection(ticker, current_value, years=3, projection_months=24):
    """
    Calcula uma projeção de crescimento com base no histórico do ativo (CAGR).
    """
    if not ticker or not current_value:
        return []

    try:
        # Adiciona .SA para tickers brasileiros
        if not ticker.upper().endswith('.SA'):
            ticker_sa = f"{ticker.upper()}.SA"
        else:
            ticker_sa = ticker.upper()

        # 1. Usa o objeto Ticker, que é mais robusto para tickers individuais
        stock = yf.Ticker(ticker_sa)
        
        # 2. Busca dados históricos usando o método .history()
        end_date = datetime.now()
        start_date = end_date - timedelta(days=years * 365)
        hist_data = stock.history(start=start_date, end=end_date, auto_adjust=True)

        if len(hist_data) < 2:
            return []

        # 3. Calcula a Taxa de Crescimento Anual Composta (CAGR)
        start_price = hist_data['Close'].iloc[0]
        end_price = hist_data['Close'].iloc[-1]
        num_years = (hist_data.index[-1] - hist_data.index[0]).days / 365.25

        if num_years <= 0 or start_price <= 0:
            return []

        cagr = ((end_price / start_price) ** (1 / num_years)) - 1
        
        if cagr <= 0: # Não projeta crescimento se o histórico for negativo
            return []

        # 4. Converte CAGR para taxa mensal e gera a projeção
        monthly_rate = (1 + cagr) ** (1/12) - 1
        projection_data = []
        projected_value = current_value
        
        for i in range(1, projection_months + 1):
            projected_value *= (1 + monthly_rate)
            month_date = datetime.now() + timedelta(days=i * 30)
            month_label = month_date.strftime("%b/%y")
            
            projection_data.append({
                'mes': month_label,
                'valor': round(projected_value, 2)
            })
            
        return projection_data

    except Exception as e:
        print(f"Erro ao calcular projeção para {ticker}: {e}")
        return []

# ▼▼▼ SUBSTITUA O BLOCO DE FUNÇÕES AUXILIARES POR ESTE ▼▼▼

def get_stock_price(ticker):
    """Busca o preço de mercado atual de um ativo."""
    try:
        if not ticker.upper().endswith('.SA'):
            ticker = f"{ticker.upper()}.SA"
        stock = yf.Ticker(ticker)
        price = stock.info.get('regularMarketPrice') or stock.info.get('currentPrice')
        time.sleep(0.1)
        return float(price) if price else None
    except Exception:
        return None

# ▼▼▼ SUBSTITUA A FUNÇÃO get_historical_stock_price POR ESTA ▼▼▼

def get_historical_stock_price(ticker, purchase_date):
    """
    Busca o preço de fechamento de um ativo na data de compra.
    Se a data for no futuro ou um feriado/fim de semana, busca o dia útil anterior.
    """
    # Impede buscas por datas no futuro
    if purchase_date > datetime.now().date():
        return None # Não há dados para o futuro

    if not ticker.upper().endswith('.SA'):
        ticker = f"{ticker.upper()}.SA"
    
    # Tenta buscar o preço para a data, voltando até 7 dias se não encontrar
    for i in range(7):
        try:
            target_date = purchase_date - timedelta(days=i)
            # O yfinance usa o dia seguinte como data final (não inclusiva)
            end_date = target_date + timedelta(days=1)
            
            # Silencia o output do yfinance e adiciona auto_adjust=True
            data = yf.download(ticker, start=target_date, end=end_date, progress=False, auto_adjust=True)
            
            if not data.empty:
                return data['Close'].iloc[0].item()
            time.sleep(0.1)
        except Exception:
            continue # Se houver um erro, tenta o dia anterior
            
    return None # Retorna None se não encontrar dados após 7 tentativas

# Rota para buscar todos os investimentos (versão dinâmica com yfinance)
@investments_bp.route('/investments', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_investments():
    user_id = get_jwt_identity()
    investments = Investment.query.filter_by(user_id=user_id).all()
    
    # Lista para armazenar os dicionários dos investimentos
    investments_data = []
    
    # ▼▼▼ LÓGICA DO YFINANCE ▼▼▼
    for inv in investments:
        # Se tiver ticker, busca o preço atual para atualizar o valor
        if inv.ticker:
            price = get_stock_price(inv.ticker)
            # Se encontrar um preço, atualiza o valor atual do objeto em memória
            if price:
                inv.current_value = price * inv.quantity
        
        investments_data.append(inv.to_dict())

    return jsonify(investments_data)


@investments_bp.route('/investments/<int:investment_id>', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_investment_by_id(investment_id):
    user_id = get_jwt_identity()
    
    investment = Investment.query.filter_by(id=investment_id, user_id=user_id).first()

    if not investment:
        return jsonify({'error': 'Investimento não encontrado'}), 404

    # Prepara a resposta base
    response_data = investment.to_dict()
    projection_data = []

    # Se tiver ticker, tenta gerar projeção pelo histórico (CAGR)
    if investment.ticker:
        # Primeiro, atualiza o valor atual para o mais recente
        current_price = get_stock_price(investment.ticker)
        if current_price:
            investment.current_value = current_price * investment.quantity
            response_data['current_value'] = investment.current_value # Atualiza no dict também

        projection_data = get_stock_growth_projection(investment.ticker, investment.current_value)
    
    # Se não tiver ticker mas tiver rentabilidade esperada, calcula a projeção manual
    elif investment.expected_monthly_yield:
        monthly_rate = investment.expected_monthly_yield / 100
        projected_value = investment.current_value
        
        for i in range(1, 25): # Projeção de 24 meses
            projected_value *= (1 + monthly_rate)
            month_date = datetime.now() + timedelta(days=i * 30)
            month_label = month_date.strftime("%b/%y")
            
            projection_data.append({
                'mes': month_label,
                'valor': round(projected_value, 2)
            })

    # Adiciona a projeção (seja ela qual for) à resposta
    response_data['projection_data'] = projection_data

    return jsonify(response_data)


@investments_bp.route('/investments/<int:investment_id>/transactions', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_investment_transactions(investment_id):
    user_id = get_jwt_identity()

    # Verifica se o investimento principal pertence ao usuário
    investment = Investment.query.filter_by(id=investment_id, user_id=user_id).first()
    if not investment:
        return jsonify({'error': 'Investimento não encontrado'}), 404

    # Busca todas as transações associadas usando o relacionamento
    # e ordena da mais recente para a mais antiga
    transactions = InvestmentTransaction.query.filter_by(investment_id=investment_id).order_by(InvestmentTransaction.date.desc()).all()
    
    return jsonify([transaction.to_dict() for transaction in transactions]), 200

# ▼▼▼ SUBSTITUA TODA A FUNÇÃO sell_investment POR ESTA ▼▼▼

@investments_bp.route('/investments/<int:investment_id>/sell', methods=['POST'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def sell_investment(investment_id):
    """
    Processa o resgate/venda de um investimento.
    - Para Ações/FIIs: deduz a quantidade de cotas com base no preço atual.
    - Para Renda Fixa e outros: deduz o valor diretamente.
    """
    user_id = get_jwt_identity()
    data = request.json
    sell_value = data.get('value')
    observations = data.get('observations')

    # 1. Validação dos dados de entrada
    if not sell_value or float(sell_value) <= 0:
        return jsonify({'error': 'O valor do resgate deve ser um número positivo.'}), 400
    
    sell_value = float(sell_value)

    # 2. Busca o investimento no banco de dados
    investment = Investment.query.filter_by(id=investment_id, user_id=user_id).first()
    if not investment:
        return jsonify({'error': 'Investimento não encontrado.'}), 404

    # 3. Lógica principal: diferencia Ações/FIIs de outros tipos
    if investment.type in ['Ações', 'Fundo Imobiliário']:
        # 4. Lógica para Ações e FIIs (baseada em quantidade)
        current_price = get_stock_price(investment.ticker)
        if not current_price or current_price == 0:
            return jsonify({'error': f'Não foi possível obter o preço atual de {investment.ticker} para calcular o resgate.'}), 400

        if sell_value > (current_price * investment.quantity):
             return jsonify({'error': 'O valor do resgate não pode ser maior que o valor atual do investimento.'}), 400

        shares_to_redeem = sell_value / current_price
        
        # Calcula o capital investido proporcional ao resgate para manter o preço médio correto
        if investment.quantity > 0:
            proportional_initial_value = (shares_to_redeem / investment.quantity) * investment.initial_value
        else:
            proportional_initial_value = 0 # Evita divisão por zero se não houver cotas

        investment.quantity -= shares_to_redeem
        investment.initial_value -= proportional_initial_value
        # O current_value não é alterado diretamente, ele será recalculado na próxima consulta

    else:
        # 5. Lógica para Renda Fixa e outros (baseada em valor)
        if sell_value > investment.current_value:
            return jsonify({'error': 'O valor do resgate não pode ser maior que o valor atual do investimento.'}), 400
        
        # Reduz o valor atual e o inicial proporcionalmente
        if investment.current_value > 0:
            reduction_ratio = sell_value / investment.current_value
            investment.initial_value -= investment.initial_value * reduction_ratio
            investment.current_value -= sell_value
        else: # Caso onde o valor atual é zero, deduz apenas do valor inicial
            investment.initial_value -= sell_value


    # 6. Cria o registro da movimentação e salva tudo no banco
    sell_transaction = InvestmentTransaction(
        investment_id=investment.id,
        user_id=user_id,
        transaction_type='resgate',
        date=datetime.utcnow().date(),
        value=sell_value,
        notes=observations
    )

    db.session.add(sell_transaction)
    db.session.commit()

    return jsonify({'message': 'Resgate realizado com sucesso!', 'investment': investment.to_dict()}), 200

# Rota para criar um novo investimento (versão com cálculo de quantidade)
@investments_bp.route('/investments', methods=['POST'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def create_investment():
    user_id = get_jwt_identity()
    data = request.json

    # --- 1. Captura e Validação dos Dados ---
    name = data.get('name')
    investment_type = data.get('type')
    ticker = data.get('ticker')
    initial_value_str = data.get('initial_value')
    purchase_date_str = data.get('purchase_date')
    
    if not all([name, investment_type, initial_value_str, purchase_date_str]):
        return jsonify({'error': 'Nome, Tipo, Valor Investido e Data da Compra são obrigatórios'}), 400
    
    if investment_type in ['Ações', 'FII'] and not ticker:
        return jsonify({'error': 'O Ticker é obrigatório para Ações e FIIs'}), 400

    try:
        initial_value = float(initial_value_str)
        purchase_date = datetime.strptime(purchase_date_str, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return jsonify({'error': 'Formato de valor ou data inválido'}), 400
        
    # --- 2. Lógica de Cálculo ---
    quantity = 1.0 # Valor padrão para outros tipos de investimento
    current_value = initial_value # Valor padrão
    expected_monthly_yield = data.get('expected_monthly_yield')
    
    # Se for Ação ou FII, faz a mágica acontecer!
    if ticker and investment_type in ['Ações', 'FII']:
        # a. Busca o preço na data da compra para saber o preço da cota
        price_on_purchase_date = get_historical_stock_price(ticker, purchase_date)
        if not price_on_purchase_date or price_on_purchase_date == 0:
            return jsonify({'error': f'Não foi possível encontrar o preço de "{ticker}" na data informada. Verifique se o mercado estava aberto.'}), 400

        # b. Calcula a quantidade de cotas
        quantity = initial_value / price_on_purchase_date
        
        # c. Busca o preço atual para definir o valor atual da carteira
        current_price = get_stock_price(ticker)
        if not current_price:
            return jsonify({'error': f'Ticker "{ticker}" é válido, mas não foi possível obter o preço atual.'}), 400
            
        current_value = current_price * quantity
        expected_monthly_yield = None # Anula a rentabilidade esperada

    # --- 3. Criação do Objeto e Persistência ---
    investment = Investment(
        user_id=user_id, name=name, type=investment_type, ticker=ticker,
        initial_value=initial_value, current_value=current_value,
        quantity=quantity, purchase_date=purchase_date,
        expected_monthly_yield=expected_monthly_yield
    )

    db.session.add(investment)
    db.session.commit()

    return jsonify(investment.to_dict()), 201

# Rota para atualizar um investimento (versão corrigida e flexível)
@investments_bp.route('/investments/<int:investment_id>', methods=['PUT'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def update_investment(investment_id):
    user_id = get_jwt_identity()
    investment = Investment.query.filter_by(id=investment_id, user_id=user_id).first()

    if not investment:
        return jsonify({'error': 'Investimento não encontrado'}), 404

    data = request.json

    # Atualiza cada campo apenas se ele for enviado na requisição
    if 'name' in data:
        investment.name = data['name']
    if 'type' in data:
        investment.type = data['type']
    if 'initial_value' in data:
        investment.initial_value = float(data['initial_value'])
    if 'current_value' in data:
        investment.current_value = float(data['current_value'])
    if 'quantity' in data:
        investment.quantity = float(data['quantity'])
    if 'purchase_date' in data:
        investment.purchase_date = datetime.strptime(data['purchase_date'], '%Y-%m-%d').date()
    if 'expected_monthly_yield' in data:
        investment.expected_monthly_yield = float(data['expected_monthly_yield']) if data['expected_monthly_yield'] is not None else None
    if 'is_active' in data:
        investment.is_active = bool(data['is_active'])

    db.session.commit()
    return jsonify(investment.to_dict()), 200

# Rota para deletar um investimento (já estava ok)
@investments_bp.route('/investments/<int:investment_id>', methods=['DELETE'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def delete_investment(investment_id):
    user_id = get_jwt_identity()
    investment = Investment.query.filter_by(id=investment_id, user_id=user_id).first()

    if not investment:
        return jsonify({'error': 'Investimento não encontrado'}), 404

    db.session.delete(investment)
    db.session.commit()

    return '', 204

# ▼▼▼ ADICIONE A NOVA ROTA DE ANÁLISE AQUI ▼▼▼

@investments_bp.route('/investments/analysis', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_investment_analysis():
    """
    Endpoint para fornecer dados agregados para a aba de Análise.
    """
    user_id = get_jwt_identity()

    # 1. Busca todos os investimentos ativos do usuário
    base_query = Investment.query.filter_by(user_id=user_id, is_active=True)

    # 2. Calcula o total de ativos e o total de ativos com lucro
    summary = base_query.with_entities(
        # Conta todos os ativos
        func.count(Investment.id).label('total_assets'),
        # Conta apenas os ativos onde o valor atual é maior que o inicial
        func.count(
            case(
                (Investment.current_value > Investment.initial_value, Investment.id),
                else_=None
            )
        ).label('positive_assets')
    ).first()

    # 3. Calcula a distribuição de valor por tipo de investimento
    distribution = base_query.with_entities(
        Investment.type,
        # Soma o valor atual de todos os investimentos, agrupados por tipo
        func.sum(Investment.current_value).label('current_value')
    ).group_by(Investment.type).all()

    # 4. Monta a resposta final no formato que o frontend espera
    response_data = {
        'total_assets': summary.total_assets if summary else 0,
        'positive_assets': summary.positive_assets if summary else 0,
        'distribution': [
            {'type': d.type, 'current_value': float(d.current_value)}
            for d in distribution
        ]
    }

    return jsonify(response_data), 200

# ▲▲▲ FIM DA NOVA ROTA ▲▲▲

# ▼▼▼ SUBSTITUA TODA A FUNÇÃO ANTERIOR POR ESTA ▼▼▼
@investments_bp.route('/investments/portfolio-evolution', methods=['GET', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_portfolio_evolution():
    # --- Interceptador para a requisição preflight de CORS ---
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    # --- Lógica principal para a requisição GET ---
    user_id = get_jwt_identity()
    
    try:
        year = int(request.args.get('year', datetime.now().year))
    except ValueError:
        return jsonify({"error": "Ano inválido"}), 400

    # 1. Pega todos os investimentos do usuário
    investments = Investment.query.filter_by(user_id=user_id).all()
    
    # 2. Prepara a estrutura de dados para os 12 meses do ano (LINHA CORRIGIDA)
    meses_pt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    year_suffix = str(year)[-2:]
    monthly_values = [{'mes': f"{meses_pt[i]}/{year_suffix}", 'valor': 0.0} for i in range(12)]

    # 3. Itera sobre cada investimento para calcular seu valor em cada mês
    for inv in investments:
        purchase_date = inv.purchase_date
        
        if purchase_date.year > year:
            continue

        for month_index in range(12):
            current_month = month_index + 1
            
            if current_month == 12:
                last_day_of_month = datetime(year, 12, 31).date()
            else:
                last_day_of_month = datetime(year, current_month + 1, 1).date() - timedelta(days=1)

            if purchase_date > last_day_of_month:
                continue

            value_for_month = 0
            if inv.ticker:
                price = get_historical_stock_price(inv.ticker, last_day_of_month)
                if price:
                    value_for_month = price * inv.quantity
                else:
                    # Se não encontrar preço, tenta usar o valor do mês anterior do mesmo ativo
                    # (Lógica simplificada para evitar buracos no gráfico)
                    if month_index > 0:
                        prev_month_last_day = last_day_of_month - timedelta(days=28)
                        prev_price = get_historical_stock_price(inv.ticker, prev_month_last_day)
                        if prev_price:
                            value_for_month = prev_price * inv.quantity

            elif inv.expected_monthly_yield:
                monthly_rate = inv.expected_monthly_yield / 100
                months_passed = (last_day_of_month.year - purchase_date.year) * 12 + last_day_of_month.month - purchase_date.month
                value_for_month = inv.initial_value * ((1 + monthly_rate) ** max(0, months_passed))
            
            monthly_values[month_index]['valor'] += value_for_month
    
    # 4. Arredonda os valores finais
    for month_data in monthly_values:
        month_data['valor'] = round(month_data['valor'], 2)

    return jsonify(monthly_values)


# Adicione este novo código ao final de investments.py

# Helper para buscar dados de múltiplos tickers de forma mais eficiente
def fetch_multiple_tickers_info(tickers):
    try:
        data = yf.Tickers(tickers)
        return {ticker: ticker_obj.info for ticker, ticker_obj in data.tickers.items()}
    except Exception as e:
        print(f"Erro ao buscar múltiplos tickers: {e}")
        return {}

# ▼▼▼ SUBSTITUA TODA A FUNÇÃO get_market_data POR ESTA ▼▼▼

@investments_bp.route('/investments/market-data', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_market_data():
    """
    Endpoint para buscar todos os dados necessários para a tela Home Broker.
    Versão corrigida para tratar criptoativos de forma robusta.
    """
    try:
        # --- 1. Dados do Ibovespa ---
        ibov_ticker = yf.Ticker('^BVSP')
        ibov_info = ibov_ticker.info
        ibov_hist = ibov_ticker.history(period='1d', interval='15m')
        
        ibovespa_data = {
            'current_price': ibov_info.get('regularMarketPrice', 0),
            'change_percent': (ibov_info.get('regularMarketPrice', 0) / ibov_info.get('previousClose', 1) - 1) * 100,
            'previous_close': ibov_info.get('previousClose', 0),
            'open_price': ibov_info.get('open', 0),
            'chart_data': [
                {'time': index.strftime('%H:%M'), 'price': row['Close']}
                for index, row in ibov_hist.iterrows()
            ]
        }

        # --- 2. Maiores Altas e Baixas ---
        ibov_components = [
            'PETR4.SA', 'VALE3.SA', 'ITUB4.SA', 'BBDC4.SA', 'B3SA3.SA', 'ELET3.SA', 'ABEV3.SA',
            'WEGE3.SA', 'RAIZ4.SA', 'CVCB3.SA', 'IRBR3.SA', 'MGLU3.SA', 'BRFS3.SA', 'VAMO3.SA',
            'STBP3.SA', 'PETZ3.SA'
        ]
        stocks_info = fetch_multiple_tickers_info(' '.join(ibov_components))
        
        stock_performance = []
        for ticker, info in stocks_info.items():
            current = info.get('regularMarketPrice')
            previous = info.get('previousClose')
            if current and previous:
                change = (current / previous - 1) * 100
                stock_performance.append({
                    'ticker': ticker.replace('.SA', ''), 'price': current, 'change_percent': change
                })

        stock_performance.sort(key=lambda x: x['change_percent'], reverse=True)
        top_gainers = stock_performance[:5]
        top_losers = sorted(stock_performance, key=lambda x: x['change_percent'])[:5]

        # --- 3. Moedas ---
        currency_tickers = 'BRL=X EURBRL=X'
        currency_info = fetch_multiple_tickers_info(currency_tickers)
        dolar_info = currency_info.get('BRL=X', {})
        euro_info = currency_info.get('EURBRL=X', {})
        
        currencies_data = [
            {'name': 'Dólar Comercial', 'buy': dolar_info.get('regularMarketPrice'), 'sell': dolar_info.get('regularMarketPrice')},
            {'name': 'Euro', 'buy': euro_info.get('regularMarketPrice'), 'sell': euro_info.get('regularMarketPrice')},
        ]
        
        # --- 4. Mercado Americano ---
        us_tickers = '^GSPC ^IXIC ^DJI' # S&P 500, NASDAQ, Dow Jones
        us_info = fetch_multiple_tickers_info(us_tickers)
        us_market_data = []

        # Mapeia os tickers para os nomes que queremos exibir
        us_names = {
            '^GSPC': 'S&P 500',
            '^IXIC': 'Nasdaq',
            '^DJI': 'Dow Jones'
        }

        for ticker_str, name in us_names.items():
            info = us_info.get(ticker_str, {})
            price = info.get('regularMarketPrice')
            prev_close = info.get('previousClose')
        
            change = 0
            if price and prev_close:
                change = (price / prev_close - 1) * 100

            us_market_data.append({
                'name': name,
                'price': price,
                'change_percent': change
             })

        # --- 5. Montagem da Resposta Final ---
        return jsonify({
            'ibovespa': ibovespa_data,
            'top_gainers': top_gainers,
            'top_losers': top_losers,
            'currencies': currencies_data,
            'us_market': us_market_data # Trocamos 'crypto' por 'us_market'
        })

    except Exception as e:
        print(f"Erro detalhado em get_market_data: {e}")
        return jsonify({'error': 'Não foi possível buscar os dados de mercado.'}), 500

# ADICIONE ESTA NOVA ROTA NO FINAL DE investments.py

@investments_bp.route('/investments/ticker-details/<string:ticker_symbol>', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_ticker_details(ticker_symbol):
    """
    Busca os detalhes e o histórico de um ticker específico para o gráfico principal.
    """
    try:
        # Adiciona .SA para tickers brasileiros (lógica simples)
        if not '.' in ticker_symbol:
             ticker_symbol = f"{ticker_symbol.upper()}.SA"
        
        ticker = yf.Ticker(ticker_symbol)
        info = ticker.info
        hist = ticker.history(period='1d', interval='15m')

        if hist.empty or not info.get('regularMarketPrice'):
             return jsonify({'error': 'Não foi possível encontrar dados para o ativo solicitado.'}), 404

        # Monta a resposta no MESMO formato do objeto 'ibovespa'
        ticker_data = {
            'name': info.get('shortName', ticker_symbol), # Adiciona o nome do ativo
            'current_price': info.get('regularMarketPrice', 0),
            'change_percent': (info.get('regularMarketPrice', 0) / info.get('previousClose', 1) - 1) * 100,
            'previous_close': info.get('previousClose', 0),
            'open_price': info.get('open', 0),
            'chart_data': [
                {'time': index.strftime('%H:%M'), 'price': row['Close']}
                for index, row in hist.iterrows()
            ]
        }
        return jsonify(ticker_data)
    except Exception as e:
        print(f"Erro ao buscar detalhes do ticker {ticker_symbol}: {e}")
        return jsonify({'error': 'Erro interno ao buscar dados do ativo.'}), 500

#calculadora de investimentos

@investments_bp.route('/investments/calculate-projection', methods=['POST'])
@jwt_required()
@active_user_required
def calculate_investment_projection():
    """
    Calcula a projeção de juros compostos com base nos dados fornecidos pelo usuário.
    Esta rota não interage com o banco de dados, apenas realiza o cálculo.
    """
    data = request.json
    
    try:
        initial_amount = float(data.get('initialAmount', 0))
        monthly_contribution = float(data.get('monthlyContribution', 0))
        # A rentabilidade vem como anual (ex: 8 para 8%), então dividimos por 100
        annual_rate = float(data.get('annualRate', 0)) / 100
        period_years = int(data.get('periodYears', 0))
    except (ValueError, TypeError):
        return jsonify({'error': 'Valores de entrada inválidos.'}), 400

    if period_years <= 0:
        return jsonify({'error': 'O período deve ser de pelo menos 1 ano.'}), 400

    # Converte a taxa anual para mensal para o cálculo
    monthly_rate = (1 + annual_rate) ** (1/12) - 1
    total_months = period_years * 12
    
    projection_data = []
    current_value = initial_amount

    # Simula o crescimento mês a mês
    for month in range(1, total_months + 1):
        current_value += monthly_contribution
        current_value *= (1 + monthly_rate)
        
        # Adiciona um ponto de dados a cada 12 meses (1 ano) para o gráfico
        if month % 12 == 0:
            year = month // 12
            projection_data.append({
                'year': year,
                'value': round(current_value, 2)
            })

    # Calcula os totais para os cards de resumo
    total_invested = initial_amount + (monthly_contribution * total_months)
    total_gains = current_value - total_invested
    
    summary = {
        'final_amount': round(current_value, 2),
        'total_invested': round(total_invested, 2),
        'total_gains': round(total_gains, 2),
        'period_years': period_years
    }

    return jsonify({
        'summary': summary,
        'projection': projection_data
    })