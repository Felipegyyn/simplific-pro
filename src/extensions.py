# src/extensions.py

from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail

# Cria as instâncias das nossas ferramentas, mas sem associá-las a nenhum app ainda.
db = SQLAlchemy()
mail = Mail()