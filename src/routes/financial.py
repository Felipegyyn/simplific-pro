import uuid
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request, jwt_required
from datetime import datetime, timedelta
from src.routes.user import active_user_required
from dateutil.relativedelta import relativedelta
from sqlalchemy import func, case
from sqlalchemy import cast
from src.database.database import execute_query # <-- ADICIONE ESTA LINHA
from src.models.extended_modules import BankAccount # <--- ADICIONE ESTE IMPORT
from src.models.db import db
from src.models.financial import Category, Planning, Transaction
from src.services.transacoes_service import processar_extrato_pdf 

financial_bp = Blueprint('financial', __name__)
transactions_bp = Blueprint('transactions', __name__) # <-- ADICIONE ESTA LINHA

# Categories routes
@financial_bp.route('/categories', methods=['GET', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_categories():
    if request.method == 'OPTIONS':
        return '', 200

    verify_jwt_in_request()
    user_id = get_jwt_identity()
    categories = Category.query.filter_by(user_id=user_id).all()
    return jsonify([category.to_dict() for category in categories])

@financial_bp.route('/categories', methods=['POST', 'OPTIONS'])
@jwt_required()
@active_user_required
def create_category():
    user_id = get_jwt_identity()
    data = request.json
    
    name = data.get('name')
    type = data.get('type')  # 'entrada' or 'saida'
    color = data.get('color', '#808080') # <--- NOVO: Pega a cor ou usa cinza padrão
    
    if not name:
        return jsonify({'error': 'Nome é obrigatório'}), 400
    
    if type not in ['entrada', 'saida']:
        return jsonify({'error': 'Tipo deve ser "entrada" ou "saida"'}), 400
    
    # Check if category already exists for this user
    existing = Category.query.filter_by(user_id=user_id, name=name, type=type).first()
    if existing:
        return jsonify({'error': 'Categoria já existe'}), 400
    
    category = Category(
        name=name,
        type=type,
        color=color, # <--- NOVO: Salva a cor
        user_id=user_id
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify(category.to_dict()), 201

# --- NOVAS ROTAS DE GESTÃO DE CATEGORIAS ---

@financial_bp.route('/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
@active_user_required
def update_category(category_id):
    user_id = get_jwt_identity()
    data = request.json
    
    # Busca a categoria garantindo que é do usuário
    category = Category.query.filter_by(id=category_id, user_id=user_id).first()
    
    if not category:
        return jsonify({'error': 'Categoria não encontrada'}), 404
        
    # Atualiza apenas o que foi enviado
    if 'name' in data:
        category.name = data['name']
    if 'color' in data:
        category.color = data['color']
        
    db.session.commit()
    return jsonify(category.to_dict()), 200


@financial_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
@active_user_required
def delete_category(category_id):
    user_id = get_jwt_identity()
    
    category = Category.query.filter_by(id=category_id, user_id=user_id).first()
    
    if not category:
        return jsonify({'error': 'Categoria não encontrada'}), 404
        
    # --- TRAVA DE SEGURANÇA ---
    # Verifica se existem Transações ou Planejamentos usando essa categoria.
    # Se excluir uma categoria em uso, o histórico financeiro quebra ou dá erro 500.
    
    has_transactions = Transaction.query.filter_by(category_id=category_id).first()
    has_planning = Planning.query.filter_by(category_id=category_id).first()
    
    # Se você tiver importado CreditCardTransaction, verifique também:
    # has_card_tx = CreditCardTransaction.query.filter_by(category_id=category_id).first()
    
    if has_transactions or has_planning:
        return jsonify({
            'error': 'Não é possível excluir esta categoria pois existem lançamentos ou planejamentos vinculados a ela. Edite os lançamentos antes de excluir.'
        }), 400
        
    db.session.delete(category)
    db.session.commit()
    
    return '', 204

# Planning routes
@financial_bp.route('/planning', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_planning():
    user_id = get_jwt_identity()


    # Filtros vindos da query string
    type_filter = request.args.get('type')
    category_name_filter = request.args.get('category_name')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    ano = request.args.get('ano')
    mes = request.args.get('mes')

    query = Planning.query.join(Category).filter(Planning.user_id == user_id)

    if type_filter:
        query = query.filter(Planning.type == type_filter)
    if category_name_filter:
        query = query.filter(Category.name == category_name_filter)
    if start_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Planning.date >= start)
        except ValueError:
            pass
    if end_date:
        try:
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Planning.date <= end)
        except ValueError:
            pass
    if ano:
        query = query.filter(db.extract('year', cast(Planning.date, db.Date)) == int(ano))

    if mes:
        query = query.filter(db.extract('month', cast(Planning.date, db.Date)) == int(mes))

    results = query.order_by(Planning.date.desc()).all()

    response = []
    for plan in results:
        gasto_total = 0
        # Se o planejamento já foi confirmado, procuramos pela transação vinculada a ele.
        if plan.status == 'confirmed':
            linked_transaction = Transaction.query.filter_by(planning_id=plan.id).first()
            if linked_transaction:
                # O valor gasto é exatamente o valor da transação vinculada.
                gasto_total = linked_transaction.value

        progresso = (gasto_total / plan.value * 100) if plan.value else 0
        
        plan_dict = plan.to_dict()
        plan_dict['spent_amount'] = float(gasto_total) # Garante que o valor é float
        plan_dict['available'] = plan.value - gasto_total
        plan_dict['progress'] = progresso

        response.append(plan_dict)
    return jsonify({"plannings": response})


@financial_bp.route('/planning', methods=['POST', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def create_planning():
    user_id = get_jwt_identity()
    data = request.json

    type = data.get('type')
    date_str = data.get('date')
    category_id = data.get('category_id')
    form = data.get('form')
    is_recurring = data.get('is_recurring', False)
    value = data.get('value')
    observations = data.get('observations', '')
    recurrence_period = data.get('recurrence_period', 1)

    if not all([type, date_str, category_id, value, form]):
        return jsonify({'error': 'Todos os campos obrigatórios devem ser preenchidos'}), 400

    if not all([type, date_str, category_id, value]):
        return jsonify({'error': 'Todos os campos obrigatórios devem ser preenchidos'}), 400

    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        value = float(value)
        value = abs(value) # GARANTE QUE O VALOR SEJA SEMPRE POSITIVO
        recurrence_period = int(recurrence_period)
    except ValueError:
        return jsonify({'error': 'Data, valor ou período inválido'}), 400

    # Verifica se a categoria pertence ao usuário
    category = Category.query.filter_by(id=category_id, user_id=user_id).first()
    if not category:
        return jsonify({'error': 'Categoria não encontrada'}), 404

    if is_recurring:
            # Gera um ID único para este grupo de recorrência
            group_id = str(uuid.uuid4()) 
            
            for i in range(recurrence_period):
                recurrence_date = date + relativedelta(months=i)
                planning = Planning(
                    user_id=user_id,
                    type=type,
                    date=recurrence_date,
                    category_id=category_id,
                    form=form,
                    is_recurring=True,
                    value=value,
                    observations=observations,
                    recurrence_group_id=group_id  # Atribui o ID do grupo
                )
                db.session.add(planning)

    else:
        planning = Planning(
            user_id=user_id,
            type=type,
            date=date,
            category_id=category_id,
            form=form,
            is_recurring=False,
            value=value,
            observations=observations
        )
        db.session.add(planning)

    db.session.commit()

    return jsonify({'success': True}), 201

@financial_bp.route('/planning/<int:planning_id>', methods=['DELETE'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def delete_planning(planning_id):
    user_id = get_jwt_identity()
    planning = Planning.query.filter_by(id=planning_id, user_id=user_id).first()
    
    if not planning:
        return jsonify({'error': 'Planejamento não encontrado'}), 404
    
    db.session.delete(planning)
    db.session.commit()
    
    return '', 204

@financial_bp.route('/planning/<int:planning_id>', methods=['PUT'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def update_planning(planning_id):
    user_id = get_jwt_identity()
    planning = Planning.query.filter_by(id=planning_id, user_id=user_id).first()

    if not planning:
        return jsonify({'error': 'Planejamento não encontrado'}), 404

    data = request.get_json()

    planning.type = data.get('type', planning.type)
    planning.category_id = data.get('category_id', planning.category_id)
    planning.date = datetime.strptime(data.get('date'), "%Y-%m-%d").date() if data.get('date') else planning.date
    planning.value = float(data.get('value', planning.value))
    planning.is_recurring = data.get('is_recurring', planning.is_recurring)
    planning.recurrence_period = data.get('recurrence_period', planning.recurrence_period)
    planning.observations = data.get('observations', planning.observations)

    db.session.commit()

    return jsonify({'success': True, 'message': 'Planejamento atualizado com sucesso'})


@financial_bp.route('/planning/<int:planning_id>/confirm', methods=['PUT'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def confirm_planning(planning_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    if data.get('status') != 'confirmed':
        return jsonify({'error': 'Status inválido'}), 400

    planning = Planning.query.filter_by(id=planning_id, user_id=user_id).first()
    if not planning:
        return jsonify({'error': 'Planejamento não encontrado'}), 404

    # Atualiza status diretamente no banco
    Planning.query.filter_by(id=planning_id, user_id=user_id).update({'status': 'confirmed'})

    transaction = Transaction(
        user_id=user_id,
        date=datetime.strptime(planning.date, "%Y-%m-%d").date() if isinstance(planning.date, str) else planning.date,
        type=planning.type,
        category_id=planning.category_id,
        format='planejado',
        payment_form='a_vista',
        description=planning.observations or f'Lançado a partir do planejamento - {planning.category.name}',
        value=abs(float(planning.value)),
        status='pendente',
        installments=1,
        current_installment=1,
        planning_id=planning.id  # <--- ADICIONE ESTA LINHA AQUI 26/08/2025
    )

    db.session.add(transaction)
    db.session.commit()  # Salva transação e update no planejamento

    return jsonify(transaction.to_dict()), 200





@financial_bp.route('/planning/<int:planning_id>', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_planning_by_id(planning_id):
    user_id = get_jwt_identity()
    planning = Planning.query.filter_by(id=planning_id, user_id=user_id).first()

    if not planning:
        return jsonify({'error': 'Planejamento não encontrado'}), 404

    return jsonify(planning.to_dict()), 200




@financial_bp.route('/planning/<int:planning_id>/to-transaction', methods=['POST', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def planning_to_transaction(planning_id):
    user_id = get_jwt_identity()
    planning = Planning.query.filter_by(id=planning_id, user_id=user_id).first()
    
    if not planning:
        return jsonify({'error': 'Planejamento não encontrado'}), 404
    
    # Create transaction from planning
    transaction = Transaction(
        user_id=user_id,
        date=planning.date if isinstance(planning.date, datetime) else datetime.strptime(planning.date, '%Y-%m-%d').date(),
        type=planning.type,
        category_id=planning.category_id,
        format=planning.form,
        payment_form='a_vista',  # Default
        description=planning.observations or f'Lançamento do planejamento - {planning.category.name}',
        value=abs(float(planning.value)),
        status='pendente'
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify(transaction.to_dict()), 201

@transactions_bp.route('/', methods=['GET'])
@jwt_required()
@active_user_required
def get_transactions():
    user_id = get_jwt_identity()
    
    # Filtros
    ano = request.args.get('ano')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    type_filter = request.args.get('type')
    payment_form_filter = request.args.get('payment_form')
    category_filter = request.args.get('category_id')
    category_name = request.args.get('category_name')
    status_filter = request.args.get('status')
    
    # ▼▼▼ NOVO FILTRO ▼▼▼
    bank_account_id = request.args.get('bank_account_id')
    # ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    query = Transaction.query.filter_by(user_id=user_id)

    if ano:
        try:
            start_date_ano = datetime(int(ano), 1, 1)
            end_date_ano = datetime(int(ano), 12, 31, 23, 59, 59)
            query = query.filter(Transaction.date >= start_date_ano, Transaction.date <= end_date_ano)
        except ValueError:
            pass
 
    if start_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Transaction.date >= start)
        except ValueError:
            pass
    
    if end_date:
        try:
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Transaction.date <= end)
        except ValueError:
            pass
    
    if type_filter:
        query = query.filter_by(type=type_filter)
    
    if payment_form_filter:
        query = query.filter_by(payment_form=payment_form_filter)
    
    if category_filter:
        query = query.filter_by(category_id=category_filter)

    if category_name:
        query = query.join(Category).filter(Category.name == category_name)
    
    if status_filter:
        query = query.filter_by(status=status_filter)

    # ▼▼▼ APLICAÇÃO DO NOVO FILTRO ▼▼▼
    if bank_account_id:
        query = query.filter_by(bank_account_id=bank_account_id)
    # ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    transactions = query.order_by(Transaction.date.desc()).all()
    
    valid_transactions = []
    for transaction in transactions:
        try:
            valid_transactions.append(transaction.to_frontend_dict())
        except Exception as e:
            print(f"[WARNING] Transação inválida ignorada: {str(e)}")
            
    return jsonify({'transactions': valid_transactions}), 200



@transactions_bp.route('/', methods=['POST', 'OPTIONS'])
@jwt_required()
@active_user_required
def create_transaction():
    if request.method == 'OPTIONS':
        return '', 200

    user_id = get_jwt_identity()
    data = request.json

    print("DEBUG - DADOS RECEBIDOS EM /transactions:", data)
    
    date_str = data.get('date')
    type = data.get('type')
    if type not in ['entrada', 'saida']:
        return jsonify({'error': 'Tipo inválido. Deve ser "entrada" ou "saida".'}), 400
    
    category_id = data.get('category_id')
    if not category_id:
        return jsonify({'error': 'ID da categoria obrigatório'}), 400
        
    # ▼▼▼ NOVO CAMPO ▼▼▼
    bank_account_id = data.get('bank_account_id')
    # ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    
    format = data.get('format', 'variavel')
    payment_form = data.get('payment_form', 'a_vista')
    installments = data.get('installments', 1)
    description = data.get('description')
    value = data.get('value')
    status = data.get('status', 'pendente')
    
    if not all([date_str, type, category_id, description, value]):
        return jsonify({'error': 'Todos os campos obrigatórios devem ser preenchidos'}), 400
    
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        value = float(value)
        installments = int(installments) if installments else 1
    except ValueError:
        return jsonify({'error': 'Data, valor ou parcelas inválidos'}), 400
    
    # Valida categoria
    category = Category.query.filter_by(id=category_id, user_id=user_id).first()
    if not category:
        return jsonify({'error': 'Categoria não encontrada'}), 404
    
    # ▼▼▼ LÓGICA DE SALDO BANCÁRIO ▼▼▼
    account = None
    if bank_account_id:
        account = BankAccount.query.filter_by(id=bank_account_id, user_id=user_id).first()
        if not account:
            return jsonify({'error': 'Conta bancária não encontrada'}), 404
            
        # Se a transação já nasce confirmada, atualizamos o saldo
        if status == 'confirmada':
            if type == 'entrada':
                account.current_balance += value
            elif type == 'saida':
                account.current_balance -= value
    # ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    transactions_created = []
    
    if payment_form == 'parcelado' and installments > 1:
        # Lógica de parcelamento (mantida igual)
        for i in range(installments):
            installment_date = date + relativedelta(months=i)
            installment_description = f"{description} - Parcela {i+1}/{installments}"
            
            transaction = Transaction(
                user_id=user_id,
                date=installment_date,
                type=type,
                category_id=category_id,
                format=format,
                payment_form=payment_form,
                installments=installments,
                current_installment=i+1,
                description=installment_description,
                value=value / installments,
                status=status,
                bank_account_id=bank_account_id # <--- VINCULA A CONTA
            )
            
            if i == 0:
                db.session.add(transaction)
                db.session.flush()
                parent_id = transaction.id
            else:
                transaction.parent_transaction_id = parent_id
                db.session.add(transaction)
            
            transactions_created.append(transaction)
    else:
        # Transação única
        transaction = Transaction(
            user_id=user_id,
            date=date,
            type=type,
            category_id=category_id,
            format=format,
            payment_form=payment_form,
            installments=1,
            current_installment=1,
            description=description,
            value=value,
            status=status,
            bank_account_id=bank_account_id # <--- VINCULA A CONTA
        )
        
        db.session.add(transaction)
        transactions_created.append(transaction)
    
    db.session.commit()
    
    return jsonify(transactions_created[0].to_frontend_dict()), 201


@transactions_bp.route('/<int:transaction_id>', methods=['PUT', 'OPTIONS'])
def update_transaction(transaction_id):
    if request.method == 'OPTIONS':
        return '', 200  # Resposta para o preflight, sem autenticação

    verify_jwt_in_request()  # JWT obrigatório apenas para PUT
    user_id = get_jwt_identity()

    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()

    if not transaction:
        return jsonify({'error': 'Transação não encontrada'}), 404

    data = request.get_json()

    transaction.date = datetime.strptime(data.get('date'), '%Y-%m-%d').date() if data.get('date') else transaction.date
    transaction.type = data.get('type', transaction.type)
    transaction.category_id = data.get('category_id', transaction.category_id)
    transaction.format = data.get('format', transaction.format)
    transaction.payment_form = data.get('payment_form', transaction.payment_form)
    transaction.installments = data.get('installments', transaction.installments)
    transaction.description = data.get('description', transaction.description)
    transaction.value = abs(float(data.get('value', transaction.value)))
    transaction.status = data.get('status', transaction.status)

    db.session.commit()

    return jsonify({'success': True, 'message': 'Transação atualizada com sucesso'}), 200


@transactions_bp.route('/<int:transaction_id>/pay', methods=['PUT'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def pay_transaction(transaction_id):
    user_id = get_jwt_identity()
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()

    if not transaction:
        return jsonify({'error': 'Transação não encontrada'}), 404

    transaction.status = 'pendente'
    db.session.commit()

    return jsonify({'message': 'Fatura paga com sucesso!', 'transaction': transaction.to_frontend_dict()}), 200


@transactions_bp.route('/<int:transaction_id>/confirm', methods=['POST', 'OPTIONS'])
def confirm_transaction(transaction_id):
    if request.method == 'OPTIONS':
        return '', 200

    verify_jwt_in_request()
    user_id = get_jwt_identity()
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    
    if not transaction:
        return jsonify({'error': 'Lançamento não encontrado'}), 404
    
    if transaction.status == 'confirmada':
        return jsonify({'error': 'Lançamento já confirmado'}), 400
    
    # ▼▼▼ ATUALIZAÇÃO DE SALDO NA CONFIRMAÇÃO ▼▼▼
    if transaction.bank_account_id:
        account = BankAccount.query.filter_by(id=transaction.bank_account_id, user_id=user_id).first()
        if account:
            if transaction.type == 'entrada':
                account.current_balance += transaction.value
            elif transaction.type == 'saida':
                account.current_balance -= transaction.value
    # ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    transaction.status = 'confirmada'
    transaction.confirmed_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify(transaction.to_dict())

@transactions_bp.route('/<int:transaction_id>', methods=['DELETE', 'OPTIONS'])
def delete_transaction(transaction_id):
    if request.method == 'OPTIONS':
        return '', 200

    verify_jwt_in_request() 
    user_id = get_jwt_identity()
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    
    if not transaction:
        return jsonify({'error': 'Lançamento não encontrado'}), 404
    
    # ▼▼▼ ESTORNO DE SALDO AO EXCLUIR ▼▼▼
    # Só estorna se a transação estava confirmada e vinculada a uma conta
    if transaction.status == 'confirmada' and transaction.bank_account_id:
        account = BankAccount.query.filter_by(id=transaction.bank_account_id, user_id=user_id).first()
        if account:
            # Lógica INVERSA para desfazer
            if transaction.type == 'entrada':
                account.current_balance -= transaction.value # Tira a receita
            elif transaction.type == 'saida':
                account.current_balance += transaction.value # Devolve a despesa
    # ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    num_installments = transaction.installments or 1

    if transaction.parent_transaction_id is None and num_installments > 1:
        child_transactions = Transaction.query.filter_by(parent_transaction_id=transaction.id).all()
        for child in child_transactions:
            db.session.delete(child)
    
    db.session.delete(transaction)
    db.session.commit()
    
    return '', 204

from sqlalchemy import func, extract

@financial_bp.route('/reports/planned_vs_realized', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_planned_vs_realized_report():
    user_id = get_jwt_identity()

    # Pega os filtros da URL
    try:
        year = int(request.args.get('year', datetime.now().year))
        report_type = request.args.get('type', 'saida') # Padrão para 'saida'
        category_id = request.args.get('category_id')
    except ValueError:
        return jsonify({'error': 'Ano inválido'}), 400

    # 1. Query para dados PLANEJADOS
    planned_query = db.session.query(
        extract('month', Planning.date).label('month'),
        func.sum(Planning.value).label('total_planned')
    ).filter(
        Planning.user_id == user_id,
        extract('year', Planning.date) == year,
        Planning.type == report_type
    )
    if category_id:
        planned_query = planned_query.filter(Planning.category_id == category_id)
    
    planned_results = planned_query.group_by('month').all()
    
    # 2. Query para dados REALIZADOS (transações confirmadas)
    realized_query = db.session.query(
        extract('month', Transaction.date).label('month'),
        func.sum(Transaction.value).label('total_realized')
    ).filter(
        Transaction.user_id == user_id,
        extract('year', Transaction.date) == year,
        Transaction.type == report_type,
        Transaction.status == 'confirmada' # Considera apenas transações confirmadas
    )
    if category_id:
        realized_query = realized_query.filter(Transaction.category_id == category_id)

    realized_results = realized_query.group_by('month').all()

    # 3. Consolida os dados
    planned_map = {r.month: r.total_planned for r in planned_results}
    realized_map = {r.month: r.total_realized for r in realized_results}
    
    meses_pt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    report_data = []
    for i in range(1, 13):
        report_data.append({
            'month': meses_pt[i-1],
            'planejado': float(planned_map.get(i, 0)),
            'realizado': float(realized_map.get(i, 0))
        })
        
    return jsonify(report_data)


@financial_bp.route('/reports/dashboard_summary', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_dashboard_summary():
    user_id = get_jwt_identity()

    try:
        year = int(request.args.get('year', datetime.now().year))
        month = int(request.args.get('month', datetime.now().month))
    except (ValueError, TypeError):
        return jsonify({'error': 'Parâmetros de ano/mês inválidos'}), 400

    # Define as datas para o mês atual e o anterior
    current_month_start = datetime(year, month, 1)
    previous_month_start = current_month_start - relativedelta(months=1)
    previous_month_end = current_month_start - relativedelta(days=1)

    # Função auxiliar para buscar totais em um período
    def get_totals_for_period(start_date, end_date):
        totals = db.session.query(
            func.sum(case((Transaction.type == 'entrada', Transaction.value), else_=0)).label('revenue'),
            func.sum(case((Transaction.type == 'saida', Transaction.value), else_=0)).label('expense')
        ).filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date.date(),
            Transaction.date <= end_date.date()
        ).one()
        return {
            "revenue": float(totals.revenue or 0),
            "expense": float(totals.expense or 0)
        }

    # Busca os totais para os dois períodos
    current_month_totals = get_totals_for_period(current_month_start, current_month_start + relativedelta(months=1) - relativedelta(days=1))
    previous_month_totals = get_totals_for_period(previous_month_start, previous_month_end)

    return jsonify({
        "current_month": current_month_totals,
        "previous_month": previous_month_totals
    })

# ▼▼▼ ADICIONE ESTA NOVA ROTA NO FINAL DO ARQUIVO ▼▼▼

@transactions_bp.route('/import-statement', methods=['POST'])
@jwt_required()
@active_user_required
def import_statement():
    user_id = get_jwt_identity()

    # Verifica se o arquivo está na requisição
    if 'file' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado.'}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado.'}), 400

    # Valida se o arquivo é um PDF e o processa
    if file and file.filename.lower().endswith('.pdf'):
        resultado = processar_extrato_pdf(user_id, file.stream)
        
        if resultado['status'] == 'sucesso':
            return jsonify(resultado), 200
        else:
            return jsonify({'error': resultado['mensagem']}), 400
    else:
        return jsonify({'error': 'Formato de arquivo inválido. Por favor, envie um PDF.'}), 400

def criar_lancamento(user_id, tipo, categoria_id, valor, descricao, formato='Variável', status='confirmada', bank_account_id=None):
    """
    Grava o lançamento na tabela de transações e atualiza o saldo se tiver conta.
    """
    # 1. Cria a transação
    nova_transacao = Transaction(
        user_id=user_id,
        date=datetime.now().date(),
        type=tipo,
        category_id=categoria_id,
        value=abs(float(valor)),
        description=descricao,
        format=formato,
        payment_form='À vista',
        status=status,
        bank_account_id=bank_account_id # <--- VINCULA A CONTA
    )
    
    db.session.add(nova_transacao)
    
    # 2. Atualiza o saldo da conta (se houver conta e estiver confirmada)
    if bank_account_id and status == 'confirmada':
        conta = BankAccount.query.filter_by(id=bank_account_id, user_id=user_id).first()
        if conta:
            if tipo == 'entrada':
                conta.current_balance += nova_transacao.value
            elif tipo == 'saida':
                conta.current_balance -= nova_transacao.value

    db.session.commit()
    return nova_transacao

