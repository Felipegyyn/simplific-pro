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
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Juntamos os resumos dos top sites E resgatamos as URLs!
        resultados = data.get('results', [])
        
        # Agora o texto que vai para a IA inclui o link de onde a informação foi tirada
        resumo = "\n\n".join([
            f"Título: {r.get('title')}\nConteúdo: {r.get('content')}\nLink da Fonte: {r.get('url')}" 
            for r in resultados
        ])
        
        # Se a Tavily der uma resposta mastigada, colocamos ela no topo, junto com os links
        resposta_direta = data.get('answer', '')
        if resposta_direta:
            resumo_final = f"Resposta da IA de Busca:\n{resposta_direta}\n\nFontes e Links Encontrados:\n{resumo}"
            print("✅ [WEB SEARCH] Resposta mastigada e links capturados.")
            return resumo_final
            
        print("✅ [WEB SEARCH] Apenas links e resumos capturados.")
        return resumo if resumo else "Não encontrei resultados relevantes sobre isso na internet."
        
    except Exception as e:
        print(f"❌ Erro na pesquisa Tavily: {e}")
        return "Desculpe, ocorreu um erro ao pesquisar na internet."