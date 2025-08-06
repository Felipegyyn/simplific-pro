import os
import sys
from getpass import getpass

# Adiciona a pasta raiz ao path para que possamos importar 'src'
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import User, db

def reset_user_password():
    """
    Script de linha de comando para resetar a senha de um usuário.
    """
    email = input("Digite o email do usuário que terá a senha resetada: ")
    
    with app.app_context():
        user = User.query.filter_by(email=email).first()

        if not user:
            print(f"ERRO: Usuário com o email '{email}' não encontrado.")
            return

        print(f"Resetando senha para o usuário: {user.name} ({user.email})")
        
        # getpass esconde a senha enquanto é digitada
        new_password = getpass("Digite a nova senha: ")
        confirm_password = getpass("Confirme a nova senha: ")

        if new_password != confirm_password:
            print("ERRO: As senhas não coincidem. Operação cancelada.")
            return
            
        if len(new_password) < 6:
            print("ERRO: A senha deve ter pelo menos 6 caracteres. Operação cancelada.")
            return

        # Usa o método seguro do modelo para definir e hashear a nova senha
        user.set_password(new_password)
        
        # Opcional: Se quiser que o usuário seja forçado a trocar a senha no próximo login
        # user.first_login = True
        
        db.session.commit()
        
        print("\nSucesso! A senha foi resetada e salva no formato correto.")

if __name__ == '__main__':
    reset_user_password()
