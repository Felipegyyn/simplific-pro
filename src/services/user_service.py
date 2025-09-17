# src/services/user_service.py

from src.models.user import User
from src.models.db import db
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
from src.models.user import PasswordResetToken
import string
import secrets
import re
import random


def _generate_temporary_password(length=10):
    """Gera uma senha aleatória segura."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for i in range(length))
    return password

def normalize_phone_number(number):
    """Normaliza o número de telefone para o padrão E.164 (+55119XXXXXXXX)."""
    if not number:
        return None
    # Remove tudo que não for dígito
    clean_number = re.sub(r'\D', '', number)
    # Lógica para adicionar o 9, se necessário (padrão Brasil)
    if len(clean_number) == 12 and clean_number.startswith('55'):
        ddd = clean_number[2:4]
        resto = clean_number[4:]
        return f'+55{ddd}9{resto}'
    if len(clean_number) <= 11:
        return f'+55{clean_number}' # Assume DDD já incluído
    if len(clean_number) == 13 and clean_number.startswith('55'):
        return f'+{clean_number}'
    return f'+{clean_number}' # Fallback

# Dentro de src/services/user_service.py

def generate_temp_password(length=8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for i in range(length))

def create_user_from_purchase(name, email, whatsapp):
    """
    Cria um novo usuário a partir de uma compra na Monetizze,
    garantindo que a senha seja hasheada corretamente.
    """
    if not name or not email or not whatsapp:
        return False, "Dados do cliente incompletos (nome, e-mail ou WhatsApp ausente)."

    try:
        # Verifica se o usuário já existe
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"Usuário com email {email} já existe. Ignorando criação.")
            # Retorna False para não enviar credenciais novamente
            return False, "Usuário já existente."

        # Gera uma senha temporária
        temp_password = generate_temp_password()

        # Cria a nova instância do usuário
        new_user = User(
            name=name,
            email=email,
            whatsapp=whatsapp,
            profile='usuario', # Perfil padrão para novos clientes
            status='active',
            first_login=True # Marca que é o primeiro login
        )

        # --- ESTA É A CORREÇÃO CRUCIAL ---
        # Usa o método set_password para gerar o HASH seguro
        new_user.set_password(temp_password)
        # ---------------------------------

        db.session.add(new_user)
        db.session.commit()

        print(f"Usuário '{name}' criado com sucesso a partir da compra!")

        # Retorna os dados do usuário e a senha em texto puro para ser enviada
        return True, {
            'name': new_user.name,
            'email': new_user.email,
            'whatsapp': new_user.whatsapp,
            'password': temp_password
        }

    except Exception as e:
        db.session.rollback()
        print(f"ERRO CRÍTICO ao criar usuário a partir da compra: {e}")
        return False, str(e)

# COLE ESTE BLOCO NO FINAL DO ARQUIVO user_service.py

def generate_password_reset_token(user):
    """
    Gera e salva um token de redefinição de senha para um usuário.
    Retorna o token em texto puro para ser enviado por e-mail.
    """
    # Define a validade do token (ex: 1 hora)
    expires_delta = timedelta(hours=1)

    # Gera um token seguro e aleatório
    token = secrets.token_urlsafe(32)

    # Cria a nova instância do token
    new_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + expires_delta
    )

    db.session.add(new_token)
    db.session.commit()

    return token