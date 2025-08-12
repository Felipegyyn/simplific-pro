import re # <-- ADICIONE NO TOPO
import os
import uuid
from google.cloud import texttospeech

def preparar_texto_para_ssml(texto: str) -> str:
    """
    Limpa o texto de caracteres de chat (emojis, markdown) e o envolve em tags SSML
    para uma fala mais natural.
    """
    # 1. Remove emojis usando uma expressão regular
    # Esta regex pega a maioria dos emojis comuns
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

    # 2. Converte markdown de negrito (**) em ênfase de fala
    # A tag <emphasis> faz a voz dar mais força à palavra
    texto_limpo = re.sub(r'\*\*(.*?)\*\*', r'<emphasis level="strong">\1</emphasis>', texto_limpo)

    # 3. Adiciona pausas sutis para um ritmo mais humano
    # Troca vírgulas por uma pequena pausa e pontos finais por uma pausa maior.
    texto_limpo = texto_limpo.replace(',', '<break time="300ms"/>')
    texto_limpo = texto_limpo.replace('.', '<break time="600ms"/>')
    texto_limpo = texto_limpo.replace('!', '<break time="700ms"/>')
    texto_limpo = texto_limpo.replace('?', '<break time="700ms"/>')

    # 4. Envolve o texto final nas tags SSML necessárias
    ssml = f'<speak><prosody rate="1.15">{texto_limpo}</prosody></speak>'
    
    return ssml

def texto_para_audio(texto_para_falar: str) -> str:
    """
    Converte uma string de texto em um arquivo de áudio MP3,
    usando SSML para uma fala mais natural.
    """
    try:
        # 1. PREPARA O TEXTO USANDO NOSSA NOVA FUNÇÃO
        ssml_input = preparar_texto_para_ssml(texto_para_falar)

        client = texttospeech.TextToSpeechClient()

        # 2. A SÍNTESE AGORA É BASEADA EM SSML, NÃO EM TEXTO PURO
        synthesis_input = texttospeech.SynthesisInput(ssml=ssml_input)

        # 3. SELECIONA UMA VOZ "WAVENET" (QUALIDADE PREMIUM)
        # A voz 'pt-BR-Wavenet-C' é uma voz feminina de alta qualidade.
        # Experimente também 'A', 'B' (masculina) e 'D' (masculina) para ver qual agrada mais.
        voice = texttospeech.VoiceSelectionParams(
            language_code="pt-BR",
            name="pt-BR-Wavenet-D" 
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        print(f"Enviando SSML para a API TTS: '{ssml_input}'")
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
        print("Arquivo de áudio recebido da API.")

        nome_arquivo = f"{uuid.uuid4()}.mp3"
        caminho_completo = os.path.join("src", "temp_audio", nome_arquivo)
        os.makedirs(os.path.dirname(caminho_completo), exist_ok=True)

        with open(caminho_completo, "wb") as out:
            out.write(response.audio_content)
            print(f"Arquivo de áudio salvo em: {caminho_completo}")

        return nome_arquivo

    except Exception as e:
        print(f"ERRO CRÍTICO ao gerar áudio: {e}")
        return None