# src/services/search_service.py

import os
import requests

TAVILY_API_KEY = os.getenv('TAVILY_API_KEY')

def realizar_pesquisa_web(query):
    """
    Bate na API da Tavily para buscar informações em tempo real na internet.
    """
    if not TAVILY_API_KEY:
        print("❌ AVISO: TAVILY_API_KEY não encontrada no .env")
        return "Erro: Serviço de pesquisa web temporariamente indisponível."
        
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "basic", # basic é mais rápido e gasta menos créditos
        "include_answer": True,  # Força a Tavily a usar a própria IA dela para resumir a resposta
        "max_results": 3
    }
    
    try:
        print(f"🌍 [WEB SEARCH] Buscando na internet: '{query}'")
        response = requests.post(url, json=payload, timeout=10) # Timeout para não travar o bot
        response.raise_for_status()
        data = response.json()
        
        # A Tavily é inteligente e geralmente nos dá um 'answer' direto e mastigado
        if data.get('answer'):
            print("✅ [WEB SEARCH] Resposta direta encontrada.")
            return data['answer']
        
        # Se não vier a resposta mastigada, nós juntamos os resumos dos top 3 sites
        resultados = data.get('results', [])
        resumo = "\n".join([f"- {r.get('title')}: {r.get('content')}" for r in resultados])
        
        print("✅ [WEB SEARCH] Resumos de sites capturados.")
        return resumo if resumo else "Não encontrei resultados relevantes sobre isso na internet."
        
    except Exception as e:
        print(f"❌ Erro na pesquisa Tavily: {e}")
        return "Desculpe, ocorreu um erro ao pesquisar na internet."