# src/services/image_service.py

import cloudinary
import cloudinary.uploader
import os

# Configuração do Cloudinary usando as variáveis de ambiente que definimos na Render
cloudinary.config(
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
  api_key = os.getenv("CLOUDINARY_API_KEY"),
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)

def upload_profile_image(file_to_upload, user_id):
    """
    Faz o upload de uma imagem para o Cloudinary, otimizando-a para um perfil.
    Retorna a URL da imagem otimizada em caso de sucesso, ou None em caso de erro.
    """
    try:
        # Faz o upload da imagem com algumas otimizações inteligentes:
        # - public_id: cria uma pasta única para cada usuário para evitar conflitos de nome.
        # - overwrite: permite que o usuário envie uma nova foto por cima da antiga.
        # - transformation: redimensiona a imagem para um quadrado de 400x400 (perfeito para perfil)
        #   e otimiza a qualidade da imagem automaticamente.
        upload_result = cloudinary.uploader.upload(
            file_to_upload,
            public_id=f"simplific-pro/users/{user_id}/profile_pic",
            overwrite=True,
            transformation=[
                {'width': 400, 'height': 400, 'crop': 'fill', 'gravity': 'face'},
                {'quality': 'auto'}
            ]
        )
        # Retorna a URL segura da imagem já otimizada.
        return upload_result.get('secure_url')
    except Exception as e:
        print(f"ERRO no upload para o Cloudinary: {e}")
        return None