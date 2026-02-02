from datetime import datetime
from src.models.db import db

class Stakeholder(db.Model):
    __tablename__ = 'business_stakeholders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Dono do cadastro
    
    type = db.Column(db.String(10), nullable=False) # 'pj' ou 'pf'
    name = db.Column(db.String(150), nullable=False) # Razão Social ou Nome
    tax_id = db.Column(db.String(20)) # CPF ou CNPJ
    
    # Contato
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    
    # Endereço
    zip_code = db.Column(db.String(10))
    address = db.Column(db.String(200))
    number = db.Column(db.String(20))
    complement = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'name': self.name,
            'tax_id': self.tax_id,
            'phone': self.phone,
            'email': self.email,
            'zip_code': self.zip_code,
            'address': self.address,
            'number': self.number,
            'complement': self.complement
        }