from src.models.db import db
from datetime import datetime, date
from src.models.user import User

class CreditCard(db.Model):
    __tablename__ = 'credit_cards'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    limit = db.Column(db.Float, nullable=False)
    available_limit = db.Column(db.Float)
    brand = db.Column(db.String(50))
    closing_day = db.Column(db.Integer, nullable=False)  # Dia do fechamento (1-31)
    due_day = db.Column(db.Integer, nullable=False)      # Dia do vencimento (1-31)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    card_number = db.Column(db.String(20))
    last_digits = db.Column(db.String(4))  # <<< ADICIONE ESTA LINHA
    pluggy_item_id = db.Column(db.String(100), nullable=True)       ### <<< NOVO (ID da Conexão Geral)
    pluggy_credit_card_id = db.Column(db.String(100), nullable=True) ### <<< NOVO (ID desse cartão específico)
    transactions = db.relationship("CreditCardTransaction", backref="credit_card", lazy=True)


    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'available_limit': self.available_limit,
            'limit': self.limit,
            'closing_day': self.closing_day,
            'due_day': self.due_day,
            'is_active': self.is_active,
            'last_digits': self.last_digits,
            'is_pluggy_connected': bool(self.pluggy_item_id), ### <<< NOVO (Para o front saber se é automático)
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class CreditCardTransaction(db.Model):
    __tablename__ = 'credit_card_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    credit_card_id = db.Column(db.Integer, db.ForeignKey('credit_cards.id'), nullable=False)
    fatura_id = db.Column(db.Integer, db.ForeignKey('faturas.id'), nullable=True) # <-- ADICIONE ESTA LINHA
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    value = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    installments = db.Column(db.Integer, default=1)
    current_installment = db.Column(db.Integer, default=1)
    is_recurring = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    pluggy_transaction_id = db.Column(db.String(150), unique=True, nullable=True) ### <<< NOVO (ID Único da transação)

    
    def to_dict(self):
        from src.models.financial import Category
        category = Category.query.get(self.category_id)
        return {
            'id': self.id,
            'credit_card_id': self.credit_card_id,
            'category_id': self.category_id,
            'category_name': category.name if category else None,
            'description': self.description,
            'value': self.value,
            'date': self.date.isoformat() if self.date else None,
            'installments': self.installments,
            'current_installment': self.current_installment,
            'is_recurring': self.is_recurring,
            'pluggy_transaction_id': self.pluggy_transaction_id, ### <<< NOVO
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

#class Goal(db.Model):
    #__tablename__ = 'goals'
    #__table_args__ = {'extend_existing': True}
    
    #id = db.Column(db.Integer, primary_key=True)
    #user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    #name = db.Column(db.String(100), nullable=False)
    #description = db.Column(db.Text)
    #target_value = db.Column(db.Float, nullable=False)
    #current_value = db.Column(db.Float, default=0.0)
    #target_date = db.Column(db.Date)
    #category = db.Column(db.String(50), nullable=False)  # 'saving', 'investment', 'purchase', 'debt'
    #priority = db.Column(db.String(20), nullable=False, default='média')
    #is_active = db.Column(db.Boolean, default=True)
    #created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    #@property
    #def progress_percentage(self):
        #if self.target_value <= 0:
            #return 0
        #return min((self.current_value / self.target_value) * 100, 100)
    
    #@property
    #def is_completed(self):
        #return self.current_value >= self.target_value
    
    #def to_dict(self):
        #return {
            #'id': self.id,
            #'name': self.name,
            #'description': self.description,
            #'target_value': self.target_value,
            #'current_value': self.current_value,
            #'target_date': self.target_date.isoformat() if self.target_date else None,
            #'category': self.category,
            #'priority': self.priority,
            #'is_active': self.is_active,
            #'progress_percentage': self.progress_percentage,
            #'is_completed': self.is_completed,
            #'created_at': self.created_at.isoformat() if self.created_at else None
        #}

class GoalContribution(db.Model):
    __tablename__ = 'goal_contributions'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False)
    value = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    date = db.Column(db.Date, nullable=False, default=date.today)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'goal_id': self.goal_id,
            'value': self.value,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

#class Investment(db.Model):
    #__tablename__ = 'investments'
    #__table_args__ = {'extend_existing': True}

    #id = db.Column(db.Integer, primary_key=True)
    #user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    #name = db.Column(db.String(100), nullable=False)
    #type = db.Column(db.String(50), nullable=False)  # 'stock', 'fund', 'bond', 'crypto', 'savings'
    #initial_value = db.Column(db.Float, nullable=False)
    #current_value = db.Column(db.Float, nullable=False)
    #quantity = db.Column(db.Float, default=1.0)
    #purchase_date = db.Column(db.Date, nullable=False)
    #is_active = db.Column(db.Boolean, default=True)
    #created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    #@property
    #def profit_loss(self):
    #    return self.current_value - self.initial_value
    
    #@property
    #def profit_loss_percentage(self):
    #    if self.initial_value <= 0:
    #        return 0
    #    return ((self.current_value - self.initial_value) / self.initial_value) * 100
    
    #def to_dict(self):
    #    return {
    #        'id': self.id,
    #        'name': self.name,
    #        'type': self.type,
    #        'initial_value': self.initial_value,
    #        'current_value': self.current_value,
    #        'quantity': self.quantity,
    #        'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
    #        'is_active': self.is_active,
    #        'profit_loss': self.profit_loss,
    #        'profit_loss_percentage': self.profit_loss_percentage,
    #        'created_at': self.created_at.isoformat() if self.created_at else None
    #    }

#class ScheduleItem(db.Model):
    #__tablename__ = 'schedule_items'
    #__table_args__ = {'extend_existing': True}
    
    #id = db.Column(db.Integer, primary_key=True)
    #user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    #title = db.Column(db.String(200), nullable=False)
    #description = db.Column(db.Text)
    #date = db.Column(db.Date, nullable=False)
    #time = db.Column(db.Time)
    #type = db.Column(db.String(50), nullable=False)  # 'payment', 'income', 'reminder', 'meeting'
    #priority = db.Column(db.String(20), default='medium')  # 'low', 'medium', 'high'
    #is_completed = db.Column(db.Boolean, default=False)
    #is_recurring = db.Column(db.Boolean, default=False)
    #recurring_type = db.Column(db.String(20))  # 'daily', 'weekly', 'monthly', 'yearly'
    #created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    #def to_dict(self):
        #return {
            #'id': self.id,
            #'title': self.title,
            #'description': self.description,
            #'date': self.date.isoformat() if self.date else None,
            #'time': self.time.isoformat() if self.time else None,
            #'type': self.type,
            #'priority': self.priority,
            #'is_completed': self.is_completed,
            #'is_recurring': self.is_recurring,
            #'recurring_type': self.recurring_type,
            #'created_at': self.created_at.isoformat() if self.created_at else None
        #}

class CreditCardCategory(db.Model):
    __tablename__ = 'credit_card_categories'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    emoji = db.Column(db.String(10))  # emoji como 🛒, 🎉, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'emoji': self.emoji,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Fatura(db.Model):
    __tablename__ = 'faturas'

    id = db.Column(db.Integer, primary_key=True)
    cartao_id = db.Column(db.Integer, db.ForeignKey('credit_cards.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # ← ADICIONADO
    valor_total = db.Column(db.Numeric(12, 2), nullable=False)
    mes = db.Column(db.Integer, nullable=False)
    ano = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='em_aberto')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


def to_dict(self):
    return {
        'id': self.id,
        'cartao_id': self.cartao_id,
        'valor_total': self.valor_total,
        'mes': self.mes,
        'ano': self.ano,
        'status': self.status,
        'created_at': self.created_at.isoformat() if self.created_at else None
    }

# ▼▼▼ COLE NO FINAL DO ARQUIVO src/models/extended_modules.py ▼▼▼

class BankAccount(db.Model):
    __tablename__ = 'bank_accounts'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    bank_name = db.Column(db.String(100), nullable=False) # Nome do Banco
    agency = db.Column(db.String(20), nullable=True)      # Agência
    account_number = db.Column(db.String(30), nullable=False) # Conta
    
    # Saldo Inicial (o ponto de partida)
    initial_balance = db.Column(db.Float, default=0.0)
    
    # Saldo Atual (será atualizado conforme movimentações futuras)
    current_balance = db.Column(db.Float, default=0.0)
    
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'bank_name': self.bank_name,
            'agency': self.agency,
            'account_number': self.account_number,
            'balance': self.current_balance, # O front recebe o saldo ATUAL
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

