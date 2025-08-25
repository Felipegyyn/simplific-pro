# src/redis_client.py
import os
import redis

# Pega a URL de conexão do Redis a partir das variáveis de ambiente do Render
redis_url = os.getenv('REDIS_URL')

if redis_url:
    # 'decode_responses=False' é importante para trabalharmos com bytes (nosso áudio)
    redis_client = redis.from_url(redis_url, decode_responses=False)
    print("Sucesso: Conectado ao Redis.")
else:
    redis_client = None
    print("AVISO: REDIS_URL não encontrada. O cache de áudio não funcionará.")