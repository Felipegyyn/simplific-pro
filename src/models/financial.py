from datetime import datetime
from src.models.db import db

class Category(db.Model):
        __tablename__ = 'categories'
        
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(100), nullable=False)
        type = db.Column(db.String(20), nullable=False)  # 'entrada' or 'saida'

        color = db.Column(db.String(7), default='#808080')

        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)

        def to_dict(self):
            return {
                'id': self.id,
                'name': self.name,
                'type': self.type,
                'color': self.color or '#808080',
                'user_id': self.user_id,
                'created_at': self.created_at.isoformat() if self.created_at else None
            }

class Planning(db.Model):
        __tablename__ = 'planning'

        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, nullable=False)
        type = db.Column(db.String(50), nullable=False)
        date = db.Column(db.Date, nullable=False)
        category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)

        category = db.relationship('Category')
        form = db.Column(db.String(50), nullable=False)
        is_recurring = db.Column(db.Boolean, default=False)
        value = db.Column(db.Float, nullable=False)
        observations = db.Column(db.String(255), nullable=True)
        recurrence_period = db.Column(db.Integer, nullable=True)
        recurrence_group_id = db.Column(db.String, nullable=True, index=True) # <-- ADICIONE ESTA LINHA
        status = db.Column(db.String(20), default='active')


        def to_dict(self):
            return {
                'id': self.id,
                'type': self.type,
                'start_date': self.date,
                'end_date': self.date,
                'total_amount': self.value,
                'spent_amount': 0,
                'progress': 0,
                'status': self.status,  # ✅ PEGA DO BANCO
                'is_recurring': self.is_recurring,
                'recurrence_period': self.recurrence_period,
                'observations': self.observations,
                'category_id': self.category_id,  # ✅ ESTA LINHA
                'category_name': self.category.name if self.category else ''
            }




class Transaction(db.Model):
        __tablename__ = 'transactions'
        
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        date = db.Column(db.Date, nullable=False)
        type = db.Column(db.String(20), nullable=False)  # 'entrada' or 'saida'
        category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
        format = db.Column(db.String(20), nullable=False)  # 'fixo' or 'variavel'
        payment_form = db.Column(db.String(20), nullable=False)  # 'a_vista' or 'parcelado'
        installments = db.Column(db.Integer, default=1)
        current_installment = db.Column(db.Integer, default=1)
        description = db.Column(db.String(200), nullable=False)
        value = db.Column(db.Float, nullable=False)
        status = db.Column(db.String(20), default='pendente')  # 'pendente' or 'confirmada'
        parent_transaction_id = db.Column(db.Integer, db.ForeignKey('transactions.id'))  # For installments
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        confirmed_at = db.Column(db.DateTime)
        planning_id = db.Column(db.Integer, db.ForeignKey('planning.id'), nullable=True)
        receipt_image_url = db.Column(db.String(255), nullable=True) # URL do comprovante (Cloudinary)
        
        # Relationships
        category = db.relationship('Category', backref='transactions', lazy='joined')
        parent_transaction = db.relationship('Transaction', remote_side=[id], backref='child_transactions')

        def to_dict(self):
            return {
                'id': self.id,
                'user_id': self.user_id,
                'date': self.date.isoformat() if self.date else None,
                'type': self.type,
                'category_id': self.category_id,
                'category_name': self.category.name if self.category else None,
                'format': self.format,
                'payment_form': self.payment_form,
                'installments': self.installments,
                'current_installment': self.current_installment,
                'description': self.description,
                'value': self.value,
                'status': self.status,
                'parent_transaction_id': self.parent_transaction_id,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None
            }

        def to_frontend_dict(self):
            return {
                'id': self.id,
                'description': self.description,
                'amount': self.value,
                'transaction_date': self.date.strftime('%Y-%m-%d') if self.date else None,
                'category': self.category.name if self.category else 'Sem categoria',
                'type': 'income' if self.type == 'entrada' else 'expense',
                'status': 'confirmada' if self.status == 'confirmada' else 'pendente'
            }



