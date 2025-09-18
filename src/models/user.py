from datetime import datetime
# Importe a werkzeug.security para hashing de senha
from src.models.db import db
from src.extensions import bcrypt
from datetime import datetime, timedelta


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    whatsapp = db.Column(db.String(30), unique=True, nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    profile = db.Column(db.String(50), default='usuario', nullable=False)
    status = db.Column(db.String(20), default='ativo', nullable=False)
    first_login = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    preferred_response_format = db.Column(db.String(10), nullable=False, default='text')
    receive_weekly_summary = db.Column(db.Boolean, nullable=False, default=True)
    # Adicione esta linha junto com as outras colunas do modelo User
    subscription_valid_until = db.Column(db.Date, nullable=True, default=None)
    # Adicione esta linha dentro da classe User
    password_reset_tokens = db.relationship('PasswordResetToken', backref='user', lazy=True, cascade="all, delete-orphan")
    # Adicione esta linha junto com as outras colunas do modelo User
    profile_image_url = db.Column(db.String(255), nullable=True, default=None)


    def __repr__(self):
        return f'<User {self.email}>'

    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Check if provided password matches hash"""
        # Adiciona uma verificação para garantir que o hash não está vazio
        if not self.password_hash:
            return False
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'whatsapp': self.whatsapp,
            'profile': self.profile,
            'status': self.status,
            'first_login': self.first_login,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

# COLE ESTE BLOCO NO FINAL DO ARQUIVO user.py

class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(128), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

