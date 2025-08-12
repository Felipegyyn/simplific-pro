import os # <-- ADICIONE ESTA IMPORTAÇÃO
import requests
from google.cloud import speech

def transcrever_audio_de_url(audio_url: str) -> str:
    """
    Baixa um arquivo de áudio de uma URL e o transcreve usando a API Google Speech-to-Text.
    """
    print(f"Iniciando transcrição para a URL: {audio_url}")

    # --- INÍCIO DA CORREÇÃO ---
    # Carrega as credenciais da Twilio a partir das variáveis de ambiente
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    # --- FIM DA CORREÇÃO ---

    try:
        # 1. Baixar o conteúdo do áudio em memória, AGORA COM AUTENTICAÇÃO
        # O parâmetro 'auth' envia o SID e o Token para a Twilio
        response = requests.get(audio_url, auth=(account_sid, auth_token))
        response.raise_for_status()
        audio_content = response.content
        print("Download do áudio concluído com sucesso.")

        # O resto da função continua exatamente igual...
        client = speech.SpeechClient()
        audio = speech.RecognitionAudio(content=audio_content)
        
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.OGG_OPUS,
            sample_rate_hertz=16000,
            language_code="pt-BR",
            model="default"
        )

        print("Enviando áudio para a API do Google Speech-to-Text...")
        response = client.recognize(config=config, audio=audio)
        print("Resposta da API recebida.")

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