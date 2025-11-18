# src/utils/storage.py

import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv
import requests # <-- ADICIONE ESTA IMPORTAÇÃO

# Carrega as variáveis de ambiente (necessário se este script for executado fora do app Flask)
load_dotenv()

# Configuração do Cloudinary
# O main.py já faz isso, mas é uma boa prática garantir que o 
# serviço tenha a configuração caso seja importado em outro contexto.
# Ele lerá as mesmas variáveis de ambiente (CLOUDINARY_CLOUD_NAME, etc.)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# ▼▼▼ SUBSTITUA A FUNÇÃO INTEIRA POR ESTA ▼▼▼
def upload_image_from_url(image_url, folder_name="comprovantes"):
    """
    Baixa uma imagem de uma URL protegida (Twilio) usando autenticação
    e faz o upload dos bytes para o Cloudinary.
    
    Retorna a URL segura (permanente) ou None em caso de falha.
    """
    print(f"Iniciando upload para Cloudinary da URL: {image_url}")

    # --- Pega as credenciais da Twilio do ambiente ---
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')

    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        print("ERRO CRÍTICO (Storage): Credenciais TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN não configuradas.")
        return None

    try:
        # --- Passo 1: Baixar a imagem primeiro (com autenticação) ---
        print("Baixando imagem da Twilio com autenticação...")
        response = requests.get(
            image_url,
            auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN), # Autenticação aqui
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"Falha ao baixar a imagem da Twilio (Storage). Status: {response.status_code}")
            return None
        
        image_bytes = response.content # Pega os bytes da imagem
        
        # --- Passo 2: Fazer o upload dos BYTES para o Cloudinary ---
        print("Enviando bytes da imagem para o Cloudinary...")
        upload_result = cloudinary.uploader.upload(
            image_bytes, # <-- MUDANÇA CRÍTICA: enviamos os bytes, não a URL
            folder=folder_name,
            resource_type="image"
        )
        
        secure_url = upload_result.get('secure_url')
        
        if not secure_url:
            print("Erro no Cloudinary: Upload bem-sucedido, mas sem secure_url.")
            return None
            
        print(f"Cloudinary: Upload concluído. URL permanente: {secure_url}")
        return secure_url
    
    except requests.exceptions.RequestException as e:
        print(f"Erro de rede ao baixar a imagem da Twilio (Storage): {e}")
        return None
    except Exception as e:
        # Captura erros de API do Cloudinary
        print(f"Erro inesperado no upload para Cloudinary: {e}")
        return None