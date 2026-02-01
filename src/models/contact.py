from src.models.db import db
from datetime import datetime

class Contact(db.Model):
    __tablename__ = 'contacts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    whatsapp = db.Column(db.String(30), nullable=True) # Número normalizado (+55...)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamento com User (opcional, mas bom ter)
    user = db.relationship('User', backref=db.backref('contacts', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'whatsapp': self.whatsapp,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }