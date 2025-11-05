# src/celery_worker.py
from celery import Celery

# Cria a instância base do Celery.
# O 'main' será o nome do módulo principal (src.main).
# Outros arquivos (como tasks.py) vão importar esta variável 'celery'.
celery = Celery('src.main')

import src.tasks