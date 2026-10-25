# src/services/search_service.py

import os
import requests
import re
from urllib.parse import urlparse

TAVILY_API_KEY = os.getenv('TAVILY_API_KEY')

# Cache das últimas pesquisas estruturadas com imagens por usuário
_ultimas_pesquisas_cache = {}

def get_dominio_url(url):
    """Extrai o domínio limpo de uma URL (ex: booking.com)."""
    try:
        parsed = urlparse(url)
        netloc = parsed.netloc.replace('www.', '')
        return netloc or url
    except Exception:
        return url

def _obter_imagem_fallback(query, index=0):
    """Gera uma imagem de fallback temática de alta resolução quando a pesquisa não traz foto direta."""
    q = query.lower()
    if any(k in q for k in ['hotel', 'pousada', 'hospedagem', 'resort', 'diaria', 'quarto']):
        hotel_images = [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"
        ]
        return hotel_images[index % len(hotel_images)]
    elif any(k in q for k in ['passagem', 'voo', 'aviao', 'aeroporto', 'viagem']):
        flight_images = [
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80"
        ]
        return flight_images[index % len(flight_images)]
    elif any(k in q for k in ['iphone', 'celular', 'smartphone', 'computador', 'notebook', 'macbook', 'ps5']):
        tech_images = [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80"
        ]
        return tech_images[index % len(tech_images)]
    elif any(k in q for k in ['carro', 'veiculo', 'moto', 'financiamento']):
        car_images = [
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"
        ]
        return car_images[index % len(car_images)]
    
    # Genérico elegante
    generic_images = [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
    ]
    return generic_images[index % len(generic_images)]

def extrair_preco(texto):
    """Tenta identificar menções de preços (ex: R$ 450,00 ou $99)."""
    if not texto:
        return None
    match = re.search(r'(?:R\$\s*[\d\.,]+(?:\s*\/\s*(?:noite|di[aá]ria|m[eê]s|ano))?|\$\s*[\d\.,]+)', texto, re.IGNORECASE)
    if match:
        return match.group(0).strip()
    return None

def realizar_pesquisa_web(query, user_id=None):
    """
    Bate na API da Tavily com suporte a imagens e links estruturados.
    Salva os cards com imagem no cache do usuário para o Vision renderizar.
    """
    if not TAVILY_API_KEY:
        print("❌ AVISO: TAVILY_API_KEY não encontrada no .env")
        cards_mock = [{
            "title": f"Pesquisa sobre: {query}",
            "url": "https://google.com/search?q=" + requests.utils.quote(query),
            "snippet": f"Resultados para a busca '{query}'.",
            "image_url": _obter_imagem_fallback(query, 0),
            "domain": "google.com",
            "price": None
        }]
        if user_id:
            _ultimas_pesquisas_cache[str(user_id)] = cards_mock
        return f"Não consegui consultar a internet no momento (chave TAVILY ausente). Mas aqui estão informações sobre '{query}'."

    url = "https://api.tavily.com/search"
    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "basic",
        "include_answer": True,
        "include_images": True,
        "max_results": 4
    }

    try:
        print(f"🌍 [WEB SEARCH] Buscando com imagens: '{query}'")
        response = requests.post(url, json=payload, timeout=12)
        response.raise_for_status()
        data = response.json()

        resultados = data.get('results', [])
        imagens_tavily = data.get('images', [])

        cards_estruturados = []
        for idx, r in enumerate(resultados):
            titulo = r.get('title', '')
            link = r.get('url', '')
            conteudo = r.get('content', '')
            
            # Tenta pegar imagem da Tavily ou cai no fallback temático
            img_url = None
            if idx < len(imagens_tavily):
                item_img = imagens_tavily[idx]
                img_url = item_img if isinstance(item_img, str) else item_img.get('url')
            
            if not img_url:
                img_url = _obter_imagem_fallback(query, idx)

            preco = extrair_preco(conteudo) or extrair_preco(titulo)
            
            cards_estruturados.append({
                "title": titulo,
                "url": link,
                "snippet": (conteudo[:160] + "...") if len(conteudo) > 160 else conteudo,
                "image_url": img_url,
                "domain": get_dominio_url(link),
                "price": preco
            })

        # Salva os cards estruturados para o Vision
        if user_id:
            _ultimas_pesquisas_cache[str(user_id)] = cards_estruturados

        # Monta o resumo em texto super enxuto para o LLM não estourar o limite de tokens do provedor gratuito
        resumo = "\n".join([
            f"- {c['title']} | Preço: {c['price'] or 'Sob consulta'} | Link: {c['url']}"
            for c in cards_estruturados[:3]
        ])

        resposta_direta = data.get('answer', '')
        if resposta_direta:
            return f"{resposta_direta[:180]}\n\nPrincipais opções:\n{resumo}"

        return resumo if resumo else "Encontrei opções na internet e anexei nos cards visuais."

    except Exception as e:
        print(f"❌ Erro na pesquisa Tavily: {e}")
        return "Desculpe, ocorreu uma oscilação na pesquisa pela internet no momento."

def obter_ultimos_cards_pesquisa(user_id):
    """Recupera os cards visuais da última pesquisa feita para o usuário e limpa o cache."""
    return _ultimas_pesquisas_cache.pop(str(user_id), None)