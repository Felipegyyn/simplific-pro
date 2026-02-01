from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.contact import Contact
from src.models.db import db
from src.services.user_service import normalize_phone_number
from src.routes.user import active_user_required

contacts_bp = Blueprint('contacts', __name__)

@contacts_bp.route('/', methods=['GET'])
@jwt_required()
@active_user_required
def get_contacts():
    """Lista todos os contatos do usuário logado"""
    user_id = get_jwt_identity()
    contacts = Contact.query.filter_by(user_id=user_id).order_by(Contact.name).all()
    return jsonify([c.to_dict() for c in contacts]), 200

@contacts_bp.route('/', methods=['POST'])
@jwt_required()
@active_user_required
def create_contact():
    """Cria um novo contato"""
    user_id = get_jwt_identity()
    data = request.get_json()

    name = data.get('name')
    email = data.get('email')
    whatsapp = data.get('whatsapp')

    if not name:
        return jsonify({'error': 'O nome do contato é obrigatório.'}), 400

    # Normaliza o telefone se houver
    whatsapp_norm = normalize_phone_number(whatsapp) if whatsapp else None

    # Verifica duplicidade (opcional: evitar mesmo nome exato)
    existing = Contact.query.filter_by(user_id=user_id, name=name).first()
    if existing:
        return jsonify({'error': f"Você já tem um contato chamado '{name}'."}), 400

    new_contact = Contact(
        user_id=user_id,
        name=name,
        email=email,
        whatsapp=whatsapp_norm
    )

    db.session.add(new_contact)
    db.session.commit()

    return jsonify(new_contact.to_dict()), 201

@contacts_bp.route('/<int:contact_id>', methods=['PUT'])
@jwt_required()
@active_user_required
def update_contact(contact_id):
    """Edita um contato existente"""
    user_id = get_jwt_identity()
    contact = Contact.query.filter_by(id=contact_id, user_id=user_id).first()

    if not contact:
        return jsonify({'error': 'Contato não encontrado.'}), 404

    data = request.get_json()
    
    if 'name' in data: contact.name = data['name']
    if 'email' in data: contact.email = data['email']
    if 'whatsapp' in data: 
        contact.whatsapp = normalize_phone_number(data['whatsapp']) if data['whatsapp'] else None

    db.session.commit()
    return jsonify(contact.to_dict()), 200

@contacts_bp.route('/<int:contact_id>', methods=['DELETE'])
@jwt_required()
@active_user_required
def delete_contact(contact_id):
    """Remove um contato"""
    user_id = get_jwt_identity()
    contact = Contact.query.filter_by(id=contact_id, user_id=user_id).first()

    if not contact:
        return jsonify({'error': 'Contato não encontrado.'}), 404

    db.session.delete(contact)
    db.session.commit()
    return jsonify({'message': 'Contato removido com sucesso.'}), 200