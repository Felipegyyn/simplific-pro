from flask import Blueprint, request, jsonify
import os
from src.services.user_service import create_user_from_purchase
from src.services.notification_service import send_welcome_credentials



# Cria um novo "Blueprint". Pense nele como um conjunto de rotas.
webhooks_bp = Blueprint('webhooks', __name__)

# Pega a chave secreta que vamos configurar no nosso arquivo .env
MONETIZZE_SECRET_KEY = os.getenv('MONETIZZE_SECRET_KEY')

@webhooks_bp.route('/monetizze', methods=['POST'])
def monetizze_webhook():
    """
    Este é o nosso "Portão de Entrada". Ele recebe os dados da Monetizze
    após uma venda ser aprovada.
    """
    # --- PROCESSAMENTO INICIAL DOS DADOS ---
    # Primeiro, pegamos todos os dados que a Monetizze enviou no corpo (body)
    dados_completos = request.json
    print("✅ Webhook da Monetizze recebido!")
    print("Dados completos recebidos:", dados_completos)

    # --- PASSO DE SEGURANÇA CORRIGIDO ---
    # Agora, procuramos a chave DENTRO dos dados que recebemos
    chave_recebida = dados_completos.get('chave_unica')

    if not MONETIZZE_SECRET_KEY or chave_recebida != MONETIZZE_SECRET_KEY:
        print("AVISO DE SEGURANÇA: Tentativa de acesso ao webhook da Monetizze com chave inválida.")
        print(f"Chave Esperada (do Render): {MONETIZZE_SECRET_KEY}")
        print(f"Chave Recebida (da Monetizze): {chave_recebida}")
        return jsonify({'status': 'error', 'message': 'Acesso não autorizado'}), 401

    # --- PROCESSAMENTO DOS DADOS DO CLIENTE ---
    # Se a chave é válida, continuamos com a sua lógica original
    comprador = dados_completos.get('comprador', {})
    nome = comprador.get('nome')
    email = comprador.get('email')
    whatsapp = comprador.get('telefone')

    # --- CHAMADA PARA A FÁBRICA DE USUÁRIOS ---
    success, result = create_user_from_purchase(nome, email, whatsapp)

    if success:
        print("Usuário criado. Acionando central de notificações...")
        send_welcome_credentials(result)
    else:
        print(f"Falha ao criar usuário: {result}")

    # Responde à Monetizze que recebemos os dados com sucesso.
    return jsonify({'status': 'success', 'message': 'Webhook recebido'}), 200