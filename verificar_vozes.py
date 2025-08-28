# verificar_vozes.py

import os
import json
from dotenv import load_dotenv
from speechify import Speechify

# Carrega as variáveis de ambiente (como SPEECHIFY_API_KEY) do seu arquivo .env
print("Carregando variáveis de ambiente...")
load_dotenv()

SPEECHIFY_API_KEY = os.getenv('SPEECHIFY_API_KEY')
print(f"DEBUG: Verificando com a chave que termina em '...{SPEECHIFY_API_KEY[-4:]}'")

if not SPEECHIFY_API_KEY:
    print("\nERRO: A variável SPEECHIFY_API_KEY não foi encontrada no seu arquivo .env")
else:
    try:
        print("Inicializando cliente Speechify...")
        client = Speechify(token=SPEECHIFY_API_KEY)
        
        print("Buscando lista de vozes da API... (Isso pode levar um momento)")
        # A chamada à API que você encontrou na documentação!
        voices_response = client.tts.voices.list()
        
        print("\n--- VOZES EM PORTUGUÊS (BRASIL) ENCONTRADAS ---")
        
        pt_br_voices = []
        
        # A resposta pode ter uma estrutura aninhada, por isso usamos .get() para segurança
        all_voices = voices_response.get('data', {}).get('voices', [])

        for voice in all_voices:
            if voice.get('locale') == 'pt-BR':
                pt_br_voices.append(voice)
        
        if not pt_br_voices:
            print("Nenhuma voz em pt-BR foi encontrada para a sua chave de API.")
        else:
            print(f"Total de {len(pt_br_voices)} vozes encontradas para pt-BR:")
            for voice in pt_br_voices:
                # Imprime as informações mais importantes de forma clara
                print("-----------------------------------------")
                print(f"  Nome de Exibição: {voice.get('display_name')}")
                print(f"  ID (para usar no código): {voice.get('id')}") # <-- ESTE É O VALOR QUE QUEREMOS
                print(f"  Gênero: {voice.get('gender')}")
                print(f"  Tags: {voice.get('tags')}") # <-- Tags podem indicar se é 'premium', 'neural', etc.
        
        print("\n--- FIM DA LISTA ---")

    except Exception as e:
        print(f"\nOcorreu um erro ao conectar com a API da Speechify: {e}")