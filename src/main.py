import os
import sys
import click
from dotenv import load_dotenv
from src.routes.marketing_routes import marketing_bp # <--- Adicione isto
from src.routes.pluggy_routes import pluggy_bp
load_dotenv()
import cloudinary
import cloudinary.uploader
cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure = True
)
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


from flask import Flask, send_from_directory, jsonify, request, Response
from flask_cors import CORS
from src.models.gamification import Achievement, UserAchievement
from flask_migrate import Migrate
from src.routes.user_routes import user_api_bp
from src.routes.contacts import contacts_bp
from src.services.achievement_service import check_all_achievements_for_user
from datetime import datetime, timedelta
from src.routes.visual_report_routes import visual_report_bp
from sqlalchemy import func
from src.routes.auth import auth_bp
from src.config import AUDIO_DIR
from src.redis_client import redis_client
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from src.models.db import db  # instância única
from src.models.user import User
from src.models.financial import Category, Planning, Transaction
from src.models.extended import Goal, ScheduleEvent, Investment
from src.models.extended_modules import CreditCard, CreditCardTransaction
from src.routes.user import user_bp
from src.routes.gamification_routes import gamification_bp
from src.routes.financial import financial_bp, transactions_bp
from src.routes.goals import goals_bp
from src.extensions import mail, db, bcrypt
from src.routes.webhooks import webhooks_bp
from src.routes.credit_cards import credit_cards_bp
from src.routes.schedule import schedule_bp
from src.routes.investments import investments_bp
from src.routes.extended_simple import extended_bp
from src.routes.reports import reports_bp # <-- ADICIONE ESTA LINHA para reports
from src.routes.routes_whatsapp import whatsapp_bp
from src.routes.bank_accounts import bank_accounts_bp # <--- IMPORT NOVO
from src.routes.analysis import analysis_bp # <-- ADICIONE ESTA LINHA
from src.routes.business_routes import business_bp # <--- 1. Rota Empresarial
from src.models.business import Stakeholder, Company  # <--- 2. Modelo Empresarial
from src.routes.chat_bp import chat_bp
from src.routes.payment_routes import payment_bp
from apscheduler.schedulers.background import BackgroundScheduler
from src.scheduler import check_and_send_reminders, enviar_resumos_semanais, verificar_lancamentos_pendentes, recover_lost_leads

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# --- CONFIGURAÇÃO DE SEGURANÇA CORS (CORRIGIDA) ---
# 1. Lista de domínios permitidos (Whitelist)
ALLOWED_ORIGINS = [
    "https://simplificpro.com",
    "https://www.simplificpro.com",
    "https://simplific-pro-git-main-felipe-vianas-projects.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173", # Adicionado vite local comum
    "https://diagnostico.simplificpro.com.br",
    "https://www.diagnostico.simplificpro.com.br"
]

# 2. Inicializa o CORS permitindo credenciais para os domínios da lista
CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)

# 3. Handler Manual para garantir headers (Blindagem)
@app.after_request
def finalize_cors_headers(response):
    origin = request.headers.get('Origin')
    
    # Se a origem estiver na nossa lista, carimbamos a resposta
    if origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, X-Idempotency-Key'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
    
    return response

# ▼▼▼▼▼▼ ADICIONE ESTE BLOCO DE DEBUG AQUI ▼▼▼▼▼▼
@app.before_request
def debug_request_info():
    # Isso vai mostrar no log do Render quem está chamando e qual método (OPTIONS, POST, etc)
    print(f"\n>>> [DEBUG REQUEST] Recebendo: {request.method} {request.path}")
    print(f"    Origin recebida: {request.headers.get('Origin')}")
    print(f"    Headers essenciais: {request.headers.get('Access-Control-Request-Method')}")

@app.after_request
def debug_response_info(response):
    # Isso vai mostrar o que seu servidor respondeu e quais headers de permissão enviou
    print(f"<<< [DEBUG RESPONSE] Status: {response.status}")
    print(f"    CORS Origin enviado: {response.headers.get('Access-Control-Allow-Origin')}")
    print(f"    CORS Headers enviado: {response.headers.get('Access-Control-Allow-Headers')}")
    return response
# ▲▲▲▲▲▲ FIM DO BLOCO DE DEBUG ▲▲▲▲▲▲

# --- CONFIGURAÇÃO DE CHAVES (Permite Logout Geral via Render) ---
# O sistema vai tentar ler 'JWT_SECRET_KEY' das variáveis de ambiente (Render).
# Se não encontrar (ambiente local), usa as chaves padrão antigas.
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'simplific_pro_secret_key_2025')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret')

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

# ▼▼▼ ADICIONE ESTAS LINHAS AQUI ▼▼▼
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "pool_pre_ping": True,  # Testa a conexão antes de usar (Resolve o erro SSL)
    "pool_recycle": 300,    # Recicla conexões a cada 5 minutos
}
# ▲▲▲ FIM DO BLOCO ▲▲▲


db.init_app(app)
mail.init_app(app)
bcrypt.init_app(app)

migrate = Migrate(app, db)

# Initialize JWT
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(user_api_bp, url_prefix='/api/users')
print("--- DEBUG: O blueprint 'user_api_bp' foi registrado no prefixo /api/users. ---") # Linha de debug atualizada
app.register_blueprint(financial_bp, url_prefix='/api')
app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
app.register_blueprint(goals_bp, url_prefix='/api')
app.register_blueprint(credit_cards_bp, url_prefix='/api')
app.register_blueprint(schedule_bp, url_prefix='/api')
app.register_blueprint(investments_bp, url_prefix='/api')
app.register_blueprint(visual_report_bp, url_prefix='/api/reports')
app.register_blueprint(extended_bp, url_prefix='/api')
app.register_blueprint(reports_bp, url_prefix='/api') 
app.register_blueprint(whatsapp_bp)
app.register_blueprint(webhooks_bp, url_prefix='/webhooks')
app.register_blueprint(bank_accounts_bp, url_prefix='/api') # <--- REGISTRO NOVO
app.register_blueprint(payment_bp, url_prefix='/api/payment')
app.register_blueprint(gamification_bp, url_prefix='/api/gamification')
app.register_blueprint(analysis_bp, url_prefix='/api') 
app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(marketing_bp, url_prefix='/api/marketing') # <--- Adicione isto
app.register_blueprint(contacts_bp, url_prefix='/api/contacts')
app.register_blueprint(pluggy_bp, url_prefix='/api/pluggy')

# Registro dos blueprints Empresariais
app.register_blueprint(business_bp, url_prefix='/api')

# Adicione esta linha logo acima da sua função

@app.cli.command("create-admin")
def create_admin_user():
    """Create default admin user if it doesn't exist"""
    admin_email = 'felipegyyn@gmail.com'
    admin_password = '@302980Fv'

    admin = User.query.filter_by(email=admin_email).first()
    if not admin:
        # --- ESTA É A PARTE CORRIGIDA ---
        # Criamos o admin com todos os campos necessários, usando 'profile'
        hashed_password = bcrypt.generate_password_hash(admin_password).decode('utf-8')
        admin = User(
            name='Admin',
            email=admin_email,
            whatsapp='00000000000',
            password_hash=hashed_password,
            profile='admin',
            status='active',
            first_login=False
        )
        # ---------------------------------
        
        db.session.add(admin)
        db.session.commit()
        print(f"Admin user created: {admin_email}")
    else:
        print(f"Admin user {admin_email} already exists.")

# Função para criar categorias padrão
@app.cli.command("create-categories")
def create_default_categories():
    """Create default categories for admin user"""
    try:
        admin = User.query.filter_by(email='felipegyyn@gmail.com').first()
        if admin:
            default_categories = [
                ('Salário', 'entrada'),
                ('Freelance', 'entrada'),
                ('Investimentos', 'entrada'),
                ('Outros', 'entrada'),
                ('Cartão de Crédito', 'saida'),
                ('Financiamentos', 'saida'),
                ('Mercado', 'saida'),
                ('Conta de consumo', 'saida'),
                ('Transporte', 'saida'),
                ('Alimentação', 'saida'),
                ('Lazer', 'saida'),
                ('Saúde', 'saida'),
                ('Educação', 'saida'),
                ('Casa', 'saida'),
            ]

            for name, type in default_categories:
                existing = Category.query.filter_by(user_id=admin.id, name=name, type=type).first()
                if not existing:
                    category = Category(name=name, type=type, user_id=admin.id)
                    db.session.add(category)

            db.session.commit()
            print("Default categories created!")
    except Exception as e:
        print(f"Error creating categories: {e}")
        db.session.rollback()

# --- ADICIONE ISTO NO SEU MAIN.PY ---
# Solução Nuclear para CORS: Injeta headers manualmente em TODAS as respostas

#@app.after_request
#def add_cors_headers(response):
    #response.headers["Access-Control-Allow-Origin"] = "*"
    #response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, x-idempotency-key"
    #response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE"
    #return response

# Se uma requisição OPTIONS bater e não for tratada, o Flask retorna 404 ou 405.
# Isso garante que o navegador receba um 200 OK com os headers acima.
#@app.route('/api/payment/process_subscription', methods=['OPTIONS'])
#def options_handler():
    #return jsonify({'status': 'ok'}), 200
# ------------------------------------

# Rotas simples
@app.route('/')
def home():
    return {'message': 'Simplific Pro API is running!', 'status': 'success'}

@app.route('/api/test')
def test():
    return {'message': 'API Test successful!', 'status': 'ok'}

@app.route('/api/test_identity')
@jwt_required()
def test_identity():
    user_id = get_jwt_identity()
    return jsonify({'user_id': user_id})

@app.after_request
def after_request(response):
    # Garante que as requisições OPTIONS sempre retornem OK
    if request.method == 'OPTIONS':
        response.status_code = 200
    return response

# --- SUBSTITUA COMPLETAMENTE A ROTA ANTIGA 'serve_audio' POR ESTA ---
@app.route('/audio/<filename>')
def serve_audio(filename):
    """
    Esta rota busca os bytes de áudio do cache Redis e os serve diretamente.
    """
    if not redis_client:
        return "Serviço de cache indisponível", 500

    # Busca os dados do áudio no Redis usando o nome do arquivo como chave
    audio_bytes = redis_client.get(filename)

    if audio_bytes:
        # Se encontrou, retorna os bytes diretamente com o tipo de conteúdo correto
        return Response(audio_bytes, mimetype='audio/mpeg')
    else:
        # Se não encontrou (já expirou ou nunca existiu), retorna 404
        return "Áudio não encontrado ou expirado.", 404


# Em src/main.py

# ... (todo o seu código existente) ...


# ▼▼▼ ADICIONE ESTA ROTA DE DIAGNÓSTICO TEMPORÁRIA AQUI ▼▼▼
@app.route('/debug/routes')
def list_routes():
    """
    Lista todas as rotas disponíveis na aplicação. 
    Útil para depuração.
    """
    import urllib
    output = []
    for rule in app.url_map.iter_rules():
        options = {}
        for arg in rule.arguments:
            options[arg] = f"[{arg}]"
        
        methods = ','.join(rule.methods)
        url = urllib.parse.unquote(rule.rule)
        line = f"<b>{rule.endpoint}</b>: {methods} <code>{url}</code>"
        output.append(line)
        
    return "<br>".join(sorted(output))
# ▲▲▲ FIM DA ROTA DE DIAGNÓSTICO ▲▲▲

# Execução condicional para evitar conflito com migrações
#if os.getenv('FLASK_SKIP_SETUP') != '1':
with app.app_context():

    # --- ROBÔ DE REPARO DE BANCO DE DADOS ---
    # Isso garante que as colunas existam sem precisar rodar comandos manuais
    from sqlalchemy import text
    try:
        print("--- [DB FIX] Verificando colunas de assinatura... ---")
        # Tenta adicionar as colunas. Se já existirem, o banco ignora ou dá erro que tratamos.
        db.session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(100);"))
        db.session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_valid_until TIMESTAMP;"))
        db.session.commit()
        print("--- [DB FIX] Colunas garantidas com sucesso! ---")
    except Exception as e:
        db.session.rollback()
        print(f"--- [DB FIX] Aviso (provavelmente já existem): {e}")

    #create_admin_user()
    #create_default_categories()

# Configuração do Flask-Mail
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = False
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = ('Simplific Pro', os.getenv('MAIL_USERNAME')) # Nome que aparecerá para o cliente
    app.config['MAIL_DEBUG'] = True # Ativa o log detalhado de depuração

mail.init_app(app)

# COLE ESTE BLOCO NO FINAL DO SEU ARQUIVO main.py

@app.cli.command("check-subscriptions")
def check_subscriptions_command():
    """
    Verifica e inativa assinaturas que expiraram após o período de tolerância.
    Este comando é para ser executado via Cron Job (agendador).
    """
    print("--- [CRON] Iniciando verificação de assinaturas expiradas... ---")

    # Define a regra de negócio: 5 dias de tolerância
    GRACE_PERIOD_DAYS = 5
    cutoff_date = datetime.utcnow().date() - timedelta(days=GRACE_PERIOD_DAYS)

    # Busca por usuários que:
    # 1. Estão com status 'ativo'.
    # 2. Têm uma data de expiração definida.
    # 3. Essa data de expiração já passou do nosso limite de tolerância.
    # Busca por usuários que devem ser inativados
    users_to_deactivate = User.query.filter(
        func.lower(User.status) == 'ativo',
        User.subscription_valid_until != None,
        User.subscription_valid_until <= cutoff_date,
        User.email != 'felipegyyn@gmail.com'  # <--- LINHA DA IMUNIDADE
    ).all()
    
    if not users_to_deactivate:
        print("--- [CRON] Nenhum usuário para inativar hoje. ---")
        return

    print(f"--- [CRON] Encontrados {len(users_to_deactivate)} usuários para inativar... ---")

    count = 0
    for user in users_to_deactivate:
        user.status = 'inactive'
        print(f"  - Inativando usuário: {user.email} (ID: {user.id})")
        count += 1

    try:
        db.session.commit()
        print(f"--- [CRON] Sucesso! {count} usuários foram inativados. ---")
    except Exception as e:
        db.session.rollback()
        print(f"--- [CRON] ERRO: Falha ao salvar as alterações. {e} ---")

    print("--- [CRON] Verificação concluída. ---")

# ▼▼▼ COLE O NOVO COMANDO NO FINAL DO main.py ▼▼▼

@app.cli.command("send-weekly-reports")
def send_weekly_reports_command():
    """
    Busca todos os usuários elegíveis e envia o resumo financeiro da última semana.
    Este comando é para ser executado via Cron Job.
    """
    # Precisamos do contexto da aplicação para acessar o banco de dados
    with app.app_context():
        # A função 'enviar_resumos_semanais' já está no scheduler.py,
        # nós apenas a chamamos a partir daqui.
        enviar_resumos_semanais(app)

# ▼▼▼ COLE O NOVO COMANDO NO FINAL DO main.py ▼▼▼

@app.cli.command("seed-achievements")
def seed_achievements_command():
    """
    Cadastra as conquistas padrão do sistema no banco de dados.
    """
    print("--- Iniciando o cadastro de conquistas padrão... ---")

    # A lista mestre de todas as conquistas do sistema
    achievements_list = [
        {'key': 'FIRST_LOGIN', 'name': 'Primeiros Passos', 'description': 'Fez o primeiro login e iniciou a jornada.', 'icon': 'DoorOpen'},
        {'key': 'FIRST_TRANSACTION', 'name': 'Organizador(a) Iniciante', 'description': 'Cadastrou seu primeiro lançamento financeiro.', 'icon': 'PencilLine'},
        {'key': 'FIRST_PLAN', 'name': 'Planejador(a)', 'description': 'Criou seu primeiro item no planejamento.', 'icon': 'ClipboardList'},
        {'key': 'FIRST_GOAL', 'name': 'Visionário(a)', 'description': 'Definiu sua primeira meta financeira.', 'icon': 'Target'},
        {'key': 'FIRST_INVESTMENT', 'name': 'Investidor(a) Aspirante', 'description': 'Cadastrou seu primeiro investimento na carteira.', 'icon': 'TrendingUp'},
        {'key': 'BUDGET_MASTER_1', 'name': 'Mestre do Orçamento', 'description': 'Passou 1 mês completo sem estourar o orçamento de nenhuma categoria.', 'icon': 'Award'},
        {'key': 'SAVER_1', 'name': 'Poupador(a) Bronze', 'description': 'Manteve o saldo mensal positivo por 1 mês.', 'icon': 'PiggyBank'},
    
        # Nível Prata
        {'key': 'BUDGET_MASTER_3', 'name': 'Mestre do Orçamento Prata', 'description': 'Passou 3 meses consecutivos sem estourar o orçamento.', 'icon': 'ShieldCheck'},
        {'key': 'SAVER_3', 'name': 'Poupador(a) Prata', 'description': 'Manteve o saldo mensal positivo por 3 meses consecutivos.', 'icon': 'Gem'},
        {'key': 'FIRST_GOAL_COMPLETED', 'name': 'Meta Conquistada', 'description': 'Atingiu 100% do valor de uma meta pela primeira vez.', 'icon': 'Trophy'},
    
        # Nível Ouro
        {'key': 'BUDGET_MASTER_6', 'name': 'Mestre do Orçamento Ouro', 'description': 'Passou 6 meses consecutivos sem estourar o orçamento.', 'icon': 'Crown'},
        {'key': 'DIVERSIFIED_INVESTOR', 'name': 'Investidor(a) Diversificado(a)', 'description': 'Possui pelo menos 3 tipos diferentes de investimentos na carteira.', 'icon': 'Library'}
    ]

    with app.app_context():
        for ach_data in achievements_list:
            # Verifica se a conquista já existe para não duplicar
            exists = Achievement.query.filter_by(key=ach_data['key']).first()
            if not exists:
                new_achievement = Achievement(**ach_data)
                db.session.add(new_achievement)
                print(f"  - Conquista '{ach_data['name']}' cadastrada.")

        db.session.commit()

    print("--- Cadastro de conquistas concluído! ---")

# ▼▼▼ SUBSTITUA TODA A FUNÇÃO 'check_achievements_command' POR ESTA ▼▼▼

@app.cli.command("check-achievements")
def check_achievements_command():
    """
    Verifica e concede novas conquistas para todos os usuários ativos.
    Este comando é para ser executado via Cron Job.
    """
    print("--- [CRON] Iniciando verificação de conquistas para todos os usuários... ---")
    with app.app_context():
        
        # --- ETAPA DE DEBUG APROFUNDADO ---
        all_users = User.query.all()
        print(f"--- [DEBUG] Total de usuários encontrados no banco: {len(all_users)} ---")
        
        manually_filtered_users = []
        for u in all_users:
            # Imprime o status original para análise
            print(f"  - [DEBUG] Analisando Usuário ID: {u.id}, Status: {repr(u.status)}")
            # Forçamos a conversão para minúsculas e removemos espaços em branco
            # para ter certeza absoluta na comparação.
            if u.status and u.status.strip().lower() == 'ativo':
                manually_filtered_users.append(u)
                print(f"    --> [DEBUG] SUCESSO! Usuário ID {u.id} passou no filtro manual.")
        
        print(f"--- [DEBUG] Total de usuários após filtro MANUAL em Python: {len(manually_filtered_users)} ---")
        # --- FIM DA ETAPA DE DEBUG ---

        # Agora, usamos a lista que filtramos manualmente
        users_to_check = manually_filtered_users
        print(f"Encontrados {len(users_to_check)} usuários ativos para verificar.")
        
        if not users_to_check:
            print("--- [CRON] Nenhum usuário ativo encontrado para verificação. Concluindo. ---")
            return
            
        for user in users_to_check:
            print(f"  - Verificando conquistas para: {user.email}")
            check_all_achievements_for_user(user)
        
        db.session.commit()
    
    print("--- [CRON] Verificação de conquistas concluída. ---")

# ▼▼▼ COLE ISTO NO FINAL DO ARQUIVO MAIN.PY ▼▼▼

# Configuração do Agendador (Scheduler)
# Isso garante que o Robô rode em segundo plano sem travar o site
if os.environ.get('WERKZEUG_RUN_MAIN') != 'true': # Evita rodar duplicado em modo debug
    scheduler = BackgroundScheduler()
    
    # 1. Lembretes de Agenda (Ex: Boleto vencendo hoje) - Roda todo dia às 08:00
    scheduler.add_job(func=check_and_send_reminders, args=[app], trigger="cron", hour=8, minute=0)
    
    # 2. Resumos Semanais (Ex: Domingo) - Roda Domingo às 09:00
    scheduler.add_job(func=enviar_resumos_semanais, args=[app], trigger="cron", day_of_week='sun', hour=9, minute=0)
    
    # 3. Lançamentos Pendentes (Confirmação) - Roda todo dia às 20:00
    scheduler.add_job(func=verificar_lancamentos_pendentes, args=[app], trigger="cron", hour=20, minute=0)

    # 4. O ROBÔ CAÇADOR DE LEADS (Recuperação) - Roda todo dia às 09:30
    scheduler.add_job(func=recover_lost_leads, args=[app], trigger="cron", hour=9, minute=30)
    
    scheduler.start()
    print("--- [SISTEMA] Agendador de tarefas iniciado com sucesso! ---")

# ▼▼▼ COLE NO FINAL DO ARQUIVO src/main.py ▼▼▼

@app.cli.command("diagnostico-assinaturas")
def diagnostico_assinaturas():
    """
    Lista o status real das assinaturas diretamente do Mercado Pago.
    Útil para verificar renovações e datas de cobrança.
    """
    from src.models.user import User
    from src.services.payment_service import get_subscription_details
    from datetime import datetime

    print(f"\n--- [DIAGNÓSTICO] Iniciando verificação em {datetime.now()} ---")
    
    # Busca usuários que têm algum ID de assinatura gravado
    users = User.query.filter(User.subscription_id != None).all()
    
    if not users:
        print("Nenhum usuário com assinatura encontrada no banco.")
        return

    print(f"Encontrados {len(users)} usuários com registro de assinatura.\n")
    print(f"{'E-MAIL':<35} | {'ID ASSINATURA':<25} | {'STATUS MP':<15} | {'PRÓX. PAGAMENTO'}")
    print("-" * 100)

    for user in users:
        sub_id = user.subscription_id
        
        # Pula planos anuais (pois não são recorrentes no MP da mesma forma)
        if sub_id.startswith('annual_'):
            print(f"{user.email:<35} | {sub_id:<25} | {'ANUAL (OK)':<15} | {user.subscription_valid_until}")
            continue
            
        if sub_id == 'pending_sub':
            print(f"{user.email:<35} | {'PENDENTE':<25} | {'ERRO':<15} | -")
            continue

        # Consulta o Mercado Pago
        try:
            mp_data = get_subscription_details(sub_id)
            
            if mp_data:
                status_mp = mp_data.get('status', 'N/A')
                # Tenta pegar a data de diversas formas que o MP pode retornar
                next_payment = mp_data.get('next_payment_date')
                if not next_payment:
                    # Se não tiver next_payment, tenta ver a data de início da recorrência
                    next_payment = mp_data.get('auto_recurring', {}).get('start_date', 'Sem data')
                
                # Limpa a formatação da data para ficar legível
                if isinstance(next_payment, str) and 'T' in next_payment:
                    next_payment = next_payment.split('T')[0]

                print(f"{user.email:<35} | {sub_id:<25} | {status_mp:<15} | {next_payment}")
            else:
                print(f"{user.email:<35} | {sub_id:<25} | {'NÃO ENCONTRADO':<15} | -")
                
        except Exception as e:
            print(f"{user.email:<35} | {sub_id:<25} | {'ERRO API':<15} | {str(e)}")

    print("-" * 100)
    print("LEGENDA STATUS MP:")
    print(" - authorized: Tudo certo! A cobrança está agendada.")
    print(" - paused: Assinatura pausada (não cobrará).")
    print(" - cancelled: Cancelada.")
    print(" - pending: Problema no cartão ou aguardando.")
    print("\n")


# ▼▼▼ COLE NO FINAL DO ARQUIVO src/main.py ▼▼▼

@app.cli.command("disparar-recuperacao-lista")
def disparar_recuperacao_lista():
    """
    Dispara e-mail de recuperação APENAS para a lista VIP de e-mails fornecida.
    Ignora status de assinatura e foca nos e-mails específicos.
    """
    from src.models.user import User
    from src.extensions import mail
    from flask_mail import Message

    # --- RECUPERAÇÃO LISTA DE ALVOS MUDAR E-MAIL SEMPRE QUE PRECISAR ---
    target_emails = [
        "cvn.camila@gmail.com",
        "contato.rennedyeidi@gmail.com",
        "jean.hd3@gmail.com",
        "felipegyyyn@gmail.com"
    ]
    # ----------------------

    print(f"--- Iniciando Disparo VIP para {len(target_emails)} usuários ---")

    for email in target_emails:
        # Busca o usuário pelo e-mail, independente de ter assinatura ou não
        user = User.query.filter_by(email=email).first()

        if not user:
            print(f"[ALERTA] Usuário {email} NÃO encontrado no banco de dados.")
            continue

        print(f"Enviando e-mail de renovação para: {user.name} ({user.email})...")

        try:
            msg = Message(
                subject="Ação Necessária: Renovação da sua assinatura Simplific Pro",
                recipients=[user.email]
            )

            # Link direto para o checkout
            link_pagamento = "https://www.simplificpro.com/#/checkout"

            msg.html = f"""
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Olá, {user.name.split()[0] if user.name else 'Parceiro'}!</h2>
                <p>Esperamos que você tenha aproveitado seu primeiro mês no Simplific Pro.</p>
                <p>Identificamos uma pendência na renovação automática da sua assinatura.</p>
                <p>Para garantir que você continue acessando seus painéis, metas e inteligência artificial sem interrupções, 
                por favor, clique no botão abaixo para renovar seu plano:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{link_pagamento}" 
                       style="background-color: #0891b2; color: white; padding: 15px 25px; 
                              text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                       RENOVAR ASSINATURA AGORA
                    </a>
                </div>
                
                <p>O valor da renovação mensal é de <strong>R$ 29,90</strong>.</p>
                <p>Se tiver qualquer dúvida, é só responder a este e-mail.</p>
                <br>
                <p>Atenciosamente,<br>Equipe Simplific Pro</p>
            </div>
            """
            
            mail.send(msg)
            print(f" -> [SUCESSO] E-mail enviado para {email}")
            
        except Exception as e:
            print(f" -> [ERRO] Falha ao enviar para {email}: {e}")

    print("--- FIM DO DISPARO ---")

# ▼▼▼ COLE NO FINAL DO ARQUIVO src/main.py ▼▼▼

@app.cli.command("enviar-recuperacao-pagamento")
@click.argument("email")
def enviar_recuperacao_pagamento(email):
    """
    Envia um e-mail para o usuário avisando que o pagamento falhou
    e fornecendo o link para tentar novamente.
    Uso: flask enviar-recuperacao-pagamento "email@exemplo.com"
    """
    from src.models.user import User
    from src.extensions import mail
    from flask_mail import Message
    
    print(f"\n--- 📧 Preparando envio para: {email} ---")
    user = User.query.filter_by(email=email).first()
    
    if not user:
        print("❌ Usuário não encontrado.")
        return

    # Link direto para a tela de planos/checkout
    # Ajuste se sua rota for diferente, mas geralmente é essa
    link_pagamento = "https://www.simplificpro.com/#/checkout"

    print(f"Usuário encontrado: {user.name}. Status atual: {user.status}")

    try:
        msg = Message(
            subject="Finalize sua assinatura no Simplific Pro",
            recipients=[user.email]
        )

        # Template do E-mail (HTML)
        msg.html = f"""
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Olá, {user.name.split()[0]}!</h2>
            
            <p>Notamos que você criou sua conta no <strong>Simplific Pro</strong>, mas por algum motivo,  processo de pagamento da assinatura não foi concluído(você pode checar no extrato do seu cartão).</p>
            
            <p>Não se preocupe: <strong>seu cadastro e configurações iniciais estão salvos!</strong></p>
            
            <p>Para liberar seu acesso completo ao Simplific Pro, basta finalizar a assinatura clicando no botão abaixo:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{link_pagamento}" 
                   style="background-color: #16a34a; color: white; padding: 15px 25px; 
                          text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                   FINALIZAR ASSINATURA AGORA
                </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
                Se você já realizou o pagamento e acredita que isso é um erro, por favor, responda a este e-mail.
            </p>
            
            <br>
            <p>Um abraço,<br>Equipe Simplific Pro</p>
        </div>
        """
        
        mail.send(msg)
        print(f"✅ E-mail de recuperação enviado com sucesso para {email}!")
        
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail: {e}")
