from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.db import db
from src.models.business import Stakeholder, Company, BusinessCategory, BusinessBudget, BusinessBudgetItem
from datetime import date, timedelta
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
def create_planning():
    user_id = get_jwt_identity()
    data = request.json

    # 1. Validação Básica
    required = ['name', 'company_id', 'category_id', 'start_date', 'period_months']
    if not all(k in data for k in required):
        return jsonify({'error': 'Dados incompletos'}), 400

    try:
        # 2. Cria o Cabeçalho do Planejamento
        new_budget = BusinessBudget(
            user_id=user_id,
            company_id=data['company_id'],
            name=data['name'],
            category_id=data['category_id'],
            subcategory_id=data.get('subcategory_id'),
            start_date=data['start_date'],
            period_months=int(data['period_months']),
            base_value=float(data.get('base_value', 0)),
            is_replicated=data.get('replicate', True)
        )
        
        db.session.add(new_budget)
        db.session.flush() # Gera o ID do budget antes de commit

        # 3. Geração dos Itens Mensais (A Mágica)
        # Converte '2026-01' para data real -> 2026-01-01
        ano, mes = map(int, data['start_date'].split('-'))
        data_inicial = date(ano, mes, 1)
        
        is_replicated = data.get('replicate', True)
        manual_values = data.get('manual_values', {}) # { "0": 100, "1": 150 }
        base_value = float(data.get('base_value', 0))

        for i in range(int(data['period_months'])):
            # Calcula a data do mês atual do loop
            data_mes = add_months(data_inicial, i)
            
            # Decide o valor
            valor_mes = base_value
            if not is_replicated:
                # Se não for replicado, tenta pegar do objeto manual, senão usa base
                valor_mes = float(manual_values.get(str(i), base_value))
            
            # Cria o item no banco
            item = BusinessBudgetItem(
                budget_id=new_budget.id,
                month_date=data_mes,
                value=valor_mes
            )
            db.session.add(item)

        db.session.commit()
        return jsonify(new_budget.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao criar planejamento: {e}")
        return jsonify({'error': 'Erro interno ao processar planejamento'}), 500

@business_bp.route('/business/planning/<int:id>', methods=['DELETE'])
@jwt_required()
@active_user_required
def delete_planning(id):
    user_id = get_jwt_identity()
    budget = BusinessBudget.query.filter_by(id=id, user_id=user_id).first()
    if not budget: return jsonify({'error': 'Não encontrado'}), 404
    
    db.session.delete(budget)
    db.session.commit()
    return '', 204