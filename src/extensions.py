# src/extensions.py

from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_bcrypt import Bcrypt

# Cria as instâncias das nossas ferramentas, mas sem associá-las a nenhum app ainda.
bcrypt = Bcrypt()
db = SQLAlchemy()
mail = Mail()