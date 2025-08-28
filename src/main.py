import os
import sys
from dotenv import load_dotenv
load_dotenv()
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify, request, Response
from flask_cors import CORS
from flask_migrate import Migrate
from src.config import AUDIO_DIR
from src.redis_client import redis_client
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from src.models.db import db  # instância única
from src.models.user import User
from src.models.financial import Category, Planning, Transaction
from src.models.extended import Goal, ScheduleEvent, Investment
from src.models.extended_modules import CreditCard, CreditCardTransaction
from src.routes.user import user_bp
from src.routes.financial import financial_bp
from src.routes.goals import goals_bp
from src.extensions import mail, db, bcrypt
from src.routes.webhooks import webhooks_bp
from src.routes.credit_cards import credit_cards_bp
from src.routes.schedule import schedule_bp
from src.routes.investments import investments_bp
from src.routes.extended_simple import extended_bp
from src.routes.reports import reports_bp # <-- ADICIONE ESTA LINHA para reports
from src.routes.routes_whatsapp import whatsapp_bp
from src.routes.analysis import analysis_bp # <-- ADICIONE ESTA LINHA
from apscheduler.schedulers.background import BackgroundScheduler
from src.scheduler import check_and_send_reminders, enviar_resumos_semanais

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

app.config['SECRET_KEY'] = 'simplific_pro_secret_key_2025'
app.config['JWT_SECRET_KEY'] = 'super-secret'

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

# Bloco Final e Simplificado
CORS(
    app,
    origins=[
        "https://simplificpro.com",
        "https://www.simplificpro.com",
        "https://simplific-pro-git-main-felipe-vianas-projects.vercel.app",
        "http://localhost:3000"
    ],
    supports_credentials=True
)


db.init_app(app)
mail.init_app(app)
bcrypt.init_app(app)

migrate = Migrate(app, db)

# Initialize JWT
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(financial_bp, url_prefix='/api')
app.register_blueprint(goals_bp, url_prefix='/api')
app.register_blueprint(credit_cards_bp, url_prefix='/api')
app.register_blueprint(schedule_bp, url_prefix='/api')
app.register_blueprint(investments_bp, url_prefix='/api')
app.register_blueprint(extended_bp, url_prefix='/api')
app.register_blueprint(reports_bp, url_prefix='/api') # <-- ADICIONE ESTA LINHA PARA REPOSRTS
app.register_blueprint(whatsapp_bp)
app.register_blueprint(webhooks_bp, url_prefix='/webhooks')
app.register_blueprint(analysis_bp, url_prefix='/api') # <-- ADICIONE ESTA LINHA

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


scheduler = BackgroundScheduler(daemon=True)
# Roda a verificação de lembretes todos os dias às 8:00 da manhã (horário do servidor)
scheduler.add_job(check_and_send_reminders, trigger='cron', hour=8, minute=0, args=[app])
scheduler.add_job(enviar_resumos_semanais, trigger='cron', day_of_week='mon', hour=9, minute=0, args=[app])
scheduler.start()
# Roda o envio de resumos toda Segunda-feira às 9:00 da manhã (horário do servidor)


# Execução condicional para evitar conflito com migrações
#if os.getenv('FLASK_SKIP_SETUP') != '1':
with app.app_context():
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









