from src.database.database import execute_query
from datetime import datetime, date, timedelta
import fitz  # PyMuPDF 
from src.services.ai_assessor_service import categorizar_descricao_transacao, extrair_transacoes_de_texto_com_ia # <-- Nova importação da IA
from src.models.db import db
from collections import defaultdict
import re
from src.models.financial import Transaction, Category
from src.models.extended_modules import CreditCard, CreditCardTransaction, CreditCardCategory

def criar_fatura(numero_usuario, valor, descricao, cartao):
    """
    Grava o lançamento na tabela de transações do cartão de crédito
    """
    # ... (O código desta função permanece o mesmo)
    cartao_obj = CreditCard.query.filter_by(
        user_id=numero_usuario,
        name=cartao['nome'],
        last_digits=cartao['ultimos_quatro']
    ).first()

    if not cartao_obj:
        raise ValueError(f"Cartão não encontrado: {cartao['nome']} ({cartao['ultimos_quatro']})")

    categoria = CreditCardCategory.query.filter_by(name="Outros").first()
    if not categoria:
        raise ValueError("Categoria de cartão 'Outros' não encontrada.")

    nova_transacao = CreditCardTransaction(
        user_id=numero_usuario,
        credit_card_id=cartao_obj.id,
        category_id=categoria.id,
        description=descricao,
        value=float(valor),
        date=datetime.utcnow().date(),
        installments=1,
        current_installment=1,
        is_recurring=False,
        created_at=datetime.utcnow()
    )
    db.session.add(nova_transacao)

    if cartao_obj.available_limit is None:
        cartao_obj.available_limit = cartao_obj.limit
    cartao_obj.available_limit -= float(valor)
    if cartao_obj.available_limit < 0:
        cartao_obj.available_limit = 0
    db.session.commit()


# --- NOVAS FUNÇÕES ADICIONADAS ABAIXO ---

def buscar_transacoes_pendentes(user_id):
    """
    Busca todas as transações de um usuário com o status 'pendente'.
    """
    query = """
        SELECT 
            id, 
            description,
            value,
            type
        FROM 
            transactions
        WHERE 
            user_id = :user_id AND
            status = 'pendente'
        ORDER BY 
            date ASC
    """
    params = {'user_id': user_id}
    resultado = execute_query(query, params)
    return resultado

def confirmar_transacao_por_id(transaction_id, user_id):
    """
    Atualiza o status de uma transação específica para 'confirmada',
    garantindo que ela pertence ao usuário correto.
    """
    query = """
        UPDATE transactions
        SET status = 'confirmada'
        WHERE id = :transaction_id AND user_id = :user_id
    """
    params = {
        'transaction_id': transaction_id,
        'user_id': user_id
    }
    try:
        # Executa a query de atualização sem esperar um retorno de dados
        execute_query(query, params)
        # Se a query foi executada sem levantar uma exceção, consideramos sucesso
        return True
    except Exception as e:
        print(f"Erro ao executar a query de confirmação: {e}")
        return False


def buscar_transacoes_por_status(user_id, status, data_inicio, data_fim, tipo='ambos'):
    """
    Busca transações de um usuário com um status específico e, opcionalmente,
    por tipo ('entrada', 'saida', ou 'ambos').
    """
    query = """
        SELECT
            t.description,
            t.value,
            c.name as category_name,
            t.date,
            t.type -- Adicionado para sabermos se é entrada ou saída
        FROM
            transactions t
        JOIN
            categories c ON t.category_id = c.id
        WHERE
            t.user_id = :user_id AND
            t.status = :status AND
            t.date BETWEEN :data_inicio AND :data_fim
    """
    params = {
        'user_id': user_id,
        'status': status,
        'data_inicio': data_inicio,
        'data_fim': data_fim
    }

    # Adiciona o filtro de tipo dinamicamente
    if tipo == 'entrada':
        query += " AND t.type = 'entrada'"
    elif tipo == 'saida':
        query += " AND t.type = 'saida'"

    query += " ORDER BY t.date DESC"
    
    return execute_query(query, params)

# ▼▼▼ COLE TODO ESTE BLOCO NO FINAL DO ARQUIVO 'transacoes_service.py' ▼▼▼

from datetime import date, timedelta
from sqlalchemy import func, case
from src.models.financial import Transaction, Category

def gerar_resumo_semanal(user_id):
    """
    Calcula o resumo financeiro da última semana completa (Segunda a Domingo) para um usuário.
    """
    hoje = date.today()
    # A linha abaixo calcula o início da semana passada (a última segunda-feira)
    # Ex: se hoje for qua, 28/ago, ele voltará para seg, 19/ago
    inicio_semana = hoje - timedelta(days=hoje.weekday() + 7) 
    
    # O fim da semana passada (o último domingo)
    fim_semana = inicio_semana + timedelta(days=6)

    print(f"DEBUG: Gerando resumo para User ID {user_id} no período de {inicio_semana} a {fim_semana}")

    # 1. Busca os totais de entrada e saída com uma única query no banco
    totais = db.session.query(
        func.sum(case((Transaction.type == 'entrada', Transaction.value), else_=0)).label('total_entradas'),
        func.sum(case((Transaction.type == 'saida', Transaction.value), else_=0)).label('total_saidas')
    ).filter(
        Transaction.user_id == user_id,
        Transaction.status == 'confirmada', # Apenas transações confirmadas
        Transaction.date.between(inicio_semana, fim_semana)
    ).first()

    total_entradas = totais.total_entradas if totais.total_entradas is not None else 0
    total_saidas = totais.total_saidas if totais.total_saidas is not None else 0
    saldo_semanal = total_entradas - total_saidas

    # Se não houve nenhum gasto, retornamos um objeto indicando isso
    if total_saidas == 0:
        return {
            "has_activity": False
        }

    # 2. Busca a categoria com o maior gasto no período
    gastos_por_categoria = db.session.query(
        Category.name,
        func.sum(Transaction.value).label('total')
    ).join(Category, Transaction.category_id == Category.id).filter(
        Transaction.user_id == user_id,
        Transaction.status == 'confirmada',
        Transaction.type == 'saida',
        Transaction.date.between(inicio_semana, fim_semana)
    ).group_by(Category.name).order_by(func.sum(Transaction.value).desc()).first()

    # Define a categoria principal ou um valor padrão
    categoria_principal = gastos_por_categoria.name if gastos_por_categoria else "Diversos"

    return {
        "has_activity": True,
        "total_gasto": float(total_saidas),
        "saldo": float(saldo_semanal),
        "categoria_principal": categoria_principal
    }
# ▲▲▲ FIM DO BLOCO PARA COPIAR ▲▲▲

def processar_extrato_pdf(user_id, pdf_file_stream):
    """
    Processa um PDF de extrato, extrai transações usando IA, as categoriza
    e as salva como pendentes no banco de dados.
    """
    try:
        documento = fitz.open(stream=pdf_file_stream.read(), filetype="pdf")
        texto_completo = "".join(pagina.get_text() for pagina in documento)

        # --- A MÁGICA ACONTECE AQUI ---
        # 1. Chama a IA para extrair as transações do texto
        print("INFO: Chamando IA para extrair transações do texto do extrato...")
        transacoes_extraidas = extrair_transacoes_de_texto_com_ia(texto_completo)

        if not transacoes_extraidas:
            return {"status": "sucesso", "mensagem": "Importação concluída! 0 lançamentos encontrados no extrato."}

        novos_lancamentos = []
        categoria_outros_saida = Category.query.filter_by(user_id=user_id, name='Outros', type='saida').first()
        categoria_outros_entrada = Category.query.filter_by(user_id=user_id, name='Outros', type='entrada').first()

        # 2. Itera sobre a lista de transações que a IA retornou
        for transacao in transacoes_extraidas:
            valor = float(transacao.get('valor', 0))
            descricao = transacao.get('descricao', 'Sem descrição')
            data_str = transacao.get('data')

            if valor == 0 or not data_str:
                continue # Pula se a transação for inválida

            tipo_transacao = 'entrada' if valor > 0 else 'saida'

            # 3. Usa a outra função de IA para categorizar a descrição
            nome_categoria_ia = categorizar_descricao_transacao(user_id, descricao)

            categoria_final = Category.query.filter_by(user_id=user_id, name=nome_categoria_ia, type=tipo_transacao).first()

            if categoria_final:
                categoria_id_final = categoria_final.id
            else:
                categoria_id_final = categoria_outros_entrada.id if tipo_transacao == 'entrada' else categoria_outros_saida.id

            novo_lancamento = Transaction(
                user_id=user_id,
                date=datetime.strptime(data_str, '%Y-%m-%d').date(),
                type=tipo_transacao,
                category_id=categoria_id_final,
                value=abs(valor), # Salva sempre o valor positivo
                description=f"[Importado] {descricao}",
                status='pendente',
                format='variavel',      # Define o formato como 'variável'
                payment_form='a_vista'  # Define a forma de pagamento como 'à vista'
            )
            novos_lancamentos.append(novo_lancamento)

        if novos_lancamentos:
            db.session.add_all(novos_lancamentos)
            db.session.commit()

        return {
            "status": "sucesso",
            "mensagem": f"Importação concluída! {len(novos_lancamentos)} lançamentos adicionados como pendentes."
        }

    except Exception as e:
        print(f"ERRO CRÍTICO ao processar o arquivo PDF com IA: {e}")
        return {"status": "erro", "mensagem": "Ocorreu um erro inesperado ao processar o extrato. Tente novamente."}