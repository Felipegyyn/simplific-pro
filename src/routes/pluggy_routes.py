from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.pluggy_service import PluggyService
from src.models.db import db
from src.models.extended_modules import CreditCard, CreditCardTransaction
from src.models.financial import Category
from datetime import datetime

pluggy_bp = Blueprint('pluggy', __name__)
pluggy_service = PluggyService()

@pluggy_bp.route('/create-token', methods=['POST'])
@jwt_required()
def create_token():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        item_id = data.get('itemId')
        token = pluggy_service.create_connect_token(item_id)
        return jsonify({'accessToken': token}), 200
    except Exception as e:
        print(f"Erro create-token: {e}")
        return jsonify({'error': str(e)}), 500

@pluggy_bp.route('/sync', methods=['POST'])
@jwt_required()
def sync_data():
    """
    Rota principal: Recebe o ID da Conexão (Item ID) e baixa tudo.
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    item_id = data.get('itemId')

    if not item_id:
        return jsonify({'error': 'Item ID é obrigatório'}), 400

    try:
        print(f"🔄 Iniciando sincronização para Item: {item_id}")
        
        # 1. Buscar contas (Cartões) na Pluggy
        accounts = pluggy_service.fetch_accounts(item_id)
        
        contas_processadas = 0
        transacoes_processadas = 0

        for acc in accounts:
            # Só nos interessa se for cartão de crédito
            print(f"🔎 Analisando conta: {acc['name']} | Tipo: {acc['type']}") # Log para debug

            # Aceita tanto 'CREDIT' quanto 'CREDIT_CARD' para garantir
            if acc['type'] not in ['CREDIT', 'CREDIT_CARD']:
                continue

            # 2. Verificar se o cartão já existe no nosso banco (pelo ID da Pluggy)
            cartao = CreditCard.query.filter_by(pluggy_credit_card_id=acc['id']).first()

            if not cartao:
                # Se não existe, cria um novo
                print(f"🆕 Criando novo cartão: {acc['name']}")
                cartao = CreditCard(
                    user_id=user_id,
                    name=f"{acc['name']} (Auto)",
                    limit=acc.get('creditData', {}).get('creditLimit', 0),
                    available_limit=acc.get('creditData', {}).get('availableCreditLimit', 0),
                    brand=acc.get('creditData', {}).get('brand', 'Outro'),
                    closing_day=1, # Padrão provisório
                    due_day=10,    # Padrão provisório
                    last_digits=acc.get('number', '0000')[-4:],
                    pluggy_item_id=item_id,
                    pluggy_credit_card_id=acc['id']
                )
                db.session.add(cartao)
                db.session.commit() # Comita para gerar o ID do cartão
            
            contas_processadas += 1

            # 3. Buscar transações desse cartão
            transactions = pluggy_service.fetch_transactions(acc['id'])
            
            # Categoria "Outros" para transações sem categoria definida (ID 8 ou ajuste conforme seu banco)
            default_category = Category.query.filter_by(name='Outros').first()
            cat_id = default_category.id if default_category else 1

            for tx in transactions:
                # Evita duplicidade: Checa se o ID da transação Pluggy já existe
                existe = CreditCardTransaction.query.filter_by(pluggy_transaction_id=tx['id']).first()
                if existe:
                    continue

                # Cria a transação
                nova_tx = CreditCardTransaction(
                    user_id=user_id,
                    credit_card_id=cartao.id,
                    category_id=cat_id, # Futuramente podemos mapear a categoria da Pluggy
                    description=tx.get('description', 'Compra'),
                    value=abs(tx.get('amount', 0)), # Pluggy manda negativo para gastos, convertemos
                    date=datetime.strptime(tx['date'], "%Y-%m-%dT%H:%M:%S.%fZ").date(),
                    pluggy_transaction_id=tx['id']
                )
                db.session.add(nova_tx)
                transacoes_processadas += 1

        db.session.commit()
        return jsonify({
            'message': 'Sincronização concluída!',
            'cartoes': contas_processadas,
            'transacoes': transacoes_processadas
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Erro na sincronização: {e}")
        return jsonify({'error': str(e)}), 500