from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.pluggy_service import PluggyService
from src.models.db import db
from src.services.gemini_service import categorize_transaction
from src.models.extended_modules import CreditCard, CreditCardTransaction, Fatura
from src.models.financial import Category
from datetime import datetime, timedelta
from sqlalchemy import func

pluggy_bp = Blueprint('pluggy', __name__)
pluggy_service = PluggyService()

def get_or_create_fatura(user_id, card, transaction_date):
    """
    Determina a fatura correta com base na data da compra e no dia de fechamento.
    Cria a fatura se não existir.
    """
    # 1. Determinar Mês e Ano de Referência da Fatura
    # Se a compra foi feita DEPOIS do fechamento, ela vai para o mês seguinte.
    # Ex: Fechamento dia 25. Compra dia 26/01 -> Fatura de Fevereiro.
    
    data_compra = transaction_date
    if data_compra.day >= card.closing_day:
        # Avança para o primeiro dia do próximo mês
        if data_compra.month == 12:
            mes_ref = 1
            ano_ref = data_compra.year + 1
        else:
            mes_ref = data_compra.month + 1
            ano_ref = data_compra.year
    else:
        mes_ref = data_compra.month
        ano_ref = data_compra.year

    # 2. Tentar encontrar essa fatura no banco
    fatura = Fatura.query.filter_by(
        cartao_id=card.id, 
        mes=mes_ref, 
        ano=ano_ref
    ).first()

    # 3. Se não existe, cria
    if not fatura:
        # Calcula data de vencimento (Dia 'due_day' do mês de referência)
        try:
            data_vencimento = datetime(ano_ref, mes_ref, card.due_day).date()
        except ValueError:
            # Caso o dia de vencimento seja 31 e o mês só tenha 30, ajusta para o último dia
            import calendar
            last_day = calendar.monthrange(ano_ref, mes_ref)[1]
            data_vencimento = datetime(ano_ref, mes_ref, min(card.due_day, last_day)).date()

        fatura = Fatura(
            user_id=user_id,
            cartao_id=card.id,
            valor_total=0.0,
            mes=mes_ref,
            ano=ano_ref,
            status='em_aberto',
            created_at=datetime.utcnow()
            # data_vencimento não estava no seu model original, 
            # mas o frontend calcula baseado em mes/ano/due_day
        )
        db.session.add(fatura)
        db.session.commit() # Comita para ter o ID
        print(f"📄 Nova fatura criada: {mes_ref}/{ano_ref} para cartão {card.name}")

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
        accounts = pluggy_service.fetch_accounts(item_id)
        
        contas_processadas = 0
        transacoes_processadas = 0

        for acc in accounts:
            print(f"🔎 Analisando conta: {acc['name']} | Tipo: {acc['type']}")
            
            # Aceita CREDIT ou CREDIT_CARD
            if acc['type'] not in ['CREDIT', 'CREDIT_CARD']:
                continue

            # --- 1. Sincronizar Cartão ---
            cartao = CreditCard.query.filter_by(pluggy_credit_card_id=acc['id']).first()

            if not cartao:
                print(f"🆕 Criando novo cartão: {acc['name']}")
                cartao = CreditCard(
                    user_id=user_id,
                    name=f"{acc['name']} (Auto)",
                    limit=acc.get('creditData', {}).get('creditLimit', 10000),
                    available_limit=acc.get('creditData', {}).get('availableCreditLimit', 0),
                    brand=acc.get('creditData', {}).get('brand', 'Outro'),
                    closing_day=25, # Padrão: fecha dia 25
                    due_day=5,      # Padrão: vence dia 5
                    last_digits=acc.get('number', '0000')[-4:],
                    pluggy_item_id=item_id,
                    pluggy_credit_card_id=acc['id']
                )
                db.session.add(cartao)
                db.session.commit()
            else:
                # Atualiza limite disponível se já existe
                cartao.available_limit = acc.get('creditData', {}).get('availableCreditLimit', cartao.available_limit)
            
            contas_processadas += 1

            # --- 2. Sincronizar Transações ---
            transactions = pluggy_service.fetch_transactions(acc['id'])
            
            # --- INTEGRAÇÃO COM IA ---
            # 1. Carrega todas as categorias disponíveis para a IA escolher
            all_categories = [{'id': c.id, 'name': c.name} for c in Category.query.all()]
            default_category = Category.query.filter_by(name='Outros').first()
            default_id = default_category.id if default_category else 1
            
            # 2. Pergunta para o Gemini qual a categoria dessa transação
            cat_id = categorize_transaction(tx.get('description'), all_categories)
            
            # 3. Se a IA falhar ou devolver nada, usa o padrão "Outros"
            if not cat_id:
                cat_id = default_id
            # -------------------------

            faturas_afetadas = set()

            for tx in transactions:
                # Se já existe, pula
                existe = CreditCardTransaction.query.filter_by(pluggy_transaction_id=tx['id']).first()
                if existe:
                    continue

                # Parse da data
                data_tx = datetime.strptime(tx['date'], "%Y-%m-%dT%H:%M:%S.%fZ").date()
                valor = abs(tx.get('amount', 0))

                # Encontra ou cria a fatura correta para essa data
                fatura = get_or_create_fatura(user_id, cartao, data_tx)
                faturas_afetadas.add(fatura.id)

                nova_tx = CreditCardTransaction(
                    user_id=user_id,
                    credit_card_id=cartao.id,
                    fatura_id=fatura.id, # VINCULA À FATURA
                    category_id=cat_id, 
                    description=tx.get('description', 'Compra'),
                    value=valor,
                    date=data_tx,
                    pluggy_transaction_id=tx['id']
                )
                db.session.add(nova_tx)
                transacoes_processadas += 1
            
            db.session.commit() # Salva as transações

            # --- 3. Atualizar Totais das Faturas ---
            # Recalcula o valor total de cada fatura que teve transação nova
            for fat_id in faturas_afetadas:
                fatura_obj = Fatura.query.get(fat_id)
                if fatura_obj:
                    # Soma todas as transações dessa fatura
                    total = db.session.query(func.sum(CreditCardTransaction.value))\
                        .filter_by(fatura_id=fat_id).scalar() or 0.0
                    fatura_obj.valor_total = total
                    db.session.add(fatura_obj)

        db.session.commit() # Salva atualizações de fatura
        
        return jsonify({
            'message': 'Sincronização concluída!',
            'cartoes': contas_processadas,
            'transacoes': transacoes_processadas
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Erro na sincronização: {e}")
        return jsonify({'error': str(e)}), 500