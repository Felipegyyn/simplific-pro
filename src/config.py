# src/config.py
import os

# Define um caminho absoluto e seguro para o diretório de áudio,
# que pode ser usado por qualquer parte da aplicação.
AUDIO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp_audio')