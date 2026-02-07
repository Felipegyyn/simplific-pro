from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.db import db
from src.models.extended_modules import BankAccount
from src.routes.user import active_user_required

bank_accounts_bp = Blueprint('bank_accounts', __name__)

# 1. Listar Contas
@bank_accounts_bp.route('/bank-accounts', methods=['GET'])
@jwt_required()
@active_user_required
def get_accounts():
    user_id = get_jwt_identity()
    accounts = BankAccount.query.filter_by(user_id=user_id, is_active=True).all()
    return jsonify([acc.to_dict() for acc in accounts]), 200

# 2. Criar Conta
@bank_accounts_bp.route('/bank-accounts', methods=['POST'])
@jwt_required()
@active_user_required
def create_account():
    user_id = get_jwt_identity()
    data = request.json
    
    if not data.get('bank_name') or not data.get('account_number'):
        return jsonify({'error': 'Banco e Conta são obrigatórios'}), 400

    try:
        saldo_inicial = float(data.get('balance', 0.0))
    except:
        saldo_inicial = 0.0

    new_account = BankAccount(
        user_id=user_id,
        bank_name=data['bank_name'],
        agency=data.get('agency', ''),
        account_number=data['account_number'],
        initial_balance=saldo_inicial,
        current_balance=saldo_inicial, # Ao criar, o saldo atual é igual ao inicial
        observations=data.get('observations', '')
    )

    db.session.add(new_account)
    db.session.commit()

    return jsonify(new_account.to_dict()), 201

# 3. Excluir Conta (Soft Delete)
@bank_accounts_bp.route('/bank-accounts/<int:account_id>', methods=['DELETE'])
@jwt_required()
@active_user_required
def delete_account(account_id):
    user_id = get_jwt_identity()
    account = BankAccount.query.filter_by(id=account_id, user_id=user_id).first()

    if not account:
        return jsonify({'error': 'Conta não encontrada'}), 404

    # Em vez de apagar do banco, apenas inativamos para manter histórico
    account.is_active = False 
    db.session.commit()

    return jsonify({'message': 'Conta excluída com sucesso'}), 200

# ▼▼▼ NOVA ROTA DE EDIÇÃO ▼▼▼
@bank_accounts_bp.route('/bank-accounts/<int:account_id>', methods=['PUT'])
@jwt_required()
@active_user_required
def update_account(account_id):
    user_id = get_jwt_identity()
    account = BankAccount.query.filter_by(id=account_id, user_id=user_id).first()

    if not account:
        return jsonify({'error': 'Conta não encontrada'}), 404

    data = request.json

    if 'bank_name' in data:
        account.bank_name = data['bank_name']
    if 'agency' in data:
        account.agency = data['agency']
    if 'account_number' in data:
        account.account_number = data['account_number']
    if 'observations' in data:
        account.observations = data['observations']
    
    # Nota: Não permitimos editar o saldo diretamente aqui para não quebrar 
    # o histórico de transações. O saldo deve ser ajustado via lançamentos.

    db.session.commit()
    return jsonify(account.to_dict()), 200