from datetime import datetime
from src.models.db import db


# --- CLASSE 1: CLIENTES E FORNECEDORES ---
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

# --- CLASSE 2: MINHAS EMPRESAS (HOLDING) ---

class Company(db.Model):
    __tablename__ = 'business_companies'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Identificação
    razao_social = db.Column(db.String(200), nullable=False)
    cnpj = db.Column(db.String(20), nullable=False)
    cnae = db.Column(db.String(20))
    data_abertura = db.Column(db.String(20))
    situacao = db.Column(db.String(20), default='ativa')
    
    # Responsável
    representante = db.Column(db.String(150))
    
    # Contato e Endereço
    telefone = db.Column(db.String(20), nullable=False)
    cep = db.Column(db.String(10))
    endereco = db.Column(db.String(200), nullable=False)
    numero = db.Column(db.String(20))
    complemento = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'razao_social': self.razao_social,
            'cnpj': self.cnpj,
            'cnae': self.cnae,
            'data_abertura': self.data_abertura,
            'situacao': self.situacao,
            'representante': self.representante,
            'telefone': self.telefone,
            'cep': self.cep,
            'endereco': self.endereco,
            'numero': self.numero,
            'complemento': self.complemento
        }

# ... (Mantenha imports e classes Stakeholder e Company existentes) ...

# ▼▼▼ NOVAS CLASSES PARA GESTÃO FINANCEIRA PJ ▼▼▼

class BusinessCategory(db.Model):
    __tablename__ = 'business_categories'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False) # 'entrada' ou 'saida'
    parent_id = db.Column(db.Integer, db.ForeignKey('business_categories.id'), nullable=True)
    
    # Relacionamento para pegar subcategorias facilmente
    subcategories = db.relationship('BusinessCategory', 
        backref=db.backref('parent', remote_side=[id]),
        lazy='dynamic'
    )

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'parent_id': self.parent_id,
            'parent_name': self.parent.name if self.parent else None
        }


class BusinessBudget(db.Model):
    __tablename__ = 'business_budgets'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('business_companies.id'), nullable=False)
    
    name = db.Column(db.String(200), nullable=False) # Ex: Planejamento 2026
    start_date = db.Column(db.String(10), nullable=False) # '2026-01'
    period_months = db.Column(db.Integer, default=12)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamento com as linhas do orçamento (Categorias)
    lines = db.relationship('BusinessBudgetLine', backref='budget', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'company_id': self.company_id,
            'start_date': self.start_date,
            'period_months': self.period_months,
            'total_value': sum(line.total_value for line in self.lines),
            'lines': [l.to_dict() for l in self.lines]
        }

class BusinessBudgetLine(db.Model):
    __tablename__ = 'business_budget_lines'

    id = db.Column(db.Integer, primary_key=True)
    budget_id = db.Column(db.Integer, db.ForeignKey('business_budgets.id'), nullable=False)
    
    category_id = db.Column(db.Integer, db.ForeignKey('business_categories.id'), nullable=False)
    subcategory_id = db.Column(db.Integer, db.ForeignKey('business_categories.id'), nullable=True)
    
    # Dados de criação (para referência)
    base_value = db.Column(db.Float)
    is_replicated = db.Column(db.Boolean, default=True)

    # Relacionamento com os valores mensais
    items = db.relationship('BusinessBudgetItem', backref='line', cascade="all, delete-orphan")
    
    # Relacionamentos para trazer os nomes das categorias
    category = db.relationship('BusinessCategory', foreign_keys=[category_id])
    subcategory = db.relationship('BusinessCategory', foreign_keys=[subcategory_id])

    @property
    def total_value(self):
        return sum(item.value for item in self.items)

    def to_dict(self):
        return {
            'id': self.id,
            'category_name': self.category.name,
            'subcategory_name': self.subcategory.name if self.subcategory else None,
            'category_id': self.category_id,
            'subcategory_id': self.subcategory_id,
            'base_value': self.base_value,
            'total_value': self.total_value,
            'items': [i.to_dict() for i in self.items]
        }

class BusinessBudgetItem(db.Model):
    __tablename__ = 'business_budget_items'

    id = db.Column(db.Integer, primary_key=True)
    line_id = db.Column(db.Integer, db.ForeignKey('business_budget_lines.id'), nullable=False)
    
    month_date = db.Column(db.Date, nullable=False)
    value = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'month': self.month_date.strftime('%Y-%m'),
            'value': self.value
        }