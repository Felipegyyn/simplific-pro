from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.db import db
from src.models.business import Stakeholder, Company, BusinessCategory, BusinessBudget, BusinessBudgetLine, BusinessBudgetItem, BusinessBankAccount, BusinessPayable, InventoryProduct, InventoryMovement, BusinessSale, BusinessReceivable
from datetime import date, timedelta, datetime
import calendar
from src.routes.user import active_user_required

business_bp = Blueprint('business', __name__)

# ==========================================
# ROTAS DE STAKEHOLDERS (CLIENTES/FORNECEDORES)
# ==========================================

# --- LISTAR TODOS ---
@business_bp.route('/business/stakeholders', methods=['GET'])
@jwt_required()
@active_user_required
def get_stakeholders():
    user_id = get_jwt_identity()
    # Busca apenas os cadastros desse usuário
    stakeholders = Stakeholder.query.filter_by(user_id=user_id).order_by(Stakeholder.name).all()
    return jsonify([s.to_dict() for s in stakeholders]), 200

# --- CRIAR NOVO ---
@business_bp.route('/business/stakeholders', methods=['POST'])
@jwt_required()
@active_user_required
def create_stakeholder():
    user_id = get_jwt_identity()
    data = request.json

    if not data.get('name'):
        return jsonify({'error': 'Nome/Razão Social é obrigatório'}), 400

    new_stakeholder = Stakeholder(
        user_id=user_id,
        type=data.get('type', 'pj'),
        name=data.get('name'),
        tax_id=data.get('tax_id'),
        phone=data.get('phone'),
        email=data.get('email'),
        zip_code=data.get('zip'),
        address=data.get('address'),
        number=data.get('number'),
        complement=data.get('complement')
    )

    db.session.add(new_stakeholder)
    db.session.commit()

    return jsonify(new_stakeholder.to_dict()), 201

# --- DELETAR ---
@business_bp.route('/business/stakeholders/<int:id>', methods=['DELETE'])
@jwt_required()
@active_user_required
def delete_stakeholder(id):
    user_id = get_jwt_identity()
    stakeholder = Stakeholder.query.filter_by(id=id, user_id=user_id).first()

    if not stakeholder:
        return jsonify({'error': 'Cadastro não encontrado'}), 404

    db.session.delete(stakeholder)
    db.session.commit()
    return '', 204

# --- EDITAR (Opcional por enquanto, mas bom ter) ---
@business_bp.route('/business/stakeholders/<int:id>', methods=['PUT'])
@jwt_required()
@active_user_required
def update_stakeholder(id):
    user_id = get_jwt_identity()
    stakeholder = Stakeholder.query.filter_by(id=id, user_id=user_id).first()

    if not stakeholder:
        return jsonify({'error': 'Cadastro não encontrado'}), 404

    data = request.json
    
    # Atualiza campos se existirem no payload
    if 'name' in data: stakeholder.name = data['name']
    if 'tax_id' in data: stakeholder.tax_id = data['tax_id']
    if 'phone' in data: stakeholder.phone = data['phone']
    if 'email' in data: stakeholder.email = data['email']
    if 'address' in data: stakeholder.address = data['address']
    
    db.session.commit()
    return jsonify(stakeholder.to_dict()), 200


# ==========================================
# ROTAS DE COMPANIES (MINHAS EMPRESAS)
# ==========================================

@business_bp.route('/business/companies', methods=['GET'])
@jwt_required()
@active_user_required
def get_companies():
    user_id = get_jwt_identity()
    companies = Company.query.filter_by(user_id=user_id).order_by(Company.razao_social).all()
    return jsonify([c.to_dict() for c in companies]), 200

@business_bp.route('/business/companies', methods=['POST'])
@jwt_required()
@active_user_required
def create_company():
    user_id = get_jwt_identity()
    data = request.json

    if not data.get('razao_social') or not data.get('cnpj'):
        return jsonify({'error': 'Razão Social e CNPJ são obrigatórios'}), 400

    new_company = Company(
        user_id=user_id,
        razao_social=data.get('razao_social'),
        cnpj=data.get('cnpj'),
        cnae=data.get('cnae'),
        data_abertura=data.get('data_abertura'),
        situacao=data.get('situacao', 'ativa'),
        representante=data.get('representante'),
        telefone=data.get('telefone'),
        cep=data.get('cep'),
        endereco=data.get('endereco'),
        numero=data.get('numero'),
        complemento=data.get('complemento')
    )

    db.session.add(new_company)
    db.session.commit()
    return jsonify(new_company.to_dict()), 201

@business_bp.route('/business/companies/<int:id>', methods=['PUT'])
@jwt_required()
@active_user_required
def update_company(id):
    user_id = get_jwt_identity()
    company = Company.query.filter_by(id=id, user_id=user_id).first()
    if not company: return jsonify({'error': 'Empresa não encontrada'}), 404

    data = request.json
    for key, value in data.items():
        if hasattr(company, key) and key not in ['id', 'user_id', 'created_at']:
            setattr(company, key, value)
    
    db.session.commit()
    return jsonify(company.to_dict()), 200

@business_bp.route('/business/companies/<int:id>', methods=['DELETE'])
@jwt_required()
@active_user_required
def delete_company(id):
    user_id = get_jwt_identity()
    company = Company.query.filter_by(id=id, user_id=user_id).first()
    if not company: return jsonify({'error': 'Empresa não encontrada'}), 404
    db.session.delete(company)
    db.session.commit()
    return '', 204

# ==========================================
# ROTAS DE CATEGORIAS (PLANO DE CONTAS)
# ==========================================

@business_bp.route('/business/categories', methods=['GET'])
@jwt_required()
@active_user_required
def get_categories():
    user_id = get_jwt_identity()
    cats = BusinessCategory.query.filter_by(user_id=user_id).order_by(BusinessCategory.name).all()
    return jsonify([c.to_dict() for c in cats]), 200

@business_bp.route('/business/categories', methods=['POST'])
@jwt_required()
@active_user_required
def create_category():
    user_id = get_jwt_identity()
    data = request.json
    
    if not data.get('name'): return jsonify({'error': 'Nome obrigatório'}), 400

    new_cat = BusinessCategory(
        user_id=user_id,
        name=data.get('name'),
        type=data.get('type', 'saida'),
        parent_id=data.get('parent_id') if data.get('parent_id') != 'root' else None
    )
    
    db.session.add(new_cat)
    db.session.commit()
    return jsonify(new_cat.to_dict()), 201


@business_bp.route('/business/categories/<int:id>', methods=['PUT'])
@jwt_required()
@active_user_required
def update_category(id):
    user_id = get_jwt_identity()
    category = BusinessCategory.query.filter_by(id=id, user_id=user_id).first()
    if not category: return jsonify({'error': 'Categoria não encontrada'}), 404

    data = request.json
    if 'name' in data: category.name = data['name']
    if 'type' in data: category.type = data['type']
    if 'parent_id' in data: 
        category.parent_id = data['parent_id'] if data['parent_id'] != 'root' else None
    
    db.session.commit()
    return jsonify(category.to_dict()), 200

@business_bp.route('/business/categories/<int:id>', methods=['DELETE'])
@jwt_required()
@active_user_required
def delete_category(id):
    user_id = get_jwt_identity()
    category = BusinessCategory.query.filter_by(id=id, user_id=user_id).first()
    if not category: return jsonify({'error': 'Categoria não encontrada'}), 404
    
    # Opcional: Verificar se está em uso antes de deletar
    db.session.delete(category)
    db.session.commit()
    return '', 204

# ==========================================
# ROTAS DE PLANEJAMENTO (ORÇAMENTO)
# ==========================================

def add_months(sourcedate, months):
    """Função auxiliar para somar meses a uma data corretamente"""
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, calendar.monthrange(year,month)[1])
    return date(year, month, day)

@business_bp.route('/business/planning', methods=['GET'])
@jwt_required()
@active_user_required
def get_plannings():
    user_id = get_jwt_identity()
    # Traz os planejamentos com seus itens carregados
    plannings = BusinessBudget.query.filter_by(user_id=user_id).order_by(BusinessBudget.created_at.desc()).all()
    return jsonify([p.to_dict() for p in plannings]), 200

@business_bp.route('/business/planning', methods=['POST'])
@jwt_required()
@active_user_required
def create_planning_line():
    user_id = get_jwt_identity()
    data = request.json

    # 1. Verifica se já existe um Orçamento com esse NOME e EMPRESA
    existing_budget = BusinessBudget.query.filter_by(
        user_id=user_id, 
        company_id=data['company_id'],
        name=data['name']
    ).first()

    try:
        # Se não existe, cria o Pai
        if not existing_budget:
            existing_budget = BusinessBudget(
                user_id=user_id,
                company_id=data['company_id'],
                name=data['name'],
                start_date=data['start_date'],
                period_months=int(data['period_months'])
            )
            db.session.add(existing_budget)
            db.session.flush() # Pega o ID
        
        # 2. Cria a Linha (Categoria) dentro do Orçamento
        new_line = BusinessBudgetLine(
            budget_id=existing_budget.id,
            category_id=data['category_id'],
            subcategory_id=data.get('subcategory_id'),
            base_value=float(data.get('base_value', 0)),
            is_replicated=data.get('replicate', True)
        )
        db.session.add(new_line)
        db.session.flush()

        # 3. Gera os meses (Itens) para ESSA LINHA
        ano, mes = map(int, existing_budget.start_date.split('-'))
        data_inicial = date(ano, mes, 1)
        
        is_replicated = data.get('replicate', True)
        manual_values = data.get('manual_values', {})
        base_value = float(data.get('base_value', 0))

        for i in range(existing_budget.period_months):
            data_mes = add_months(data_inicial, i)
            valor_mes = base_value
            if not is_replicated:
                valor_mes = float(manual_values.get(str(i), base_value))
            
            item = BusinessBudgetItem(
                line_id=new_line.id,
                month_date=data_mes,
                value=valor_mes
            )
            db.session.add(item)

        db.session.commit()
        return jsonify(existing_budget.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        print(f"Erro: {e}")
        return jsonify({'error': str(e)}), 500


# DELETE AGORA PODE SER DO ORÇAMENTO INTEIRO OU DE UMA LINHA
@business_bp.route('/business/planning/<int:id>', methods=['DELETE'])
@jwt_required()
@active_user_required
def delete_budget(id):
    # Deleta o orçamento inteiro
    budget = BusinessBudget.query.filter_by(id=id, user_id=get_jwt_identity()).first()
    if budget:
        db.session.delete(budget)
        db.session.commit()
        return '', 204
    return jsonify({'error': 'Não encontrado'}), 404

@business_bp.route('/business/planning/line/<int:line_id>', methods=['DELETE'])
@jwt_required()
@active_user_required
def delete_budget_line(line_id):
    # Deleta apenas uma categoria do orçamento
    line = BusinessBudgetLine.query.get(line_id)
    if line:
        db.session.delete(line)
        db.session.commit()
        return '', 204
    return jsonify({'error': 'Não encontrado'}), 404

# EDITAR CABEÇALHO DO PLANEJAMENTO
@business_bp.route('/business/planning/<int:id>', methods=['PUT'])
@jwt_required()
@active_user_required
def update_planning_header(id):
    user_id = get_jwt_identity()
    budget = BusinessBudget.query.filter_by(id=id, user_id=user_id).first()
    if not budget: return jsonify({'error': 'Orçamento não encontrado'}), 404

    data = request.json
    # Permitimos editar apenas campos não estruturais para não quebrar os meses
    if 'name' in data: budget.name = data['name']
    if 'company_id' in data: budget.company_id = data['company_id']
    if 'category_id' in data: budget.category_id = data['category_id']
    if 'subcategory_id' in data: budget.subcategory_id = data['subcategory_id']
    
    db.session.commit()
    return jsonify(budget.to_dict()), 200

# ROTA PARA EDITAR VALOR MENSAL (ITEM)
@business_bp.route('/business/planning/item/<int:item_id>', methods=['PUT'])
@jwt_required()
@active_user_required
def update_planning_item(item_id):
    item = BusinessBudgetItem.query.get(item_id)
    if not item: return jsonify({'error': 'Não encontrado'}), 404
    
    # Validação de segurança simplificada
    # (Em produção, verificar ownership via joins)
    
    item.value = float(request.json['value'])
    db.session.commit()
    return jsonify(item.to_dict()), 200

# ==========================================
# ROTAS DE CONTAS BANCÁRIAS
# ==========================================

@business_bp.route('/business/bank-accounts', methods=['GET'])
@jwt_required()
@active_user_required
def get_bank_accounts():
    user_id = get_jwt_identity()
    accounts = BusinessBankAccount.query.filter_by(user_id=user_id).all()
    return jsonify([acc.to_dict() for acc in accounts]), 200

@business_bp.route('/business/bank-accounts', methods=['POST'])
@jwt_required()
@active_user_required
def create_bank_account():
    user_id = get_jwt_identity()
    data = request.json

    if not data.get('company_id') or not data.get('bank_name'):
        return jsonify({'error': 'Empresa e Banco são obrigatórios'}), 400

    new_account = BusinessBankAccount(
        user_id=user_id,
        company_id=data['company_id'],
        bank_name=data['bank_name'],
        account_type=data.get('account_type', 'corrente'),
        agency=data.get('agency'),
        account_number=data.get('account_number'),
        open_date=data.get('open_date'),
        notes=data.get('notes')
    )

    db.session.add(new_account)
    db.session.commit()
    return jsonify(new_account.to_dict()), 201

@business_bp.route('/business/bank-accounts/<int:id>', methods=['PUT'])
@jwt_required()
@active_user_required
def update_bank_account(id):
    user_id = get_jwt_identity()
    account = BusinessBankAccount.query.filter_by(id=id, user_id=user_id).first()
    
    if not account:
        return jsonify({'error': 'Conta não encontrada'}), 404

    data = request.json
    
    # Atualiza campos se eles vierem no JSON
    if 'company_id' in data: account.company_id = data['company_id']
    if 'bank_name' in data: account.bank_name = data['bank_name']
    if 'account_type' in data: account.account_type = data['account_type']
    if 'agency' in data: account.agency = data['agency']
    if 'account_number' in data: account.account_number = data['account_number']
    if 'open_date' in data: account.open_date = data['open_date']
    if 'notes' in data: account.notes = data['notes']

    db.session.commit()
    return jsonify(account.to_dict()), 200

@business_bp.route('/business/bank-accounts/<int:id>', methods=['DELETE'])
@jwt_required()
@active_user_required
def delete_bank_account(id):
    user_id = get_jwt_identity()
    account = BusinessBankAccount.query.filter_by(id=id, user_id=user_id).first()
    
    if not account:
        return jsonify({'error': 'Conta não encontrada'}), 404

    db.session.delete(account)
    db.session.commit()
    return '', 204

# ==========================================
# ROTAS DE CONTAS A PAGAR (PAYABLES)
# ==========================================

@business_bp.route('/business/payables', methods=['GET'])
@jwt_required()
@active_user_required
def get_payables():
    user_id = get_jwt_identity()
    # Ordena por vencimento
    payables = BusinessPayable.query.filter_by(user_id=user_id).order_by(BusinessPayable.due_date).all()
    return jsonify([p.to_dict() for p in payables]), 200

@business_bp.route('/business/payables', methods=['POST'])
@jwt_required()
@active_user_required
def create_payable():
    user_id = get_jwt_identity()
    data = request.json

    # Validação mínima
    required = ['company_id', 'stakeholder_id', 'category_id', 'value', 'due_date']
    if not all(k in data for k in required):
        return jsonify({'error': 'Campos obrigatórios faltando'}), 400

    new_payable = BusinessPayable(
        user_id=user_id,
        company_id=data['company_id'],
        stakeholder_id=data['stakeholder_id'],
        category_id=data['category_id'],
        subcategory_id=data.get('subcategory_id'),
        
        value=float(data['value']),
        due_date=data['due_date'],
        extension_date=data.get('extension_date', data['due_date']), # Se não vier, usa vencimento
        
        status=data.get('status', 'a_pagar'),
        doc_type=data.get('doc_type', 'outros'),
        nf_type=data.get('nf_type'),
        doc_number=data.get('doc_number'),
        notes=data.get('notes'),
        
        # Opcionais no cadastro inicial
        bank_account_id=data.get('bank_account_id'),
        bank_name=data.get('bank_name')
    )

    db.session.add(new_payable)
    db.session.commit()
    return jsonify(new_payable.to_dict()), 201

@business_bp.route('/business/payables/<int:id>', methods=['PUT'])
@jwt_required()
@active_user_required
def update_payable(id):
    user_id = get_jwt_identity()
    payable = BusinessPayable.query.filter_by(id=id, user_id=user_id).first()
    
    if not payable:
        return jsonify({'error': 'Conta não encontrada'}), 404

    data = request.json
    
    # Atualização dinâmica (serve tanto para edição completa quanto para a rápida do card)
    if 'status' in data: payable.status = data['status']
    if 'extension_date' in data: payable.extension_date = data['extension_date']
    if 'bank_name' in data: payable.bank_name = data['bank_name']
    if 'bank_account_id' in data: payable.bank_account_id = data['bank_account_id']
    
    # Campos do formulário completo
    if 'value' in data: payable.value = float(data['value'])
    if 'due_date' in data: payable.due_date = data['due_date']
    if 'doc_number' in data: payable.doc_number = data['doc_number']
    if 'notes' in data: payable.notes = data['notes']
    if 'category_id' in data: payable.category_id = data['category_id']
    if 'subcategory_id' in data: payable.subcategory_id = data['subcategory_id']

    db.session.commit()
    return jsonify(payable.to_dict()), 200

@business_bp.route('/business/payables/<int:id>', methods=['DELETE'])
@jwt_required()
@active_user_required
def delete_payable(id):
    user_id = get_jwt_identity()
    payable = BusinessPayable.query.filter_by(id=id, user_id=user_id).first()
    
    if not payable:
        return jsonify({'error': 'Conta não encontrada'}), 404

    db.session.delete(payable)
    db.session.commit()
    return '', 204

# ==========================================
# ROTAS DE ESTOQUE (INVENTORY)
# ==========================================

@business_bp.route('/business/inventory', methods=['GET'])
@jwt_required()
@active_user_required
def get_inventory():
    user_id = get_jwt_identity()
    products = InventoryProduct.query.filter_by(user_id=user_id).order_by(InventoryProduct.name).all()
    return jsonify([p.to_dict() for p in products]), 200

@business_bp.route('/business/inventory', methods=['POST'])
@jwt_required()
@active_user_required
def create_product():
    user_id = get_jwt_identity()
    data = request.json

    if not data.get('name') or not data.get('sku'):
        return jsonify({'error': 'Nome e SKU são obrigatórios'}), 400

    new_prod = InventoryProduct(
        user_id=user_id,
        name=data['name'],
        sku=data['sku'],
        category_id=data.get('category_id'),
        unit=data.get('unit', 'UN'),
        min_stock=float(data.get('min_stock', 5)),
        cost_price=float(data.get('cost_price', 0)),
        sale_price=float(data.get('sale_price', 0)),
        description=data.get('description'),
        current_stock=0 # Produto nasce com 0, precisa de entrada via movimento
    )

    db.session.add(new_prod)
    db.session.commit()
    return jsonify(new_prod.to_dict()), 201

@business_bp.route('/business/inventory/<int:id>', methods=['PUT'])
@jwt_required()
@active_user_required
def update_product(id):
    user_id = get_jwt_identity()
    prod = InventoryProduct.query.filter_by(id=id, user_id=user_id).first()
    if not prod: return jsonify({'error': 'Produto não encontrado'}), 404

    data = request.json
    if 'name' in data: prod.name = data['name']
    if 'sku' in data: prod.sku = data['sku']
    if 'category_id' in data: prod.category_id = data['category_id']
    if 'unit' in data: prod.unit = data['unit']
    if 'min_stock' in data: prod.min_stock = float(data['min_stock'])
    if 'cost_price' in data: prod.cost_price = float(data['cost_price'])
    if 'sale_price' in data: prod.sale_price = float(data['sale_price'])
    if 'description' in data: prod.description = data['description']

    db.session.commit()
    return jsonify(prod.to_dict()), 200

@business_bp.route('/business/inventory/<int:id>', methods=['DELETE'])
@jwt_required()
@active_user_required
def delete_product(id):
    user_id = get_jwt_identity()
    prod = InventoryProduct.query.filter_by(id=id, user_id=user_id).first()
    if not prod: return jsonify({'error': 'Produto não encontrado'}), 404

    db.session.delete(prod)
    db.session.commit()
    return '', 204

# --- ROTA ESPECIAL DE MOVIMENTAÇÃO (ENTRADA/SAÍDA) ---
@business_bp.route('/business/inventory/movement', methods=['POST'])
@jwt_required()
@active_user_required
def stock_movement():
    user_id = get_jwt_identity()
    data = request.json
    
    prod_id = data.get('product_id')
    move_type = data.get('type') # 'entrada' ou 'saida'
    qty = float(data.get('quantity', 0))
    
    if qty <= 0: return jsonify({'error': 'Quantidade deve ser maior que zero'}), 400

    prod = InventoryProduct.query.filter_by(id=prod_id, user_id=user_id).first()
    if not prod: return jsonify({'error': 'Produto não encontrado'}), 404

    # 1. Registra o Movimento (Histórico)
    movement = InventoryMovement(
        user_id=user_id,
        product_id=prod.id,
        type=move_type,
        quantity=qty,
        reason=data.get('reason', 'ajuste')
    )
    db.session.add(movement)

    # 2. Atualiza o Saldo do Produto
    if move_type == 'entrada':
        prod.current_stock += qty
    elif move_type == 'saida':
        # (Opcional) Bloquear saldo negativo:
        # if prod.current_stock < qty: return jsonify({'error': 'Saldo insuficiente'}), 400
        prod.current_stock -= qty

    db.session.commit()
    return jsonify({'new_stock': prod.current_stock}), 200

# ==========================================
# ROTAS DE VENDAS E RECEBÍVEIS
# ==========================================

# 1. Listar Histórico de Vendas (Resumo)
@business_bp.route('/business/sales', methods=['GET'])
@jwt_required()
@active_user_required
def get_sales():
    user_id = get_jwt_identity()
    sales = BusinessSale.query.filter_by(user_id=user_id).order_by(BusinessSale.created_at.desc()).limit(50).all()
    return jsonify([s.to_dict() for s in sales]), 200

# 2. Listar Contas a Receber (Parcelas)
@business_bp.route('/business/receivables', methods=['GET'])
@jwt_required()
@active_user_required
def get_receivables():
    user_id = get_jwt_identity()
    # Ordena por vencimento
    receivables = BusinessReceivable.query.filter_by(user_id=user_id).order_by(BusinessReceivable.due_date).all()
    return jsonify([r.to_dict() for r in receivables]), 200

# 3. CRIAR NOVA VENDA (O GRANDE POS)
@business_bp.route('/business/sales', methods=['POST'])
@jwt_required()
@active_user_required
def create_sale():
    user_id = get_jwt_identity()
    data = request.json

    # Validações Básicas
    if not data.get('company_id') or not data.get('client_id') or not data.get('total_value'):
        return jsonify({'error': 'Dados incompletos'}), 400

    # A. Cria a Venda (Cabeçalho)
    new_sale = BusinessSale(
        user_id=user_id,
        company_id=data['company_id'],
        client_id=data['client_id'],
        product_id=data.get('product_id'),
        quantity=float(data.get('quantity', 1)),
        total_value=float(data['total_value']),
        payment_terms=data.get('payment_terms', 'vista'),
        payment_method=data.get('payment_method', 'pix'),
        doc_nf=data.get('doc_nf'),
        apply_penalty=data.get('apply_penalty', False),
        fine_percent=float(data.get('fine_percent', 0)),
        interest_percent=float(data.get('interest_percent', 0)),
        notes=data.get('notes')
    )
    db.session.add(new_sale)
    db.session.flush() # Gera o ID da venda para usar nas parcelas

    # B. Baixa de Estoque (Opcional)
    if data.get('product_id') and new_sale.product_id:
        prod = InventoryProduct.query.get(new_sale.product_id)
        if prod:
            # Registra movimento de saída
            move = InventoryMovement(
                user_id=user_id,
                product_id=prod.id,
                type='saida',
                quantity=new_sale.quantity,
                reason='venda'
            )
            prod.current_stock -= new_sale.quantity
            db.session.add(move)

    # C. Gerar Parcelas (Recebíveis)
    installments = int(data.get('installment_count', 1))
    periodicity = data.get('periodicity', 'mensal')
    first_date = datetime.strptime(data.get('first_due_date'), '%Y-%m-%d')
    installment_value = new_sale.total_value / installments

    for i in range(installments):
        # Calcula data
        due_date = first_date
        if i > 0:
            if periodicity == 'mensal':
                due_date = first_date + relativedelta(months=i)
            elif periodicity == 'quinzenal':
                due_date = first_date + timedelta(days=15*i)
            elif periodicity == 'semanal':
                due_date = first_date + timedelta(days=7*i)
            elif periodicity == 'anual':
                due_date = first_date + relativedelta(years=i)
            elif periodicity == 'semestral':
                due_date = first_date + relativedelta(months=6*i)

        receivable = BusinessReceivable(
            user_id=user_id,
            sale_id=new_sale.id,
            company_id=new_sale.company_id,
            client_id=new_sale.client_id,
            installment_number=i+1,
            total_installments=installments,
            value=installment_value,
            due_date=due_date.strftime('%Y-%m-%d'),
            status=data.get('status', 'a_receber') # Se for a vista e recebido, já nasce pago
        )
        db.session.add(receivable)

    db.session.commit()
    return jsonify({'message': 'Venda registrada com sucesso'}), 201

# 4. Atualizar Recebível (Baixa ou Data)
@business_bp.route('/business/receivables/<int:id>', methods=['PUT'])
@jwt_required()
@active_user_required
def update_receivable(id):
    user_id = get_jwt_identity()
    rec = BusinessReceivable.query.filter_by(id=id, user_id=user_id).first()
    if not rec: return jsonify({'error': 'Conta não encontrada'}), 404

    data = request.json
    if 'status' in data: rec.status = data['status']
    if 'due_date' in data: rec.due_date = data['due_date']

    db.session.commit()
    return jsonify(rec.to_dict()), 200