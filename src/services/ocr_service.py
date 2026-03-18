# src/services/ocr_service.py

import requests
from google.cloud import vision
import fitz  # <-- MÁGICA PARA LER PDFs
import io
import os

import requests
from google.cloud import vision
import fitz  # <-- MÁGICA PARA LER PDFs
import io
import os

def extract_text_from_url(image_url):
    """
    Baixa o arquivo da Twilio. 
    Se for PDF, usa PyMuPDF para extração perfeita.
    Se for Imagem, usa Google Vision.
    """
    print(f"Iniciando extração para a mídia em: {image_url}")

    try:
        TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
        TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')

        if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
            print("ERRO CRÍTICO: Credenciais Twilio não configuradas.")
            return None

        print("Baixando arquivo da Twilio com autenticação...")
        response = requests.get(
            image_url, 
            auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
            timeout=15
        )
        
        if response.status_code != 200:
            print(f"Falha ao baixar o arquivo. Status: {response.status_code}")
            return None
        
        content_type = response.headers.get('Content-Type', '').lower()

        # ▼▼▼ SE FOR PDF (Usa PyMuPDF - Instantâneo e Perfeito) ▼▼▼
        if 'pdf' in content_type or '.pdf' in image_url.lower():
            print("INFO: Arquivo PDF detectado. Extraindo texto nativo...")
            try:
                documento = fitz.open(stream=response.content, filetype="pdf")
                texto_extraido = "\n".join(pagina.get_text() for pagina in documento)
                print(f"OCR PDF concluído. Texto:\n{texto_extraido[:200]}...")
                return texto_extraido
            except Exception as e:
                print(f"Erro ao extrair texto do PDF: {e}")
                return None
        # ▲▲▲ FIM DA LEITURA DE PDF ▲▲▲

        # ▼▼▼ SE FOR IMAGEM (Usa Google Vision) ▼▼▼
        print("INFO: Imagem detectada. Extraindo texto com Google Vision...")
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=response.content)
        response_vision = client.text_detection(image=image)

        if response_vision.error.message:
            print(f"Erro no Google Vision: {response_vision.error.message}")
            return None

        texto_extraido = response_vision.full_text_annotation.text
        
        if not texto_extraido:
            print("Vision não encontrou texto na imagem.")
            return None

        print(f"OCR Imagem concluído. Texto:\n{texto_extraido[:200]}...")
        return texto_extraido

    except Exception as e:
        print(f"Erro inesperado no ocr_service: {e}")
        return None