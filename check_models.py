import os
import google.generativeai as genai
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env (incluindo a GEMINI_API_KEY)
load_dotenv()

print("--- Verificador de Modelos Gemini ---")

try:
    # Pega a chave do ambiente
    api_key = os.getenv('GEMINI_API_KEY')

    if not api_key:
        print("ERRO: A variável GEMINI_API_KEY não foi encontrada no seu arquivo .env.")
    else:
        # Configura a biblioteca com sua chave
        genai.configure(api_key=api_key)
        
        print("\nBuscando modelos disponíveis que suportam 'generateContent'...\n")
        
        found_model = False
        # Itera sobre todos os modelos disponíveis na sua conta
        for model in genai.list_models():
            # Verifica se o método 'generateContent' está na lista de métodos suportados pelo modelo
            if 'generateContent' in model.supported_generation_methods:
                print(f"-> Modelo encontrado: {model.name}")
                found_model = True

        if not found_model:
            print("\nNenhum modelo compatível encontrado. Verifique se sua chave de API está correta e tem acesso aos modelos Generative Language.")

except Exception as e:
    print(f"\nOcorreu um erro ao tentar se conectar à API do Gemini: {e}")
    print("Por favor, verifique se a sua GEMINI_API_KEY está correta no arquivo .env e se você instalou a biblioteca com 'pip install google-generativeai'.")

