# src/models/gamification.py

from src.models.db import db
from datetime import datetime

class Achievement(db.Model):
    """
    Esta tabela é o catálogo de todas as conquistas possíveis no sistema.
    """
    __tablename__ = 'achievements'

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False) # Chave única para o código (ex: BUDGET_MASTER_3)
    name = db.Column(db.String(100), nullable=False)            # Nome da conquista (ex: Mestre do Orçamento)
    description = db.Column(db.String(255), nullable=False)     # Descrição (ex: Passou 3 meses sem estourar o orçamento)
    icon = db.Column(db.String(50), nullable=False)             # Nome do ícone do lucide-react (ex: 'ShieldCheck')

    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'name': self.name,
            'description': self.description,
            'icon': self.icon
        }

class UserAchievement(db.Model):
    """
    Esta tabela registra quais conquistas um usuário específico desbloqueou.
    """
    __tablename__ = 'user_achievements'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievements.id'), nullable=False)
    unlocked_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relações para facilitar o acesso aos objetos
    user = db.relationship('User', back_populates='achievements')
    achievement = db.relationship('Achievement')