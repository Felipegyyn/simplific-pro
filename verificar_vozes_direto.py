# verificar_vozes_direto.py

import os
import requests
from dotenv import load_dotenv

# Carrega a variável SPEECHIFY_API_KEY do seu arquivo .env
load_dotenv()
API_KEY = os.getenv('SPEECHIFY_API_KEY')

if not API_KEY:
    print("ERRO: SPEECHIFY_API_KEY não encontrada no arquivo .env")
else:
    print(f"Tentando autenticar com a chave que termina em '...{API_KEY[-4:]}'")

    # URL do endpoint que queremos acessar (conforme a documentação que você achou)
    url = "https://api.sws.speechify.com/v1/voices"

    # Cabeçalho de autorização, exatamente como a documentação pede
    headers = {
        "Authorization": f"Bearer {API_KEY}"
    }

    try:
        # Faz a requisição GET
        response = requests.get(url, headers=headers)

        # Verifica se a requisição foi bem-sucedida (código 200)
        if response.status_code == 200:
            data = response.json()
            voices = data.get('data', {}).get('voices', [])
            
            print("\n--- SUCESSO! VOZES EM PORTUGUÊS (BRASIL) ENCONTRADAS ---")
            
            pt_br_voices = [v for v in voices if v.get('locale') == 'pt-BR']

            if not pt_br_voices:
                print("Nenhuma voz em pt-BR foi encontrada para a sua chave de API.")
            else:
                for voice in pt_br_voices:
                    print("-----------------------------------------")
                    print(f"  Nome de Exibição: {voice.get('display_name')}")
                    print(f"  ID (para usar no código): {voice.get('id')}")
                    print(f"  Gênero: {voice.get('gender')}")
                    print(f"  Tags: {voice.get('tags')}")
            
            print("\n--- FIM DA LISTA ---")

        else:
            # Imprime o erro caso não seja 200 OK
            print(f"\nERRO: A API retornou um status inesperado.")
            print(f"Status Code: {response.status_code}")
            print(f"Corpo da Resposta: {response.text}")

    except Exception as e:
        print(f"Ocorreu um erro de conexão: {e}")