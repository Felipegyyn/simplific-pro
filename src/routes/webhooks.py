from flask import Blueprint, request, jsonify
import os
from src.services.user_service import create_user_from_purchase
from src.services.notification_service import (
    send_welcome_credentials, 
    send_payment_failed_notification
)
from src.models.user import User
from src.models.db import db
from src.services.user_service import create_user_from_purchase, normalize_phone_number
from datetime import datetime, timedelta
import requests



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


# --- ROTA NOVA: MERCADO PAGO (A MÁQUINA DE VENDAS) ---
@webhooks_bp.route('/mercadopago', methods=['POST'])
def mercadopago_webhook():
    """
    Recebe notificação do Mercado Pago, consulta os detalhes e age.
    """
    # 1. Tenta pegar o ID e o Tópico (pode vir na URL ou no JSON)
    topic = request.args.get('topic') or request.args.get('type')
    resource_id = request.args.get('id') or request.args.get('data.id')

    # Fallback: Se não veio na URL, tenta pegar do JSON
    if not resource_id:
        data = request.get_json(silent=True)
        if data:
            topic = data.get('type')
            resource_id = data.get('data', {}).get('id')

    print(f"🔔 [MP Webhook] Recebido: Tópico={topic}, ID={resource_id}")

    # Se não for aviso de pagamento, a gente ignora (ex: aviso de teste)
    if topic != 'payment' or not resource_id:
        return jsonify({"status": "ignored"}), 200

    try:
        # 2. Consultar a API do Mercado Pago para ver quem pagou (Segurança)
        mp_access_token = os.getenv("MERCADO_PAGO_ACCESS_TOKEN")
        if not mp_access_token:
            print("❌ ERRO: Token do MP não configurado.")
            return jsonify({"error": "Config error"}), 500

        headers = {"Authorization": f"Bearer {mp_access_token}"}
        url_consult = f"https://api.mercadopago.com/v1/payments/{resource_id}"
        
        resp_mp = requests.get(url_consult, headers=headers)
        
        if resp_mp.status_code != 200:
            print(f"❌ Erro ao consultar MP: {resp_mp.text}")
            return jsonify({"status": "error_consulting_mp"}), 200 # Retorna 200 pro MP parar de mandar

        payment_data = resp_mp.json()
        
        # 3. Extrair dados vitais
        status = payment_data.get('status') # approved, pending, rejected
        status_detail = payment_data.get('status_detail')
        # AQUI ESTÁ O SEGREDO DO PASSO 1: O 'external_reference' é o email
        user_email = payment_data.get('external_reference') 
        payment_method = payment_data.get('payment_method_id')
        transaction_amount = payment_data.get('transaction_amount')
        
        print(f"📊 [MP Análise] User: {user_email} | Status: {status} | Método: {payment_method}")

        if not user_email:
            print("⚠️ Pagamento sem external_reference (Email). Impossível vincular usuário.")
            return jsonify({"status": "ok"}), 200

        # 4. Buscar Usuário no Banco
        user = User.query.filter_by(email=user_email).first()
        if not user:
            print(f"⚠️ Usuário {user_email} não encontrado no banco.")
            # Aqui poderíamos criar o usuário se quiséssemos, mas por segurança vamos apenas logar
            return jsonify({"status": "user_not_found"}), 200

        
        # --- A MÁQUINA DE VENDAS (MODO ONLY CARDS) ---

        # CENÁRIO 1: APROVADO (Dinheiro na conta -> Libera Acesso)
        if status == 'approved':
            print(f"✅ Pagamento Cartão Aprovado para {user.email}")
            
            user.status = 'ativo'
            user.profile = 'premium'
            user.subscription_valid_until = datetime.utcnow().date() + timedelta(days=32)
            db.session.commit()
            
            # Opcional: Se quiser mandar whats de boas vindas aqui também
            # send_welcome_credentials(...) 

        # CENÁRIO 2: REJEITADO (O foco da recuperação)
        elif status == 'rejected':
            print(f"🚫 Cartão recusado ({status_detail}) para {user.email}")
            
            # Dispara a recuperação pedindo outro cartão
            send_payment_failed_notification(user.name, user.whatsapp)
            
        # CENÁRIO 3: PENDENTE (Em análise de fraude)
        elif status == 'in_process' or status == 'pending':
            # No cartão, 'pending' geralmente é análise de risco. 
            # Não fazemos nada, esperamos virar approved ou rejected.
            print(f"⏳ Pagamento em análise (Cartão) para {user.email}")

        return jsonify({"status": "processed"}), 200

    except Exception as e:


        print(f"❌ Erro Crítico no Webhook MP: {str(e)}")
        # Retornamos 500 para o MP tentar de novo depois
        return jsonify({"error": "Internal Error"}), 500