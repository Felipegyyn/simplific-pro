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
    # ADICIONE ESTAS DUAS LINHAS EXATAMENTE AQUI
    print("---------- CABEÇALHOS RECEBIDOS DA MONETIZZE ----------")
    print(request.headers)
    """
    Este é o nosso "Portão de Entrada". Ele recebe os dados da Monetizze
    após uma venda ser aprovada.
    """
    # --- PASSO DE SEGURANÇA ---
    chave_recebida = request.headers.get('X-Monetizze-Signature')

    if not MONETIZZE_SECRET_KEY or chave_recebida != MONETIZZE_SECRET_KEY:
        print("AVISO DE SEGURANÇA: Tentativa de acesso ao webhook da Monetizze com chave inválida.")
        return jsonify({'status': 'error', 'message': 'Acesso não autorizado'}), 401

    # --- PROCESSAMENTO DOS DADOS ---
    dados_cliente = request.json
    print("✅ Webhook da Monetizze recebido com sucesso!")
    print("Dados do cliente:", dados_cliente)

    nome = dados_cliente.get('nome')
    email = dados_cliente.get('email')
    whatsapp = dados_cliente.get('celular')

    # --- CHAMADA PARA A FÁBRICA DE USUÁRIOS (FASE 3) ---
    success, result = create_user_from_purchase(nome, email, whatsapp)

    if success:
        # 'result' aqui contém os dados do usuário e a senha provisória
        print("Usuário criado. Acionando central de notificações...")
        # Chama a função da Fase 4 para enviar o WhatsApp e o E-mail
        send_welcome_credentials(result)
    else:
        # 'result' aqui contém a mensagem de erro
        print(f"Falha ao criar usuário: {result}")

    # Responde à Monetizze que recebemos os dados com sucesso.
    return jsonify({'status': 'success', 'message': 'Webhook recebido'}), 200
