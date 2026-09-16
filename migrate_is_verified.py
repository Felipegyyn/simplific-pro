import os
from src.main import app
from src.models.db import db
from sqlalchemy import text

def add_is_verified_column():
    with app.app_context():
        try:
            # Verifica se a coluna já existe
            check_sql = text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='is_verified';")
            result = db.session.execute(check_sql).fetchone()
            
            if result:
                print("A coluna 'is_verified' já existe na tabela 'users'.")
                return

            # Adiciona a coluna com o valor default TRUE (para usuários existentes não serem bloqueados)
            alter_sql = text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT TRUE NOT NULL;")
            db.session.execute(alter_sql)
            db.session.commit()
            print("Coluna 'is_verified' adicionada com sucesso!")
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao adicionar coluna: {e}")

if __name__ == "__main__":
    add_is_verified_column()
