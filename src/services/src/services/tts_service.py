# src/services/tts_service.py

import os
import uuid
from google.cloud import texttospeech

def texto_para_audio(texto_para_falar: str) -> str:
    """
    Converte uma string de texto em um arquivo de áudio MP3 usando a API do Google TTS
    e o salva em uma pasta temporária.
    Retorna o nome do arquivo gerado.
    """
    try:
        client = texttospeech.TextToSpeechClient()

        synthesis_input = texttospeech.SynthesisInput(text=texto_para_falar)

        # Configura a voz. As vozes WaveNet são de alta qualidade e muito naturais.
        voice = texttospeech.VoiceSelectionParams(
            language_code="pt-BR",
            name="pt-BR-Wavenet-B" # Uma ótima voz masculina para o Brasil
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        print(f"Enviando texto para a API TTS: '{texto_para_falar}'")
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
        print("Arquivo de áudio recebido da API.")

        # Gera um nome de arquivo único para evitar sobreposições
        nome_arquivo = f"{uuid.uuid4()}.mp3"
        caminho_completo = os.path.join("src", "temp_audio", nome_arquivo)

        # Garante que o diretório exista
        os.makedirs(os.path.dirname(caminho_completo), exist_ok=True)

        # Salva o conteúdo do áudio no arquivo
        with open(caminho_completo, "wb") as out:
            out.write(response.audio_content)
            print(f"Arquivo de áudio salvo em: {caminho_completo}")

        return nome_arquivo

    except Exception as e:
        print(f"ERRO CRÍTICO ao gerar áudio: {e}")
        return None