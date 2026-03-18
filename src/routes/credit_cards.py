from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.db import db
from src.models.extended_modules import CreditCard, Fatura # <-- ADICIONE 'Fatura'
from src.models.extended_modules import CreditCardTransaction
from src.routes.user import active_user_required
from src.models.extended_modules import CreditCard
from src.services.credit_card_service import process_card_payment
from datetime import datetime, date, timedelta
from decimal import Decimal
from src.models.extended_modules import CreditCardTransaction

# ▼▼▼ ADICIONE ESTA FUNÇÃO AUXILIAR AQUI ▼▼▼
def _get_or_create_fatura(user_id, card_id, mes, ano):
    """
    Busca uma fatura aberta para um cartão/mês/ano. Se não existir, cria uma nova.
    """
    fatura = Fatura.query.filter_by(
        user_id=user_id,
        cartao_id=card_id,
        mes=mes,
        ano=ano,
        status='aberta'
    ).first()

    if not fatura:
        fatura = Fatura(
            user_id=user_id,
            cartao_id=card_id,
            mes=mes,
            ano=ano,
            valor_total=0,
            status='aberta'
        )
        db.session.add(fatura)
        db.session.flush() # Garante que a fatura tenha um ID antes de usá-la
    
    return fatura
# ▲▲▲ FIM DA FUNÇÃO AUXILIAR ▲▲▲

credit_cards_bp = Blueprint('credit_cards', __name__)

@credit_cards_bp.route('/credit-cards', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_credit_cards():
    user_id = get_jwt_identity()
    cards = CreditCard.query.filter_by(user_id=user_id, is_active=True).all()

    # Lista para armazenar os dados dos cartões para a resposta
    cards_list = []
    for card in cards:
        card_data = {
            "id": card.id,
            "name": card.name,
            "brand": card.brand,
            "limit": card.limit,
            "available_limit": card.available_limit,
            "due_day": card.due_day,

            # --- AJUSTE PRINCIPAL ADICIONADO AQUI ---
            # Criamos um novo campo "last_digits" com os 4 últimos dígitos
            "last_digits": card.card_number[-4:] if card.card_number else "0000"
        }
        cards_list.append(card_data)

    return jsonify(cards_list)

@credit_cards_bp.route('/credit-cards', methods=['POST'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def create_credit_card():
    user_id = get_jwt_identity()
    data = request.json

    name = data.get('name')
    limit = data.get('limit')

    if not name or limit is None:
        return jsonify({'error': 'Nome e limite são obrigatórios'}), 400

    card_number = data.get('card_number')
    last_digits = card_number[-4:] if card_number and len(card_number) >= 4 else None
    
    card = CreditCard(
        user_id=user_id,
        name=name,
        brand=data.get('brand'),
        limit=limit,
        available_limit=limit,
        closing_day=1,
        due_day=data.get('due_day'),
        card_number=card_number,
        last_digits=last_digits
    )

    db.session.add(card)
    db.session.commit()

    return jsonify(card.to_dict()), 201

@credit_cards_bp.route('/credit-cards/<int:card_id>', methods=['PUT'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def update_credit_card(card_id):
    user_id = get_jwt_identity()
    
    # Busca o cartão garantindo que ele pertence ao usuário logado.
    # Esta é a principal verificação de segurança.
    card = CreditCard.query.filter_by(id=card_id, user_id=user_id).first()

    if not card:
        return jsonify({'error': 'Cartão não encontrado ou não pertence ao usuário'}), 404

    data = request.json

    # Atualiza os campos do objeto 'card' com os dados recebidos.
    # Usar data.get(..., card.field) mantém o valor antigo se um novo não for enviado.
    card.name = data.get('nome', card.name)
    card.limit = data.get('limite', card.limit)
    card.brand = data.get('bandeira', card.brand)
    card.due_day = data.get('due_day', card.due_day)
    
    # Opcional: Adicionar validações de dados aqui, se necessário.

    # Salva as alterações no banco de dados
    db.session.commit()

    # Retorna o objeto do cartão atualizado com o status 200 (OK)
    return jsonify(card.to_dict()), 200

@credit_cards_bp.route('/credit-cards/<int:card_id>', methods=['DELETE'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def delete_credit_card(card_id):
    user_id = get_jwt_identity()
    card = CreditCard.query.filter_by(id=card_id, user_id=user_id).first()

    if not card:
        return jsonify({'error': 'Cartão não encontrado'}), 404

    card.is_active = False
    db.session.commit()

    return '', 204


# NOVA VERSÃO - REESTABELECE O LIMITE DO CARTÃO
@credit_cards_bp.route('/credit-cards/<int:card_id>/pay-bill', methods=['PUT'])
@jwt_required()
@active_user_required
def pay_credit_card_bill(card_id):
    user_id = get_jwt_identity()
    
    # Usar 'from' aqui dentro é ok para evitar importação circular se necessário
    from src.models.extended_modules import Fatura, CreditCard

    # 1. Busca a fatura EM ABERTO
    fatura = Fatura.query.filter_by(cartao_id=card_id, user_id=user_id, status='aberta').first()
    if not fatura:
        return jsonify({'error': 'Fatura em aberto não encontrada para este cartão.'}), 404

    # 2. Busca o cartão de crédito correspondente
    card = CreditCard.query.filter_by(id=card_id, user_id=user_id).first()
    if not card:
        return jsonify({'error': 'Cartão de crédito não encontrado.'}), 404

    # 3. Reestabelece o limite disponível
    # Converte o valor da fatura para Decimal para garantir a precisão
    valor_fatura = Decimal(fatura.valor_total)
    card.available_limit = Decimal(card.available_limit) + valor_fatura

    # 4. Garante que o limite disponível não ultrapasse o limite total do cartão
    if card.available_limit > card.limit:
        card.available_limit = card.limit

    # 5. Atualiza o status da fatura para "paga"
    fatura.status = 'paga'
    
    # 6. Salva ambas as alterações (limite do cartão e status da fatura) no banco
    db.session.commit()

    return jsonify({
        'message': 'Fatura confirmada com sucesso e limite do cartão atualizado!',
        'card_updated': card.to_dict() # Retorna os dados atualizados do cartão
    }), 200



@credit_cards_bp.route('/faturas', methods=['POST'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def criar_fatura():
    from src.models.extended_modules import Fatura

    user_id = get_jwt_identity()
    data = request.get_json()

    nova_fatura = Fatura(
        cartao_id=data['cartao_id'],
        valor_total=data['valor_total'],
        mes=data['mes'],
        ano=data['ano'],
        status = data.get('status', 'aberta'),
        user_id=user_id  # se você tiver esse campo no modelo
    )

    db.session.add(nova_fatura)
    db.session.commit()
    db.session.refresh(nova_fatura)

    return jsonify({'message': 'Fatura criada com sucesso'}), 201

@credit_cards_bp.route('/faturas', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def listar_faturas():
    from src.models.extended_modules import Fatura, CreditCard
    from datetime import date, datetime
    user_id = get_jwt_identity()

    # 1. Pega os parâmetros da URL
    status_filter = request.args.get('status')
    start_date_str = request.args.get('start_date') # <-- NOVO
    end_date_str = request.args.get('end_date')     # <-- NOVO

    # 2. Inicia a construção da query no banco de dados
    query = db.session.query(Fatura, CreditCard).join(
        CreditCard, Fatura.cartao_id == CreditCard.id
    ).filter(Fatura.user_id == user_id)

    # 3. Filtro de Status
    if status_filter and status_filter in ['aberta', 'paga']:
        query = query.filter(Fatura.status == status_filter)

    # 4. Executa a query base para buscar todas as faturas do usuário
    faturas_e_cartoes = query.order_by(Fatura.ano.desc(), Fatura.mes.desc()).all()

    resultado = []
    
    # Prepara as datas de filtro (se existirem)
    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None

    # 5. Processa os resultados e calcula a data de vencimento
    for fatura, cartao in faturas_e_cartoes:
        data_vencimento_calculada = None
        incluir_no_resultado = True # <--- Flag para decidir se a fatura vai pro JSON

        try:
            if cartao and cartao.due_day:
                mes_vencimento = fatura.mes + 1
                ano_vencimento = fatura.ano
                if mes_vencimento > 12:
                    mes_vencimento = 1
                    ano_vencimento += 1
                
                # Calcula a data exata do vencimento desta fatura
                data_vencimento_real = date(ano_vencimento, mes_vencimento, int(cartao.due_day))
                data_vencimento_calculada = data_vencimento_real.isoformat()

                # ▼▼▼ FILTRO DE DATA BLINDADO ▼▼▼
                if start_date:
                    if data_vencimento_real < start_date:
                        incluir_no_resultado = False 
                
                if end_date:
                    if data_vencimento_real > end_date:
                        incluir_no_resultado = False
                # ▲▲▲ FIM DO FILTRO DE DATA ▲▲▲

        except (TypeError, ValueError) as e:
            print(f"AVISO: Erro ao calcular data para a fatura ID {fatura.id}. Erro: {e}")
            data_vencimento_calculada = None

        # Só adiciona no JSON final se passou pelo filtro
        if incluir_no_resultado:
            resultado.append({
                'id': fatura.id,
                'cartao_id': fatura.cartao_id,
                'cartao_nome': cartao.name if cartao else 'Desconhecido', # <-- Útil pro front
                'valor_total': fatura.valor_total,
                'mes': fatura.mes,
                'ano': fatura.ano,
                'status': fatura.status,
                'data_vencimento': data_vencimento_calculada,
                'created_at': fatura.created_at.isoformat() if fatura.created_at else None
            })
        
    return jsonify(resultado), 200

@credit_cards_bp.route('/credit-cards/<int:card_id>/transactions', methods=['POST'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def create_credit_card_transaction(card_id):
    user_id = get_jwt_identity()
    data = request.json

    card = CreditCard.query.filter_by(id=card_id, user_id=user_id).first()
    if not card:
        return jsonify({'error': 'Cartão de crédito não encontrado'}), 404

    description = data.get('description')
    total_value = float(data.get('value', 0))
    category_id = data.get('category_id')
    payment_method = data.get('payment_method', 'a_vista')
    installments = int(data.get('installments', 1))
    purchase_date_str = data.get('date')

    if not all([description, total_value > 0, category_id, purchase_date_str]):
        return jsonify({'error': 'Descrição, valor, categoria e data são obrigatórios'}), 400

    if total_value > card.available_limit:
        return jsonify({'error': 'Limite insuficiente no cartão'}), 400

    card.available_limit -= total_value
    purchase_date = datetime.strptime(purchase_date_str, '%Y-%m-%d').date()
    
    # --- LÓGICA DE FECHAMENTO CORRIGIDA E FINAL ---
    # 1. Calcula a data de vencimento que ocorreria no mesmo mês da compra.
    due_date_in_purchase_month = date(purchase_date.year, purchase_date.month, card.due_day)

    # 2. Calcula a data de fechamento para a fatura do mês ANTERIOR.
    #    Esta é a data que define o fim do ciclo de faturamento anterior.
    closing_date_for_previous_invoice = due_date_in_purchase_month - timedelta(days=8)

    # 3. Determina o mês de referência da fatura
    if purchase_date <= closing_date_for_previous_invoice:
        # Se a compra foi feita ANTES ou NO DIA do fechamento da fatura anterior,
        # ela pertence à fatura de referência do mês anterior.
        fatura_mes = purchase_date.month - 1
        fatura_ano = purchase_date.year
        if fatura_mes == 0:
            fatura_mes = 12
            fatura_ano -= 1
    else:
        # Se a compra foi feita DEPOIS do fechamento, ela já entra na fatura
        # com a referência do mês atual.
        fatura_mes = purchase_date.month
        fatura_ano = purchase_date.year
    # --- FIM DA LÓGICA DE FECHAMENTO ---

    last_transaction_created = None

    if payment_method == 'parcelado' and installments > 1:
        installment_value = round(total_value / installments, 2)
        last_installment_value = total_value - (installment_value * (installments - 1))

        current_fatura_mes = fatura_mes
        current_fatura_ano = fatura_ano

        for i in range(installments):
            fatura = _get_or_create_fatura(user_id, card_id, current_fatura_mes, current_fatura_ano)
            value_to_save = last_installment_value if i == installments - 1 else installment_value
            fatura.valor_total = (fatura.valor_total or Decimal('0.0')) + Decimal(str(value_to_save))

            new_transaction = CreditCardTransaction(
                user_id=user_id, credit_card_id=card_id,
                fatura_id=fatura.id,
                description=f"{description} ({i + 1}/{installments})",
                value=value_to_save, date=purchase_date, category_id=category_id,
                installments=installments, current_installment=(i + 1)
            )
            db.session.add(new_transaction)
            last_transaction_created = new_transaction

            # Avança para o próximo mês para a próxima parcela
            current_fatura_mes += 1
            if current_fatura_mes > 12:
                current_fatura_mes = 1
                current_fatura_ano += 1
    else:  # Compra à vista
        fatura = _get_or_create_fatura(user_id, card_id, fatura_mes, fatura_ano)

        fatura.valor_total = (fatura.valor_total or Decimal('0.0')) + Decimal(str(total_value))

        new_transaction = CreditCardTransaction(
            user_id=user_id, credit_card_id=card_id,
            fatura_id=fatura.id,
            description=description, value=total_value, date=purchase_date,
            category_id=category_id, installments=1, current_installment=1
        )
        db.session.add(new_transaction)
        last_transaction_created = new_transaction

    db.session.commit()
    return jsonify(last_transaction_created.to_dict()), 201

# ▼▼▼ ADICIONE ESTA NOVA ROTA NO FINAL DO ARQUIVO ▼▼▼
@credit_cards_bp.route('/faturas/<int:fatura_id>/transactions', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_fatura_transactions(fatura_id):
    user_id = get_jwt_identity()
    
    # Valida se a fatura pertence ao usuário
    fatura = Fatura.query.filter_by(id=fatura_id, user_id=user_id).first()
    if not fatura:
        return jsonify({'error': 'Fatura não encontrada'}), 404

    # Busca as transações usando o 'fatura_id'
    transactions = CreditCardTransaction.query.filter_by(fatura_id=fatura_id).all()
    
    return jsonify([t.to_dict() for t in transactions])


# ▼▼▼ COLE NO FINAL DO ARQUIVO src/routes/credit_cards.py ▼▼▼

@credit_cards_bp.route('/credit-cards/transactions/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
@active_user_required
def delete_credit_card_transaction(transaction_id):
    user_id = get_jwt_identity()
    
    # 1. Busca a transação
    transaction = CreditCardTransaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    if not transaction:
        return jsonify({'error': 'Transação não encontrada'}), 404

    # 2. Busca o cartão e a fatura vinculados
    card = CreditCard.query.filter_by(id=transaction.credit_card_id).first()
    fatura = Fatura.query.filter_by(id=transaction.fatura_id).first()

    try:
        # 3. Restaura o limite do cartão
        if card:
            # Converte para Decimal para evitar erros de ponto flutuante, se necessário, ou usa float se seu modelo for float
            card.available_limit = float(card.available_limit) + float(transaction.value)
            
            # Trava de segurança: limite disponível não pode ser maior que o limite total
            if card.available_limit > card.limit:
                card.available_limit = card.limit

        # 4. Abate o valor da fatura
        if fatura:
            fatura.valor_total = float(fatura.valor_total) - float(transaction.value)
            # Se ficar negativo por algum erro de arredondamento, zera
            if fatura.valor_total < 0:
                fatura.valor_total = 0

        # 5. Deleta a transação
        db.session.delete(transaction)
        db.session.commit()

        return jsonify({'message': 'Transação excluída, limite restaurado e fatura atualizada.'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao excluir transação: {str(e)}'}), 500






