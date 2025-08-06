# src/create_admin.py

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models.user import User, db
from src.main import app
import bcrypt

with app.app_context():
    email = "felipegyyn@gmail.com"
    senha = "@302980Fv"

    hashed_password = bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Excluir se já existe
    existing = User.query.filter_by(email=email).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        print("Usuário antigo removido.")

    # Criar novo admin
    novo_usuario = User(email=email, password_hash=hashed_password, is_admin=True,telefone_whatsapp='+5562982227333')
    db.session.add(novo_usuario)
    db.session.commit()
    print("Administrador criado com sucesso.")

