# Em src/celery_worker.py

from celery import Celery
from src.main import app as flask_app # Importa o 'app' que o main.py criou

def make_celery(app):
    """
    Cria e configura uma instância do Celery, envolvendo as tarefas
    no contexto da aplicação Flask.
    """
    # Cria a instância do Celery, lendo a config do app Flask
    celery = Celery(
        app.import_name,
        broker=app.config['CELERY_BROKER_URL'],
        backend=app.config['CELERY_RESULT_BACKEND']
    )
    celery.conf.update(app.config)

    # Esta é a "mágica" que resolve o erro 'Working outside of application context'
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

# Cria a instância 'celery' que será importada por outros arquivos
celery = make_celery(flask_app)