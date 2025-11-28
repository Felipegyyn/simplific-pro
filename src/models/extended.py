from src.models.user import db
from datetime import datetime

# === GOAL MODEL ===
class Goal(db.Model):
    __tablename__ = 'goals'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)  # <-- Campo agora presente
    target_value = db.Column(db.Float, nullable=False)
    current_value = db.Column(db.Float, default=0.0)
    target_date = db.Column(db.Date)
    category = db.Column(db.String(50), nullable=False)
    priority = db.Column(db.String(20), nullable=False, default='média') # <-- Campo agora presente
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    image_url = db.Column(db.String(512), nullable=True) # Coluna para a URL da imagem
    
    # Adicione este relacionamento se ele não existir neste arquivo
    contributions = db.relationship(
        'GoalContribution', 
        foreign_keys='GoalContribution.goal_id',
        backref='goal',
        lazy=True, 
        cascade='all, delete-orphan'
        )

    @property
    def progress_percentage(self):
        if self.target_value <= 0:
            return 0
        return min((self.current_value / self.target_value) * 100, 100)
    
    @property
    def is_completed(self):
        return self.current_value >= self.target_value
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'target_value': self.target_value,
            'current_value': self.current_value,
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'category': self.category,
            'priority': self.priority,
            'is_active': self.is_active,
            'progress_percentage': self.progress_percentage,
            'is_completed': self.is_completed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'image_url': self.image_url
        }

# === CREDIT CARD MODEL ===
#class CreditCard(db.Model):
    #__tablename__ = 'credit_cards'
    #__table_args__ = {'extend_existing': True}

    #id = db.Column(db.Integer, primary_key=True)
    #user_id = db.Column(db.Integer, nullable=False)
    #name = db.Column(db.String(120), nullable=False)
    #brand = db.Column(db.String(50), nullable=True)
    #limit = db.Column(db.Float, nullable=False)
    #available_limit = db.Column(db.Float, nullable=False)
    #closing_day = db.Column(db.Integer, nullable=False)
    #due_day = db.Column(db.Integer, nullable=False)
    #created_at = db.Column(db.DateTime, default=datetime.utcnow)

    #def to_dict(self):
        #return {
            #'id': self.id,
            #'user_id': self.user_id,
            #'name': self.name,
            #'brand': self.brand,
            #'limit': self.limit,
            #'available_limit': self.available_limit,
            #'closing_day': self.closing_day,
            #'due_day': self.due_day,
            #'created_at': self.created_at.isoformat()
        #}

# === CREDIT CARD TRANSACTION MODEL ===
#class CreditCardTransaction(db.Model):
   # __tablename__ = 'credit_card_transactions'
    #__table_args__ = {'extend_existing': True}

    #id = db.Column(db.Integer, primary_key=True)
    #credit_card_id = db.Column(db.Integer, nullable=False)
    #user_id = db.Column(db.Integer, nullable=False)
    #date = db.Column(db.Date, nullable=False)
    #description = db.Column(db.String(255), nullable=False)
    #value = db.Column(db.Float, nullable=False)
    #created_at = db.Column(db.DateTime, default=datetime.utcnow)

    #def to_dict(self):
        #return {
            #'id': self.id,
            #'credit_card_id': self.credit_card_id,
            #'user_id': self.user_id,
            #'date': self.date.isoformat(),
            #'description': self.description,
            #'value': self.value,
            #'created_at': self.created_at.isoformat()
        #}

# === SCHEDULE EVENT MODEL ===
class ScheduleEvent(db.Model):
    __tablename__ = 'schedule_events'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(10), nullable=True)
    type = db.Column(db.String(50), nullable=False)
    priority = db.Column(db.String(50), default='medium')

    google_event_id = db.Column(db.String(255), nullable=True)
    
    # ▼▼▼ CAMPOS ADICIONADOS ▼▼▼
    value = db.Column(db.Float, nullable=True)
    category = db.Column(db.String(100), nullable=True)
    
    is_completed = db.Column(db.Boolean, default=False)
    is_recurring = db.Column(db.Boolean, default=False)
    recurring_type = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'date': self.date.isoformat(),
            'time': self.time,
            'type': self.type,
            'priority': self.priority,
            # ▼▼▼ CAMPOS ADICIONADOS ▼▼▼
            'value': self.value,
            'category': self.category,
            'is_completed': self.is_completed,
            'is_recurring': self.is_recurring,
            'recurring_type': self.recurring_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# === investiment MODEL ===
class Investment(db.Model):
    __tablename__ = 'investments'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)  
    ticker = db.Column(db.String(20), nullable=True, index=True) # Para ativos como 'ITSA4.SA'
    initial_value = db.Column(db.Float, nullable=False)
    current_value = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Float, default=1.0)
    purchase_date = db.Column(db.Date, nullable=False)
    expected_monthly_yield = db.Column(db.Float, nullable=True) # Percentual, ex: 1.5 para 1.5%
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    transactions = db.relationship('InvestmentTransaction', backref='investment', lazy=True, cascade='all, delete-orphan')
    
    @property
    def profit_loss(self):
        return self.current_value - self.initial_value
    
    @property
    def profit_loss_percentage(self):
        if self.initial_value <= 0:
            return 0
        return ((self.current_value - self.initial_value) / self.initial_value) * 100
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'ticker': self.ticker,
            'initial_value': self.initial_value,
            'current_value': self.current_value,
            'quantity': self.quantity,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'expected_monthly_yield': self.expected_monthly_yield,
            'is_active': self.is_active,
            'profit_loss': self.profit_loss,
            'profit_loss_percentage': self.profit_loss_percentage,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# ... (fim da classe Investment) ...

# =======================================================
# ▼▼▼ ADICIONE A NOVA CLASSE PARA O HISTÓRICO AQUI ▼▼▼
# =======================================================
class InvestmentTransaction(db.Model):
    __tablename__ = 'investment_transactions'

    id = db.Column(db.Integer, primary_key=True)
    # Chave estrangeira para conectar com a tabela 'investments'
    investment_id = db.Column(db.Integer, db.ForeignKey('investments.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Tipo da transação: 'aporte' (compra/depósito) ou 'resgate' (venda/retirada)
    transaction_type = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    value = db.Column(db.Float, nullable=False) # Valor monetário da transação
    notes = db.Column(db.Text, nullable=True) # Observações opcionais
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'investment_id': self.investment_id,
            'transaction_type': self.transaction_type,
            'date': self.date.isoformat(),
            'value': self.value,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }