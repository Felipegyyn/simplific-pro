# src/utils/storage.py

import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

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

def upload_image_from_url(image_url, folder_name="comprovantes"):
    """
    Recebe a URL de uma imagem (ex: da Twilio) e faz o upload
    diretamente para o Cloudinary em uma pasta específica.
    
    Retorna a URL segura (permanente) do Cloudinary ou None em caso de falha.
    """
    print(f"Iniciando upload para Cloudinary da URL: {image_url}")
    
    try:
        # A função 'upload' do Cloudinary é inteligente o suficiente
        # para baixar a imagem da URL e salvá-la diretamente.
        upload_result = cloudinary.uploader.upload(
            image_url,
            folder=folder_name,
            resource_type="image"  # Garante que estamos enviando uma imagem
        )
        
        # Pega a URL segura (https://)
        secure_url = upload_result.get('secure_url')
        
        if not secure_url:
            print("Erro no Cloudinary: Upload bem-sucedido, mas sem secure_url.")
            return None
            
        print(f"Cloudinary: Upload concluído. URL permanente: {secure_url}")
        return secure_url
        
    except Exception as e:
        # Captura erros de API do Cloudinary ou falhas de download
        print(f"Erro inesperado no upload para Cloudinary: {e}")
        return None