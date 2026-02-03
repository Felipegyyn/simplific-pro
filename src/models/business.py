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


class BusinessBankAccount(db.Model):
    __tablename__ = 'business_bank_accounts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('business_companies.id'), nullable=False)
    
    bank_name = db.Column(db.String(100), nullable=False)
    account_type = db.Column(db.String(50), default='corrente') # corrente, controle, aplicacao
    
    agency = db.Column(db.String(20))
    account_number = db.Column(db.String(30))
    
    open_date = db.Column(db.String(10)) # YYYY-MM-DD
    notes = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamento para pegar o nome da empresa facilmente
    company = db.relationship('Company', foreign_keys=[company_id])

    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'company_name': self.company.razao_social if self.company else 'N/A',
            'bank_name': self.bank_name,
            'account_type': self.account_type,
            'agency': self.agency,
            'account_number': self.account_number,
            'open_date': self.open_date,
            'notes': self.notes
        }

# ... (Mantenha as classes anteriores) ...

class BusinessPayable(db.Model):
    __tablename__ = 'business_payables'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relacionamentos Principais
    company_id = db.Column(db.Integer, db.ForeignKey('business_companies.id'), nullable=False)
    stakeholder_id = db.Column(db.Integer, db.ForeignKey('business_stakeholders.id'), nullable=False)
    
    # Classificação
    category_id = db.Column(db.Integer, db.ForeignKey('business_categories.id'), nullable=False)
    subcategory_id = db.Column(db.Integer, db.ForeignKey('business_categories.id'), nullable=True)
    
    # Dados Financeiros
    value = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.String(10), nullable=False) # Vencimento Original
    extension_date = db.Column(db.String(10)) # Data Prorrogação / Pagamento Real
    
    # Status e Pagamento
    status = db.Column(db.String(20), default='a_pagar') # a_pagar, pago
    bank_account_id = db.Column(db.Integer, db.ForeignKey('business_bank_accounts.id'), nullable=True)
    bank_name = db.Column(db.String(100)) # Guardamos o nome do banco para facilitar filtros visuais antes de escolher a conta
    
    # Documento
    doc_type = db.Column(db.String(50)) # nota_fiscal, recibo, outros
    nf_type = db.Column(db.String(50)) # municipal, estadual
    doc_number = db.Column(db.String(100)) # Numero NF ou Chave Danfe
    
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamentos para facilitar o to_dict
    company = db.relationship('Company', foreign_keys=[company_id])
    stakeholder = db.relationship('Stakeholder', foreign_keys=[stakeholder_id])
    category = db.relationship('BusinessCategory', foreign_keys=[category_id])
    subcategory = db.relationship('BusinessCategory', foreign_keys=[subcategory_id])
    bank_account = db.relationship('BusinessBankAccount', foreign_keys=[bank_account_id])

    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'company_name': self.company.razao_social if self.company else 'N/A',
            
            'stakeholder_id': self.stakeholder_id,
            'stakeholder_name': self.stakeholder.name if self.stakeholder else 'N/A',
            
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else 'N/A',
            'subcategory_id': self.subcategory_id,
            'subcategory_name': self.subcategory.name if self.subcategory else None,
            
            'value': self.value,
            'due_date': self.due_date,
            'extension_date': self.extension_date or self.due_date,
            
            'status': self.status,
            'bank_account_id': self.bank_account_id,
            'bank_name': self.bank_name, # Pode vir do banco salvo ou da conta vinculada
            
            'doc_type': self.doc_type,
            'nf_type': self.nf_type,
            'doc_number': self.doc_number,
            'notes': self.notes
        }

# ... (Mantenha as classes anteriores) ...

class InventoryProduct(db.Model):
    __tablename__ = 'inventory_products'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Vinculamos à categoria que já criamos antes
    category_id = db.Column(db.Integer, db.ForeignKey('business_categories.id'), nullable=True)
    
    name = db.Column(db.String(150), nullable=False)
    sku = db.Column(db.String(50)) # Código de Barras / Referência
    unit = db.Column(db.String(10), default='UN') # UN, KG, L
    
    # Saldo Atual (Atualizado automaticamente pelas movimentações)
    current_stock = db.Column(db.Float, default=0.0)
    min_stock = db.Column(db.Float, default=5.0) # Ponto de reposição
    
    # Financeiro
    cost_price = db.Column(db.Float, default=0.0)
    sale_price = db.Column(db.Float, default=0.0)
    
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamento com categoria para exibir o nome
    category = db.relationship('BusinessCategory', foreign_keys=[category_id])
    
    # Histórico de movimentos (se deletar produto, apaga histórico)
    movements = db.relationship('InventoryMovement', backref='product', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'sku': self.sku,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else 'Geral',
            'unit': self.unit,
            'current_stock': self.current_stock,
            'min_stock': self.min_stock,
            'cost_price': self.cost_price,
            'sale_price': self.sale_price,
            'description': self.description
        }

class InventoryMovement(db.Model):
    __tablename__ = 'inventory_movements'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('inventory_products.id'), nullable=False)
    
    type = db.Column(db.String(20), nullable=False) # 'entrada' ou 'saida'
    quantity = db.Column(db.Float, nullable=False)
    reason = db.Column(db.String(50)) # compra, venda, perda, ajuste
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'type': self.type,
            'quantity': self.quantity,
            'reason': self.reason,
            'date': self.created_at.strftime('%Y-%m-%d %H:%M')
        }


class BusinessSale(db.Model):
    __tablename__ = 'business_sales'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Dados Gerais
    company_id = db.Column(db.Integer, db.ForeignKey('business_companies.id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('business_stakeholders.id'), nullable=False)
    
    # Produto (Opcional, pois pode ser venda avulsa)
    product_id = db.Column(db.Integer, db.ForeignKey('inventory_products.id'), nullable=True)
    quantity = db.Column(db.Float, default=1.0)
    
    # Financeiro
    total_value = db.Column(db.Float, nullable=False)
    payment_terms = db.Column(db.String(20)) # vista, parcelado
    payment_method = db.Column(db.String(50)) # pix, boleto, etc
    doc_nf = db.Column(db.String(50))
    
    # Configuração de Juros/Multa (Salva na venda para aplicar nas parcelas)
    apply_penalty = db.Column(db.Boolean, default=False)
    fine_percent = db.Column(db.Float, default=0.0)
    interest_percent = db.Column(db.Float, default=0.0)
    
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamentos
    company = db.relationship('Company', foreign_keys=[company_id])
    client = db.relationship('Stakeholder', foreign_keys=[client_id])
    product = db.relationship('InventoryProduct', foreign_keys=[product_id])
    
    # Uma venda tem várias parcelas (recebíveis)
    receivables = db.relationship('BusinessReceivable', backref='sale', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'client_name': self.client.name if self.client else 'Cliente Removido',
            'product_name': self.product.name if self.product else None,
            'quantity': self.quantity,
            'total_value': self.total_value,
            'payment_terms': self.payment_terms,
            'date': self.created_at.strftime('%Y-%m-%d')
        }

class BusinessReceivable(db.Model):
    __tablename__ = 'business_receivables'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sale_id = db.Column(db.Integer, db.ForeignKey('business_sales.id'), nullable=False)
    
    # Redundância útil para filtros rápidos sem join
    company_id = db.Column(db.Integer, db.ForeignKey('business_companies.id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('business_stakeholders.id'), nullable=False)
    
    installment_number = db.Column(db.Integer, nullable=False) # 1 de 12, 2 de 12...
    total_installments = db.Column(db.Integer, nullable=False)
    
    value = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.String(10), nullable=False) # YYYY-MM-DD
    
    status = db.Column(db.String(20), default='a_receber') # a_receber, recebido
    
    # Relacionamentos para facilitar listagem
    company = db.relationship('Company', foreign_keys=[company_id])
    client = db.relationship('Stakeholder', foreign_keys=[client_id])

    def to_dict(self):
        sale = self.sale
        return {
            'id': self.id,
            'sale_id': self.sale_id,
            'company_name': self.company.razao_social if self.company else '-',
            'client_name': self.client.name if self.client else '-',
            'product_name': sale.product.name if sale and sale.product else None,
            'quantity': sale.quantity if sale else 0,
            
            'installment_number': self.installment_number,
            'total_installments': self.total_installments,
            'value': self.value,
            'due_date': self.due_date,
            'status': self.status,
            'doc_nf': sale.doc_nf if sale else '',
            
            # Repassa config de juros da venda pai
            'apply_penalty': sale.apply_penalty if sale else False,
            'fine_percent': sale.fine_percent if sale else 0,
            'interest_percent': sale.interest_percent if sale else 0
        }