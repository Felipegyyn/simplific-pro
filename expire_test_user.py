from src.main import app
from src.models.db import db
from src.models.user import User
from datetime import datetime, timedelta

def expire_user():
    with app.app_context():
        # Busca o usuário pelo e-mail passado
        user = User.query.filter_by(email='felipegyyyn@gmail.com').first()
        if user:
            # Coloca a data de expiração para 2 dias atrás
            user.subscription_valid_until = datetime.utcnow() - timedelta(days=2)
            db.session.commit()
            print(f"✅ Sucesso! Assinatura do usuário '{user.email}' foi expirada para testes.")
        else:
            print("❌ Usuário 'felipegyyyn@gmail.com' não encontrado no banco de dados.")

if __name__ == "__main__":
    expire_user()
