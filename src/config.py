# src/config.py
import os

# Pega o diretório do arquivo atual (src/config.py)
# /opt/render/project/src/src
current_dir = os.path.dirname(os.path.abspath(__file__))

# Sobe um nível para chegar na raiz do projeto (o primeiro 'src')
# /opt/render/project/src
project_root = os.path.dirname(current_dir)

# Cria o caminho para a pasta temp_audio a partir da raiz correta
# /opt/render/project/src/temp_audio
AUDIO_DIR = os.path.join(project_root, 'temp_audio')