# src/services/ocr_service.py

import requests
from google.cloud import vision
import io
import os

def extract_text_from_url(image_url):
    """
    Recebe a URL de uma imagem (ex: da Twilio), baixa-a e usa a API 
    do Google Vision para extrair o texto bruto dela.
    
    Retorna o texto extraído ou None em caso de falha.
    """
    print(f"Iniciando OCR para a imagem em: {image_url}")

    # ▼▼▼ BLOCO DE MUDANÇA ▼▼▼
    try:
        # --- Pega as credenciais da Twilio do ambiente ---
        TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
        TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')

        if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
            print("ERRO CRÍTICO (OCR): Credenciais TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN não configuradas.")
            return None

        # --- Passo 1: Fazer o download da imagem (COM AUTENTICAÇÃO) ---
        print("Baixando imagem da Twilio com autenticação...")
        response = requests.get(
            image_url, 
            auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN), # <-- A MUDANÇA MÁGICA
            timeout=10
        )
    # ▲▲▲ FIM DO BLOCO DE MUDANÇA ▲▲▲
        
        # Verifica se o download foi bem-sucedido
        if response.status_code != 200:
            print(f"Falha ao baixar a imagem. Status: {response.status_code} {response.text}") # Adiciona .text para ver o erro
            return None
        
        # Carrega o conteúdo (bytes) da imagem em memória
        image_content = response.content

        # --- Passo 2: Chamar a API do Google Vision ---
        
        # Instancia o cliente do Google Vision.
        # Ele automaticamente encontrará as credenciais pela variável
        # de ambiente 'GOOGLE_APPLICATION_CREDENTIALS' que configuramos no Render.
        client = vision.ImageAnnotatorClient()

        # Cria o objeto de imagem que a API do Google entende
        image = vision.Image(content=image_content)

        # Chama a API para detecção de texto (OCR)
        # 'text_detection' é otimizado para texto denso (como recibos)
        print("Chamando Google Vision API para detecção de texto...")
        response_vision = client.text_detection(image=image)

        # --- Passo 3: Processar a Resposta ---
        
        # Verifica se a API retornou algum erro
        if response_vision.error.message:
            print(f"Erro na API do Google Vision: {response_vision.error.message}")
            return None

        # Pega a anotação de texto completo (todo o texto encontrado na imagem)
        texto_extraido = response_vision.full_text_annotation.text
        
        if not texto_extraido:
            print("OCR concluído, mas nenhum texto foi encontrado na imagem.")
            return None

        print(f"OCR concluído com sucesso. Texto extraído:\n---\n{texto_extraido[:200]}...\n---")
        return texto_extraido

    except requests.exceptions.RequestException as e:
        print(f"Erro de rede ao baixar a imagem: {e}")
        return None
    except Exception as e:
        # Captura qualquer outro erro (ex: falha na API do Google)
        print(f"Erro inesperado no ocr_service: {e}")
        return None