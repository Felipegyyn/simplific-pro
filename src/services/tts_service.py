# src/services/tts_service.py

import os
import uuid
import re
import base64
from speechify import Speechify
from src.config import AUDIO_DIR
from src.redis_client import redis_client

# --- Bloco de Inicialização Simplificado e Corrigido ---
speechify_client = None
SPEECHIFY_API_KEY = os.getenv('SPEECHIFY_API_KEY')

if SPEECHIFY_API_KEY:
    try:
        # Apenas inicializa o cliente com o token.
        speechify_client = Speechify(token=SPEECHIFY_API_KEY)
        print("Sucesso: Cliente Speechify inicializado.")
    except Exception as e:
        print(f"ERRO: Falha ao inicializar o cliente Speechify: {e}")
else:
    print("AVISO: SPEECHIFY_API_KEY não encontrada. O serviço de TTS não funcionará.")
# --- Fim do Bloco de Inicialização ---


def _limpar_texto_para_fala(texto: str) -> str:
    """
    Limpa o texto de caracteres que não devem ser falados.
    """
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+",
        flags=re.UNICODE,
    )
    texto_limpo = emoji_pattern.sub(r'', texto)
    texto_limpo = texto_limpo.replace('**', '').replace('*', '')
    return texto_limpo.strip()


def texto_para_audio(texto_para_falar: str) -> str:
    """
    Converte texto em áudio usando a chamada correta à API da Speechify.
    Retorna o nome do arquivo de áudio gerado.
    """
    if not speechify_client:
        print("ERRO CRÍTICO: Cliente Speechify não foi inicializado na partida do servidor.")
        return None

     # Adicione uma verificação para o cliente Redis
    if not redis_client:
        print("ERRO CRÍTICO: Cliente Redis não está conectado.")
        return None

    try:
        texto_limpo = _limpar_texto_para_fala(texto_para_falar)
        voice_to_use = "lucas" 
        print(f"Enviando texto para a API Speechify com a voice_id: '{voice_to_use}'")
        response = speechify_client.tts.audio.speech(
            input=texto_limpo,
            voice_id=voice_to_use,
            language='pt-BR',
            audio_format="mp3",
            

        )

        print(f"DEBUG: Resposta completa da Speechify recebida.") # Removido o print do objeto inteiro para não poluir os logs.
        audio_base64_string = response.audio_data

        print("String de áudio Base64 recebida da API Speechify.")

        decoded_audio_bytes = base64.b64decode(audio_base64_string)

        print(f"DEBUG: Tamanho do áudio decodificado (bytes): {len(decoded_audio_bytes)}")

        if not decoded_audio_bytes:
            print("ERRO: A API da Speechify retornou dados de áudio vazios.")
            return None

        # Gera um ID único para o áudio
        nome_arquivo = f"{uuid.uuid4()}.mp3"

        # --- LÓGICA PRINCIPAL ALTERADA ---
        # Em vez de salvar em um arquivo, salvamos no Redis com um tempo de expiração
        # de 5 minutos (300 segundos), que é mais que suficiente para o Twilio buscar.
        redis_client.set(nome_arquivo, decoded_audio_bytes, ex=300)
        print(f"Áudio salvo no Redis com a chave: {nome_arquivo}")

        return nome_arquivo

    except Exception as e:
        print(f"ERRO CRÍTICO ao gerar áudio com Speechify: {e}")
        return None