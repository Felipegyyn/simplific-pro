# src/services/tts_service.py

import os
import uuid
import re
import base64
from speechify import Speechify
from src.main import AUDIO_DIR

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

    try:
        texto_limpo = _limpar_texto_para_fala(texto_para_falar)
        
        # Usando a voz "Oliver" em minúsculas, como você descobriu ser o ID correto.
        voice_to_use = "oliver" 

        print(f"Enviando texto para a API Speechify com a voice_id: '{voice_to_use}'")

        # Chamada final, correta e simplificada.
        response = speechify_client.tts.audio.speech(
            input=texto_limpo,
            voice_id=voice_to_use 
        )

        print(f"DEBUG: Resposta completa da Speechify recebida.") # Removido o print do objeto inteiro para não poluir os logs.
        audio_base64_string = response.audio_data

        print("String de áudio Base64 recebida da API Speechify.")

        # Decodifica a string Base64 para o formato binário (bytes)
        decoded_audio_bytes = base64.b64decode(audio_base64_string)

        # Salva o arquivo com a extensão .wav
        nome_arquivo = f"{uuid.uuid4()}.wav" # <-- ALTERAÇÃO AQUI
        caminho_completo = os.path.join(AUDIO_DIR, nome_arquivo)
        
        os.makedirs(os.path.dirname(caminho_completo), exist_ok=True)

        with open(caminho_completo, "wb") as out:
            out.write(decoded_audio_bytes)
            print(f"Arquivo de áudio salvo em: {caminho_completo}")

        return nome_arquivo

    except Exception as e:
        print(f"ERRO CRÍTICO ao gerar áudio com Speechify: {e}")
        return None