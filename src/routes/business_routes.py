from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.db import db
from src.models.business import Stakeholder, Company
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