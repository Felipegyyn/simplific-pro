# src/routes/auth.py

from flask import Blueprint, request, jsonify, current_app
from src.models.user import User, PasswordResetToken
from src.models.db import db
from src.services.user_service import generate_password_reset_token
from src.services.notification_service import send_password_reset_email, send_verification_email, _send_welcome_whatsapp
from itsdangerous import URLSafeTimedSerializer
from datetime import datetime, timedelta
import re

auth_bp = Blueprint('auth', __name__)

def generate_verification_token(email):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt='email-confirm')

def confirm_verification_token(token, expiration=86400): # Válido por 24 horas
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt='email-confirm', max_age=expiration)
    except Exception:
        return False
    return email

# Rota de LOGIN movida para cá (se você quiser centralizar) ou nós apenas ajustaremos se ela estiver em outro lugar.
# Como o login atualmente está em outro arquivo (provavelmente app.py ou user_routes.py), vamos verificar. 
# Espere, o login geralmente é em auth.py ou user_routes.py. Vou colocar aqui, mas a chamada do front precisa estar correta.

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'O campo e-mail é obrigatório.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        print(f"AVISO: Solicitação de recuperação para e-mail não cadastrado: {email}")
        return jsonify({'message': 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.'}), 200

    try:
        token = generate_password_reset_token(user)
        send_password_reset_email(user.email, user.name, token)
        return jsonify({'message': 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.'}), 200
    except Exception as e:
        print(f"ERRO GERAL na rota /forgot-password: {e}")
        return jsonify({'message': 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.'}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    if not token or not new_password:
        return jsonify({'error': 'Token e nova senha são obrigatórios.'}), 400

    reset_token = PasswordResetToken.query.filter_by(token=token).first()
    if not reset_token or reset_token.is_expired():
        return jsonify({'error': 'Token inválido ou expirado.'}), 400

    user = reset_token.user
    if not user:
         return jsonify({'error': 'Usuário associado ao token não encontrado.'}), 404

    user.set_password(new_password)
    user.first_login = False
    db.session.delete(reset_token)
    db.session.commit()
    return jsonify({'message': 'Sua senha foi redefinida com sucesso!'}), 200

# --- ROTA DE CAPTURA DE LEADS (ADICIONAR NO FINAL) ---

@auth_bp.route('/register-lead', methods=['POST'])
def register_lead():
    """
    Recebe leads vindos do Diagnóstico ou Landing Pages externas.
    Cria o usuário com status 'lead' se ele não existir.
    """
    data = request.get_json()
    email = data.get('email')
    name = data.get('name')
    whatsapp = data.get('whatsapp')

    if not email:
        return jsonify({'error': 'Email é obrigatório'}), 400

    # 1. Verifica se o usuário já existe
    user = User.query.filter_by(email=email).first()

    if user:
        # Se já existe, atualizamos o WhatsApp se for novo e diferente
        if whatsapp and whatsapp != user.whatsapp:
            user.whatsapp = whatsapp
            db.session.commit()
        return jsonify({'message': 'Lead já existente. Dados atualizados.'}), 200

    # 2. Se não existe, cria um novo "Lead"
    try:
        import secrets # Importação local para gerar senha aleatória
        random_pass = secrets.token_urlsafe(12)
        
        # Criamos o objeto User
        new_lead = User(
            name=name or "Lead Visitante",
            email=email,
            whatsapp=whatsapp,
            password_hash="temp_hash", # Valor temporário para não quebrar a regra de 'not null'
            profile='lead',      # Perfil específico para quem ainda não comprou
            status='prospect',   # Status de prospecto
            first_login=True     # Força setup se ele logar um dia
        )
        
        # Gera o hash real da senha aleatória
        new_lead.set_password(random_pass) 

        db.session.add(new_lead)
        db.session.commit()

        print(f"✅ Novo Lead capturado: {email} vindo do Diagnóstico.")
        return jsonify({'message': 'Lead cadastrado com sucesso'}), 201

        return jsonify({'error': 'Erro interno ao salvar lead'}), 500

@auth_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    whatsapp = data.get('whatsapp')
    password = data.get('password')

    if not name or not email or not whatsapp or not password:
        return jsonify({'error': 'Todos os campos são obrigatórios.'}), 400

    # Limpar e formatar o whatsapp
    whatsapp_clean = re.sub(r'\D', '', whatsapp)
    if not whatsapp_clean.startswith('55'):
        whatsapp_clean = '55' + whatsapp_clean

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Este e-mail já está em uso.'}), 400

    if User.query.filter_by(whatsapp=whatsapp_clean).first():
        return jsonify({'error': 'Este WhatsApp já está em uso.'}), 400

    try:
        new_user = User(
            name=name,
            email=email,
            whatsapp=whatsapp_clean,
            profile='usuario',
            status='ativo',
            first_login=True,
            is_verified=False,
            subscription_plan='Free Trial',
            subscription_valid_until=datetime.utcnow() + timedelta(days=7)
        )
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        # Gera o token e envia e-mail
        token = generate_verification_token(email)
        send_verification_email(email, name, token)

        return jsonify({'message': 'Cadastro realizado! Por favor, verifique seu e-mail para ativar a conta.'}), 201

    except Exception as e:
        print(f"Erro ao registrar: {e}")
        db.session.rollback()
        return jsonify({'error': 'Erro ao criar conta. Tente novamente mais tarde.'}), 500

@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({'error': 'Token não fornecido.'}), 400

    email = confirm_verification_token(token)
    if not email:
        return jsonify({'error': 'O link de verificação é inválido ou expirou.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404

    if user.is_verified:
        return jsonify({'message': 'Sua conta já estava verificada! Pode fazer login.'}), 200

    user.is_verified = True
    db.session.commit()
    return jsonify({'message': 'Conta verificada com sucesso! Você já pode fazer login.'}), 200