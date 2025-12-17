from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.pluggy_service import PluggyService
from src.models.db import db
from src.models.extended_modules import CreditCard, CreditCardTransaction, Fatura
from src.models.financial import Category
from src.services.gemini_service import categorize_transaction
from datetime import datetime
from sqlalchemy import func

pluggy_bp = Blueprint('pluggy', __name__)
pluggy_service = PluggyService()

def get_or_create_fatura(user_id, card, transaction_date):
    """
    Determina a fatura correta e define status (aberta vs paga).
    """
    data_compra = transaction_date
    
    # 1. Lógica do Mês de Referência
    if data_compra.day >= card.closing_day:
        if data_compra.month == 12:
            mes_ref = 1
            ano_ref = data_compra.year + 1
        else:
            mes_ref = data_compra.month + 1
            ano_ref = data_compra.year
    else:
        mes_ref = data_compra.month
        ano_ref = data_compra.year

    # 2. Busca Fatura Existente
    fatura = Fatura.query.filter_by(
        cartao_id=card.id, 
        mes=mes_ref, 
        ano=ano_ref
    ).first()

    if not fatura:
        import calendar
        last_day = calendar.monthrange(ano_ref, mes_ref)[1]
        dia_vencimento = min(card.due_day, last_day)
        try:
            data_vencimento = datetime(ano_ref, mes_ref, dia_vencimento).date()
        except ValueError:
            data_vencimento = datetime(ano_ref, mes_ref, last_day).date()

        # 3. Lógica do Status
        hoje = datetime.utcnow().date()
        if (ano_ref < hoje.year) or (ano_ref == hoje.year and mes_ref < hoje.month):
            status_inicial = 'paga'
        else:
            status_inicial = 'aberta'

        fatura = Fatura(
            user_id=user_id,
            cartao_id=card.id,
            valor_total=0.0,
            mes=mes_ref,
            ano=ano_ref,
            status=status_inicial,
            created_at=datetime.utcnow()
        )
        db.session.add(fatura)
        db.session.commit()
        print(f"📄 Nova fatura criada: {mes_ref}/{ano_ref} - Status: {status_inicial}")

    return fatura

@pluggy_bp.route('/create-token', methods=['POST'])
@jwt_required()
def create_token():
    try:
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
    user_id = get_jwt_identity()
    data = request.get_json()
    item_id = data.get('itemId')

    if not item_id:
        return jsonify({'error': 'Item ID é obrigatório'}), 400

    try:
        print(f"🔄 Iniciando sincronização para Item: {item_id}")
        
        # Busca detalhes para o nome do banco
        try:
            item_details = pluggy_service.fetch_item(item_id)
            bank_name = item_details.get('connector', {}).get('name', '')
        except:
            bank_name = ""

        accounts = pluggy_service.fetch_accounts(item_id)
        
        contas_processadas = 0
        transacoes_processadas = 0

        # Carrega categorias
        all_categories = [{'id': c.id, 'name': c.name} for c in Category.query.all()]
        default_category = Category.query.filter_by(name='Outros').first()
        default_id = default_category.id if default_category else 1

        # LISTA NEGRA: Palavras que indicam pagamento de fatura (Crédito)
        termos_pagamento = [
            'pagamento recebido', 
            'payment received', 
            'obrigado pelo',
            'pagamento de fatura', 
            'crédito de fatura',
            'pagto fatura'
        ]

        for acc in accounts:
            print(f"🔎 Analisando conta: {acc['name']} | Tipo: {acc['type']}")
            
            if acc['type'] not in ['CREDIT', 'CREDIT_CARD']:
                continue

            # Nome Bonito
            raw_name = acc['name']
            if bank_name and bank_name.lower() not in raw_name.lower():
                final_name = f"{bank_name} - {raw_name}"
            else:
                final_name = raw_name

            # 1. Cartão
            cartao = CreditCard.query.filter_by(pluggy_credit_card_id=acc['id']).first()

            if not cartao:
                print(f"🆕 Criando novo cartão: {final_name}")
                cartao = CreditCard(
                    user_id=user_id,
                    name=final_name, 
                    limit=acc.get('creditData', {}).get('creditLimit', 0),
                    available_limit=acc.get('creditData', {}).get('availableCreditLimit', 0),
                    brand=acc.get('creditData', {}).get('brand', 'Outro'),
                    closing_day=25, 
                    due_day=5,      
                    last_digits=acc.get('number', '0000')[-4:],
                    pluggy_item_id=item_id,
                    pluggy_credit_card_id=acc['id']
                )
                db.session.add(cartao)
                db.session.commit()
            else:
                cartao.name = final_name 
                cartao.available_limit = acc.get('creditData', {}).get('availableCreditLimit', cartao.available_limit)
                db.session.add(cartao)
            
            contas_processadas += 1

            # 2. Transações
            transactions = pluggy_service.fetch_transactions(acc['id'])
            faturas_afetadas = set()
            
            ia_usage_count = 0 
            MAX_IA_CALLS = 5 

            for tx in transactions:
                # Verifica duplicidade
                existe = CreditCardTransaction.query.filter_by(pluggy_transaction_id=tx['id']).first()
                if existe:
                    continue

                descricao = tx.get('description', 'Compra')
                descricao_lower = descricao.lower()

                # --- FILTRO DE PAGAMENTOS (AQUI ESTÁ A MÁGICA 🛡️) ---
                # Se encontrar qualquer termo de pagamento na descrição, PULA essa transação
                eh_pagamento = any(termo in descricao_lower for termo in termos_pagamento)
                if eh_pagamento:
                    print(f"🚫 Ignorando pagamento detectado: {descricao}")
                    continue
                # --------------------------------------------------------

                # Performance IA
                if ia_usage_count < MAX_IA_CALLS:
                    cat_id = categorize_transaction(descricao, all_categories)
                    if cat_id:
                        ia_usage_count += 1
                    else:
                        cat_id = default_id
                else:
                    cat_id = default_id
                
                data_tx = datetime.strptime(tx['date'], "%Y-%m-%dT%H:%M:%S.%fZ").date()
                valor = abs(tx.get('amount', 0))

                fatura = get_or_create_fatura(user_id, cartao, data_tx)
                faturas_afetadas.add(fatura.id)

                nova_tx = CreditCardTransaction(
                    user_id=user_id,
                    credit_card_id=cartao.id,
                    fatura_id=fatura.id,
                    category_id=cat_id, 
                    description=descricao,
                    value=valor,
                    date=data_tx,
                    pluggy_transaction_id=tx['id']
                )
                db.session.add(nova_tx)
                transacoes_processadas += 1
            
            db.session.commit() 

            # 3. Atualizar Totais das Faturas
            for fat_id in faturas_afetadas:
                fatura_obj = Fatura.query.get(fat_id)
                if fatura_obj:
                    total = db.session.query(func.sum(CreditCardTransaction.value))\
                        .filter_by(fatura_id=fat_id).scalar() or 0.0
                    fatura_obj.valor_total = total
                    db.session.add(fatura_obj)

        db.session.commit()
        
        return jsonify({
            'message': 'Sincronização concluída!',
            'cartoes': contas_processadas,
            'transacoes': transacoes_processadas
        }), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        print(f"❌ Erro na sincronização: {e}")
        return jsonify({'error': str(e)}), 500