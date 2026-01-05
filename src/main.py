import os
import sys
from dotenv import load_dotenv
from src.routes.marketing_routes import marketing_bp
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

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify, request, Response
from flask_cors import CORS, cross_origin # Importando cross_origin explicitamente
from src.models.gamification import Achievement, UserAchievement
from flask_migrate import Migrate
from src.routes.user_routes import user_api_bp
from src.services.achievement_service import check_all_achievements_for_user
from datetime import datetime, timedelta
from src.routes.visual_report_routes import visual_report_bp
from sqlalchemy import func
from src.routes.auth import auth_bp
from src.config import AUDIO_DIR
from src.redis_client import redis_client
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from src.models.db import db
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
from src.routes.reports import reports_bp
from src.routes.routes_whatsapp import whatsapp_bp
from src.routes.analysis import analysis_bp
from src.routes.chat_bp import chat_bp
from src.routes.payment_routes import payment_bp
from apscheduler.schedulers.background import BackgroundScheduler
from src.scheduler import check_and_send_reminders, enviar_resumos_semanais, verificar_lancamentos_pendentes, recover_lost_leads

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# --- CONFIGURAÇÃO CORS "HARD RESET"- ---
# 1. Ativamos CORS básico para lidar com OPTIONS automaticamente
CORS(app) 

app.config['SECRET_KEY'] = 'simplific_pro_secret_key_2025'
app.config['JWT_SECRET_KEY'] = 'super-secret'
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

db.init_app(app)
mail.init_app(app)
bcrypt.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(user_api_bp, url_prefix='/api/users')
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
app.register_blueprint(payment_bp, url_prefix='/api/payment')
app.register_blueprint(gamification_bp, url_prefix='/api/gamification')
app.register_blueprint(analysis_bp, url_prefix='/api') 
app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(marketing_bp, url_prefix='/api/marketing')
app.register_blueprint(pluggy_bp, url_prefix='/api/pluggy')

# --- FORÇA BRUTA NOS HEADERS (SOLUÇÃO MANUAL) ---
# Isso garante que, independentemente da biblioteca, o navegador receba o "SIM"
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    
    # Lista branca de domínios permitidos
    whitelist = [
        "https://simplificpro.com",
        "https://www.simplificpro.com",
        "https://simplific-pro-git-main-felipe-vianas-projects.vercel.app",
        "http://localhost:3000",
        "https://diagnostico.simplificpro.com.br",
        "https://www.diagnostico.simplificpro.com.br"
    ]
    
    if origin in whitelist:
        # Debug para vermos no log do Render se está funcionando
        # print(f"--- [CORS DEBUG] Permitindo acesso para origem: {origin} ---")
        
        # Injeta os headers manualmente
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
    
    return response

# Rota de Debug para testar conexão
@app.route('/api/debug/connection')
def debug_connection():
    return jsonify({
        "status": "ok", 
        "message": "Backend online e CORS manual ativo.",
        "origin_recebida": request.headers.get('Origin', 'Nenhuma')
    })

# Restante dos comandos CLI e rotas
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

@app.route('/audio/<filename>')
def serve_audio(filename):
    if not redis_client:
        return "Serviço de cache indisponível", 500
    audio_bytes = redis_client.get(filename)
    if audio_bytes:
        return Response(audio_bytes, mimetype='audio/mpeg')
    else:
        return "Áudio não encontrado ou expirado.", 404

# CLI Commands
@app.cli.command("create-admin")
def create_admin_user():
    admin_email = 'felipegyyn@gmail.com'
    admin_password = '@302980Fv'
    admin = User.query.filter_by(email=admin_email).first()
    if not admin:
        hashed_password = bcrypt.generate_password_hash(admin_password).decode('utf-8')
        admin = User(name='Admin', email=admin_email, whatsapp='00000000000', password_hash=hashed_password, profile='admin', status='active', first_login=False)
        db.session.add(admin)
        db.session.commit()
        print(f"Admin user created: {admin_email}")
    else:
        print(f"Admin user {admin_email} already exists.")

@app.cli.command("create-categories")
def create_default_categories():
    try:
        admin = User.query.filter_by(email='felipegyyn@gmail.com').first()
        if admin:
            default_categories = [('Salário', 'entrada'), ('Freelance', 'entrada'), ('Investimentos', 'entrada'), ('Outros', 'entrada'), ('Cartão de Crédito', 'saida'), ('Financiamentos', 'saida'), ('Mercado', 'saida'), ('Conta de consumo', 'saida'), ('Transporte', 'saida'), ('Alimentação', 'saida'), ('Lazer', 'saida'), ('Saúde', 'saida'), ('Educação', 'saida'), ('Casa', 'saida')]
            for name, type in default_categories:
                existing = Category.query.filter_by(user_id=admin.id, name=name, type=type).first()
                if not existing:
                    db.session.add(Category(name=name, type=type, user_id=admin.id))
            db.session.commit()
            print("Default categories created!")
    except Exception as e:
        print(f"Error creating categories: {e}")
        db.session.rollback()

@app.cli.command("check-subscriptions")
def check_subscriptions_command():
    GRACE_PERIOD_DAYS = 5
    cutoff_date = datetime.utcnow().date() - timedelta(days=GRACE_PERIOD_DAYS)
    users_to_deactivate = User.query.filter(func.lower(User.status) == 'ativo', User.subscription_valid_until != None, User.subscription_valid_until <= cutoff_date, User.email != 'felipegyyn@gmail.com').all()
    if not users_to_deactivate: return
    for user in users_to_deactivate: user.status = 'inactive'
    try: db.session.commit()
    except: db.session.rollback()

@app.cli.command("send-weekly-reports")
def send_weekly_reports_command():
    with app.app_context(): enviar_resumos_semanais(app)

@app.cli.command("seed-achievements")
def seed_achievements_command():
    achievements_list = [{'key': 'FIRST_LOGIN', 'name': 'Primeiros Passos', 'description': 'Fez o primeiro login e iniciou a jornada.', 'icon': 'DoorOpen'}, {'key': 'FIRST_TRANSACTION', 'name': 'Organizador(a) Iniciante', 'description': 'Cadastrou seu primeiro lançamento financeiro.', 'icon': 'PencilLine'}, {'key': 'FIRST_PLAN', 'name': 'Planejador(a)', 'description': 'Criou seu primeiro item no planejamento.', 'icon': 'ClipboardList'}, {'key': 'FIRST_GOAL', 'name': 'Visionário(a)', 'description': 'Definiu sua primeira meta financeira.', 'icon': 'Target'}, {'key': 'FIRST_INVESTMENT', 'name': 'Investidor(a) Aspirante', 'description': 'Cadastrou seu primeiro investimento na carteira.', 'icon': 'TrendingUp'}, {'key': 'BUDGET_MASTER_1', 'name': 'Mestre do Orçamento', 'description': 'Passou 1 mês completo sem estourar o orçamento de nenhuma categoria.', 'icon': 'Award'}, {'key': 'SAVER_1', 'name': 'Poupador(a) Bronze', 'description': 'Manteve o saldo mensal positivo por 1 mês.', 'icon': 'PiggyBank'}, {'key': 'BUDGET_MASTER_3', 'name': 'Mestre do Orçamento Prata', 'description': 'Passou 3 meses consecutivos sem estourar o orçamento.', 'icon': 'ShieldCheck'}, {'key': 'SAVER_3', 'name': 'Poupador(a) Prata', 'description': 'Manteve o saldo mensal positivo por 3 meses consecutivos.', 'icon': 'Gem'}, {'key': 'FIRST_GOAL_COMPLETED', 'name': 'Meta Conquistada', 'description': 'Atingiu 100% do valor de uma meta pela primeira vez.', 'icon': 'Trophy'}, {'key': 'BUDGET_MASTER_6', 'name': 'Mestre do Orçamento Ouro', 'description': 'Passou 6 meses consecutivos sem estourar o orçamento.', 'icon': 'Crown'}, {'key': 'DIVERSIFIED_INVESTOR', 'name': 'Investidor(a) Diversificado(a)', 'description': 'Possui pelo menos 3 tipos diferentes de investimentos na carteira.', 'icon': 'Library'}]
    with app.app_context():
        for ach_data in achievements_list:
            if not Achievement.query.filter_by(key=ach_data['key']).first(): db.session.add(Achievement(**ach_data))
        db.session.commit()

@app.cli.command("check-achievements")
def check_achievements_command():
    with app.app_context():
        all_users = User.query.all()
        manually_filtered_users = [u for u in all_users if u.status and u.status.strip().lower() == 'ativo']
        for user in manually_filtered_users: check_all_achievements_for_user(user)
        db.session.commit()

if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=check_and_send_reminders, args=[app], trigger="cron", hour=8, minute=0)
    scheduler.add_job(func=enviar_resumos_semanais, args=[app], trigger="cron", day_of_week='sun', hour=9, minute=0)
    scheduler.add_job(func=verificar_lancamentos_pendentes, args=[app], trigger="cron", hour=20, minute=0)
    scheduler.add_job(func=recover_lost_leads, args=[app], trigger="cron", hour=9, minute=30)
    scheduler.start()
