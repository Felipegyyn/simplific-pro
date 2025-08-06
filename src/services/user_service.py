# src/services/user_service.py

from src.models.user import User
from src.models.db import db
from werkzeug.security import generate_password_hash
import string
import secrets
import re

def _generate_temporary_password(length=10):
    """Gera uma senha aleatória segura."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for i in range(length))
    return password

def _normalize_phone_number(number):
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

def create_user_from_purchase(name, email, whatsapp):
    """
    Função principal da "Fábrica". Cria um novo usuário a partir de uma compra.
    Retorna (True, dados_do_usuario) em caso de sucesso, ou (False, "mensagem_de_erro") em caso de falha.
    """
    # 1. Validação dos dados de entrada
    if not all([name, email, whatsapp]):
        return False, "Dados do cliente incompletos (nome, e-mail ou WhatsApp ausente)."

    # 2. Verifica se o usuário já existe
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        print(f"AVISO: Tentativa de criar usuário com e-mail já existente: {email}")
        return False, "Usuário com este e-mail já existe."

    # 3. Prepara os dados do novo usuário
    temp_password = _generate_temporary_password()
    password_hash = generate_password_hash(temp_password)
    normalized_whatsapp = _normalize_phone_number(whatsapp)

    new_user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        whatsapp=normalized_whatsapp,
        profile='usuario' # Garante que o novo usuário nunca será administrador
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        print(f"✅ Usuário '{name}' criado com sucesso a partir da compra!")

        # Prepara os dados para a Fase 4 (Notificações)
        user_credentials = {
            'name': name,
            'email': email,
            'whatsapp': normalized_whatsapp,
            'password': temp_password # Envia a senha em texto plano, antes de ser descartada
        }
        return True, user_credentials

    except Exception as e:
        db.session.rollback()
        print(f"ERRO CRÍTICO ao criar usuário no banco de dados: {e}")
        return False, "Erro interno ao salvar o novo usuário."