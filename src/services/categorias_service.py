from src.database.database import execute_query

def buscar_categorias(user_id):
    """
    Busca TODAS as categorias (com id, nome e tipo) de um usuário específico.
    Esta função é essencial para a personalização do Gemini.
    """
    query = """
        SELECT id, name, type
        FROM categories
        WHERE user_id = :user_id
        ORDER BY name
    """
    params = {'user_id': user_id}
    resultado = execute_query(query, params)

    # Retorna a lista de dicionários, que é mais útil para o resto do código
    return resultado

def buscar_cartoes():
    """
    Busca cartões cadastrados no banco
    """
    query = """
        SELECT name, last_digits as ultimos_quatro
        FROM credit_cards
        WHERE is_active = true
    """
    resultado = execute_query(query)
    
    # O código original estava correto, mantendo
    cartoes = []
    for row in resultado:
        cartao = {
            'nome': row['name'],
            'ultimos_quatro': row['ultimos_quatro']
        }
        cartoes.append(cartao)
    return cartoes

def buscar_id_categoria(nome_categoria, user_id):
    """
    Busca o ID de uma categoria pelo nome, garantindo que ela pertence ao usuário correto.
    """
    query = "SELECT id FROM categories WHERE name = :nome_categoria AND user_id = :user_id"
    params = {'nome_categoria': nome_categoria, 'user_id': user_id}
    resultado = execute_query(query, params)
    if resultado:
        return resultado[0]['id']
    return None

# As funções de validação não são mais necessárias para o fluxo do Gemini,
# mas podem ser mantidas se forem usadas em outras partes do sistema.
def validar_categoria(categoria_digitada):
    # ... (código existente pode ser mantido)
    pass

def validar_cartao(cartao_digitado):
    # ... (código existente pode ser mantido)
    pass

# Em src/services/categorias_service.py

def get_categories_for_ai(user_id):
    """Formata as categorias do usuário em um texto para a IA."""
    categorias = buscar_categorias(user_id) # Reutiliza a função existente
    if not categorias:
        return "Categorias Disponíveis: Nenhuma."

    despesas = [c['name'] for c in categorias if c['type'] == 'saida']
    receitas = [c['name'] for c in categorias if c['type'] == 'entrada']

    texto_despesas = f"Despesa ({', '.join(despesas)})" if despesas else ""
    texto_receitas = f"Receita ({', '.join(receitas)})" if receitas else ""

    return f"Categorias Disponíveis: {texto_despesas}. {texto_receitas}."
