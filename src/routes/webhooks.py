from flask import Blueprint, request, jsonify
import os
from src.services.user_service import create_user_from_purchase
from src.services.notification_service import send_welcome_credentials
from src.models.user import User
from src.models.db import db
from src.services.user_service import create_user_from_purchase, normalize_phone_number
from datetime import datetime



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

    # --- PASSO 1: Extrair o tipo de evento e os dados do comprador ---
    evento_descricao = dados_completos.get('tipoEvento', {}).get('descricao')
    comprador = dados_completos.get('comprador', {})
    email = comprador.get('email')

    # Se não houver e-mail na notificação, não há o que fazer.
    if not email:
        print("Webhook recebido sem e-mail do comprador. Ignorando.")
        return jsonify({'status': 'success', 'message': 'Webhook ignorado (sem e-mail)'}), 200

    # --- PASSO 2: Lógica principal baseada no tipo de evento ---
    if evento_descricao == 'Finalizada / Aprovada':
        print(f"Evento 'Finalizada / Aprovada' para o e-mail: {email}.")
        nome = comprador.get('nome')
        telefone_bruto = comprador.get('telefone')
        whatsapp = normalize_phone_number(telefone_bruto) # <-- ADICIONE A NORMALIZAÇÃO AQUI


        user = User.query.filter_by(email=email).first()

        if user:
            # Caso 1: Usuário já existe (ex: re-assinatura)
            # Reativamos o status e limpamos a data de expiração.
            user.status = 'ativo'
            user.subscription_valid_until = None
            db.session.commit()
            print(f"Assinatura reativada para o usuário existente: {email}")
        else:
            # Caso 2: Novo cliente
            # Usamos a função que já existe para criar o usuário e enviar as credenciais.
            success, result = create_user_from_purchase(nome, email, whatsapp)
            if success:
                print("Usuário criado. Acionando central de notificações...")
                send_welcome_credentials(result)
            else:
                print(f"Falha ao criar usuário: {result}")

    elif evento_descricao in ['Assinatura Cancelada', 'Em Atraso', 'Recusada', 'Cancelada']:
        print(f"Evento de falha/cancelamento '{evento_descricao}' para o e-mail: {email}.")
        user = User.query.filter_by(email=email).first()

        if user:
            # Anota a data em que o acesso pago do usuário termina.
            # O "agente noturno" (Cron Job) usará esta data para calcular os 5 dias de tolerância.
            user.subscription_valid_until = datetime.utcnow().date()
            db.session.commit()
            print(f"Data de validade da assinatura atualizada para {user.subscription_valid_until} para o usuário: {email}")
        else:
            print(f"AVISO: Recebido evento de cancelamento para um usuário não encontrado: {email}")
    else:
        # Para qualquer outro evento que não nos interessa, apenas registramos e ignoramos.
        print(f"Evento não tratado recebido da Monetizze: '{evento_descricao}'. Ignorando.")

    # Responde à Monetizze que recebemos e processamos o webhook com sucesso.
    return jsonify({'status': 'success', 'message': 'Webhook processado'}), 200