# src/services/tts_service.py

import os
import uuid
import re
from speechify import Speechify

# Inicializa o cliente da Speechify com a chave do ambiente
SPEECHIFY_API_KEY = os.getenv('SPEECHIFY_API_KEY')
speechify_client = None
if SPEECHIFY_API_KEY:
    try:
        speechify_client = Speechify(token=SPEECHIFY_API_KEY)
    except Exception as e:
        print(f"ERRO: Falha ao inicializar o cliente Speechify: {e}")
else:
    print("AVISO: SPEECHIFY_API_KEY não encontrada. O serviço de TTS não funcionará.")

def _limpar_texto_para_fala(texto: str) -> str:
    """
    Limpa o texto de caracteres que não devem ser falados, como emojis e markdown.
    As vozes da Speechify já são boas em interpretar pontuação para dar ritmo.
    """
    # 1. Remove emojis
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

    # 2. Remove asteriscos de markdown (negrito/itálico)
    texto_limpo = texto_limpo.replace('**', '').replace('*', '')

    return texto_limpo.strip()

def texto_para_audio(texto_para_falar: str) -> str:
    """
    Converte uma string de texto em um arquivo de áudio MP3 usando a API da Speechify.
    Retorna o nome do arquivo gerado.
    """
    if not speechify_client:
        print("ERRO CRÍTICO: Cliente Speechify não inicializado.")
        return None

    try:
        # 1. Limpa o texto vindo do Gemini
        texto_limpo = _limpar_texto_para_fala(texto_para_falar)

        print(f"Enviando texto para a API Speechify: '{texto_limpo}'")

        response = speechify_client.tts.audio.speech(
            input=texto_limpo,
            voice_id="Vitoria", # Usando uma voz feminina pt-BR popular para garantir
        )

        # A resposta da biblioteca já são os bytes do áudio
        audio_bytes = response

        # Gera o áudio. A biblioteca cuida de fazer a chamada e retornar os bytes do áudio.
        audio_bytes = speechify_client.generate_audio_bytes(text=texto_limpo, voice=voice_params)
        print("Arquivo de áudio recebido da API Speechify.")

        # 3. Salva o arquivo de áudio temporariamente
        nome_arquivo = f"{uuid.uuid4()}.mp3"
        caminho_completo = os.path.join("src", "temp_audio", nome_arquivo)
        os.makedirs(os.path.dirname(caminho_completo), exist_ok=True)

        with open(caminho_completo, "wb") as out:
            out.write(audio_bytes)
            print(f"Arquivo de áudio salvo em: {caminho_completo}")

        return nome_arquivo

    except Exception as e:
        print(f"ERRO CRÍTICO ao gerar áudio com Speechify: {e}")
        return None