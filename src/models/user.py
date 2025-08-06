from datetime import datetime
# Importe a werkzeug.security para hashing de senha
from werkzeug.security import generate_password_hash, check_password_hash
from src.models.db import db

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

    def __repr__(self):
        return f'<User {self.email}>'

    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check if provided password matches hash"""
        # Adiciona uma verificação para garantir que o hash não está vazio
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

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