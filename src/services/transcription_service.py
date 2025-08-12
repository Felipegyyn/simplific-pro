# src/services/transcription_service.py

import requests
from google.cloud import speech

def transcrever_audio_de_url(audio_url: str) -> str:
    """
    Baixa um arquivo de áudio de uma URL e o transcreve usando a API Google Speech-to-Text.
    """
    print(f"Iniciando transcrição para a URL: {audio_url}")

    try:
        # 1. Baixar o conteúdo do áudio em memória
        # A Twilio envia áudios em formato ogg/opus, que o Google Speech-to-Text suporta
        response = requests.get(audio_url)
        response.raise_for_status()  # Gera um erro se o download falhar
        audio_content = response.content
        print("Download do áudio concluído.")

        # 2. Configurar o cliente da API Speech-to-Text
        client = speech.SpeechClient()

        # 3. Preparar o áudio e a configuração da transcrição
        audio = speech.RecognitionAudio(content=audio_content)
        
        config = speech.RecognitionConfig(
            # O codec 'OPUS' é o padrão para áudios do WhatsApp via Twilio
            # O sample_rate_hertz de 16000 é também padrão para o codec OPUS
            encoding=speech.RecognitionConfig.AudioEncoding.OGG_OPUS,
            sample_rate_hertz=16000,
            language_code="pt-BR",  # Especifica o idioma para maior precisão
            model="default" # Modelo padrão é ótimo para conversas gerais
        )

        # 4. Chamar a API para realizar a transcrição
        print("Enviando áudio para a API do Google Speech-to-Text...")
        response = client.recognize(config=config, audio=audio)
        print("Resposta da API recebida.")

        # 5. Extrair e retornar o texto transcrito
        if response.results:
            transcricao = response.results[0].alternatives[0].transcript
            print(f"Texto transcrito: '{transcricao}'")
            return transcricao
        else:
            print("Nenhum texto foi transcrito do áudio.")
            return ""

    except requests.exceptions.RequestException as e:
        print(f"Erro ao baixar o áudio da URL: {e}")
        return ""
    except Exception as e:
        print(f"Ocorreu um erro inesperado durante a transcrição: {e}")
        return ""