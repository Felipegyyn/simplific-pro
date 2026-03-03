# src/services/memory_service.py

import os
import uuid
from datetime import datetime
import google.generativeai as genai
from pinecone import Pinecone

# --- 1. INICIALIZAÇÃO DO PINECONE ---
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME', 'simplific-memory')

pc = None
index = None

if PINECONE_API_KEY:
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        print("✅ Banco Vetorial (Pinecone) conectado com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao conectar no Pinecone: {e}")

# --- 2. FUNÇÃO DE VETORIZAÇÃO (EMBEDDING) ---
def gerar_vetor(texto):
    """
    Transforma um texto em um vetor numérico (768 dimensões) usando o motor do Google.
    """
    try:
        result = genai.embed_content(
            model="models/embedding-001",
            content=texto,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"Erro ao gerar vetor: {e}")
        return None

# --- 3. EXTRAÇÃO INTELIGENTE DE FATOS ---
def analisar_e_salvar_memoria(user_id, mensagem_usuario):
    """
    O 'Ouvinte em Background'. Ele lê a mensagem e verifica se há um fato pessoal duradouro.
    Se houver, ele salva no banco de memórias.
    """
    if not index: return

    # Usamos o modelo rápido e barato para essa tarefa de extração
    extrator = genai.GenerativeModel('gemini-flash-latest', generation_config={"temperature": 0.1})
    
    prompt = f"""
    Você é um extrator de memórias de longo prazo.
    Leia a mensagem abaixo enviada por um usuário para o seu assistente financeiro.
    
    Identifique se há ALGUM "Fato Pessoal Duradouro" que valha a pena lembrar no futuro.
    Exemplos de fatos duradouros: 
    - Nomes de familiares (esposa, filhos, pets).
    - Salário fixo ou fontes de renda.
    - Metas de longo prazo (viagens, compra de carro).
    - Regras ou preferências pessoais ("odeio ifood", "sempre guardo 10%").
    
    Não extraia coisas efêmeras como "gastei 50 hoje" ou "tenho reunião amanhã".

    Se encontrar um fato, retorne APENAS UMA FRASE AFIRMATIVA CLARA. Ex: "O usuário tem uma filha chamada Clarice."
    Se não houver nenhum fato duradouro, responda estritamente com a palavra: NENHUM
    
    MENSAGEM: "{mensagem_usuario}"
    """
    
    try:
        resposta = extrator.generate_content(prompt).text.strip()
        
        if resposta and "NENHUM" not in resposta.upper():
            # A IA achou um fato! Vamos vetorizar e salvar.
            print(f"🧠 [MEMÓRIA] Novo fato extraído: {resposta}")
            
            vetor = gerar_vetor(resposta)
            if vetor:
                memoria_id = str(uuid.uuid4())
                
                # Salva no Pinecone atrelado ao ID do usuário
                index.upsert(
                    vectors=[
                        {
                            "id": memoria_id, 
                            "values": vetor, 
                            "metadata": {
                                "user_id": str(user_id), # Metadado crucial para segurança (filtro)
                                "texto": resposta,
                                "data": datetime.now().strftime('%Y-%m-%d')
                            }
                        }
                    ]
                )
                print(f"✅ [MEMÓRIA] Fato salvo no Pinecone para o usuário {user_id}.")
                
    except Exception as e:
        print(f"Erro ao extrair memória: {e}")

# --- 4. RECUPERAÇÃO DE MEMÓRIAS ---
def buscar_memorias_relevantes(user_id, mensagem_atual, limite=3):
    """
    Busca no cérebro da IA os fatos passados que tenham relação com a mensagem atual.
    """
    if not index: return ""

    vetor_query = gerar_vetor(mensagem_atual)
    if not vetor_query: return ""

    try:
        # Pesquisa os vetores mais similares filtrando SOMENTE pelo ID do usuário atual
        resultados = index.query(
            vector=vetor_query,
            top_k=limite,
            include_metadata=True,
            filter={
                "user_id": {"$eq": str(user_id)}
            }
        )
        
        fatos = []
        for match in resultados['matches']:
            # Pega apenas os resultados com alta confiança de semelhança (score > 0.6)
            if match['score'] > 0.6:
                fatos.append(match['metadata']['texto'])
                
        if fatos:
            contexto_lembrado = "\n".join([f"- {fato}" for fato in fatos])
            print(f"🧠 [MEMÓRIA] Lembrei disso: \n{contexto_lembrado}")
            return f"\n\n# MEMÓRIAS RELEVANTES DO USUÁRIO\n{contexto_lembrado}\n"
        
        return ""
        
    except Exception as e:
        print(f"Erro ao buscar memória: {e}")
        return ""