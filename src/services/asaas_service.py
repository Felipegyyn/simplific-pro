import requests
import os
import json
from datetime import datetime

def get_headers():
    token = os.getenv('ASAAS_ACCESS_TOKEN')
    if not token:
        print("❌ [ASAAS] Token não configurado no ambiente.")
        return None
    return {
        'access_token': token,
        'Content-Type': 'application/json'
    }

def get_base_url():
    return os.getenv('ASAAS_API_URL', 'https://api-sandbox.asaas.com/v3')

def get_or_create_customer(name, email, cpf, phone, postal_code, address_number):
    """
    Busca cliente no Asaas. Se não existir, cria.
    """
    headers = get_headers()
    base_url = get_base_url()
    
    # 1. Tenta buscar cliente existente pelo email
    try:
        response = requests.get(
            f"{base_url}/customers?email={email}", 
            headers=headers
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('data'):
                customer_id = data['data'][0]['id']
                print(f"✅ [ASAAS] Cliente já existe: {customer_id}")
                return customer_id
    except Exception as e:
        print(f"⚠️ [ASAAS] Erro ao buscar cliente: {e}")

    # 2. Se não existe, cria um novo
    print(f"🆕 [ASAAS] Criando novo cliente: {email}")
    payload = {
        "name": name,
        "email": email,
        "cpfCnpj": cpf,
        "mobilePhone": phone,
        "postalCode": postal_code,
        "addressNumber": address_number,
        "notificationDisabled": False, 
    }
    
    try:
        response = requests.post(
            f"{base_url}/customers", 
            headers=headers, 
            json=payload
        )
        if response.status_code == 200:
            return response.json()['id']
        else:
            print(f"❌ [ASAAS] Erro ao criar cliente: {response.text}")
            return None
    except Exception as e:
        print(f"❌ [ASAAS] Exceção ao criar cliente: {e}")
        return None

def create_asaas_subscription(customer_id, card_data, value, remote_ip):
    """
    Cria uma ASSINATURA MENSAL (Recorrente).
    """
    headers = get_headers()
    base_url = get_base_url()

    payload = {
        "customer": customer_id,
        "billingType": "CREDIT_CARD",
        "value": float(value),
        "nextDueDate": None, # Cobra agora
        "cycle": "MONTHLY",
        "description": "Assinatura Simplific Pro (Mensal)",
        "creditCard": {
            "holderName": card_data.get('holderName'),
            "number": card_data.get('number'),
            "expiryMonth": card_data.get('expiryMonth'),
            "expiryYear": card_data.get('expiryYear'),
            "ccv": card_data.get('ccv')
        },
        "creditCardHolderInfo": {
            "name": card_data.get('holderName'),
            "email": card_data.get('email'),
            "cpfCnpj": card_data.get('cpfCnpj'),
            "postalCode": card_data.get('postalCode'),
            "addressNumber": card_data.get('addressNumber'),
            "phone": card_data.get('phone')
        },
        "remoteIp": remote_ip
    }

    try:
        print(f"💳 [ASAAS] Criando Assinatura Mensal para {customer_id}...")
        response = requests.post(
            f"{base_url}/subscriptions", 
            headers=headers, 
            json=payload
        )
        
        if response.status_code == 200:
            return {"status": "success", "data": response.json()}
        elif response.status_code == 400:
            return {"status": "error", "message": "Dados inválidos", "detail": response.json()}
        else:
            return {"status": "error", "message": "Erro Asaas API", "detail": response.text}

    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- NOVA FUNÇÃO PARA PARCELAMENTO ---
def create_asaas_payment(customer_id, card_data, total_value, installment_count, remote_ip):
    """
    Cria uma COBRANÇA ÚNICA PARCELADA (Ex: Anual em 12x).
    """
    headers = get_headers()
    base_url = get_base_url()

    payload = {
        "customer": customer_id,
        "billingType": "CREDIT_CARD",
        "value": float(total_value),
        "dueDate": datetime.now().strftime('%Y-%m-%d'), # Vence hoje
        "installmentCount": int(installment_count),     # Número de parcelas (ex: 12)
        "installmentValue": float(total_value / int(installment_count)), # Valor da parcela
        "description": f"Plano Anual Simplific Pro ({installment_count}x)",
        "creditCard": {
            "holderName": card_data.get('holderName'),
            "number": card_data.get('number'),
            "expiryMonth": card_data.get('expiryMonth'),
            "expiryYear": card_data.get('expiryYear'),
            "ccv": card_data.get('ccv')
        },
        "creditCardHolderInfo": {
            "name": card_data.get('holderName'),
            "email": card_data.get('email'),
            "cpfCnpj": card_data.get('cpfCnpj'),
            "postalCode": card_data.get('postalCode'),
            "addressNumber": card_data.get('addressNumber'),
            "phone": card_data.get('phone')
        },
        "remoteIp": remote_ip
    }

    try:
        print(f"💳 [ASAAS] Criando Pagamento Parcelado ({installment_count}x) para {customer_id}...")
        response = requests.post(
            f"{base_url}/payments", 
            headers=headers, 
            json=payload
        )
        
        if response.status_code == 200:
            return {"status": "success", "data": response.json()}
        elif response.status_code == 400:
            return {"status": "error", "message": "Dados inválidos", "detail": response.json()}
        else:
            return {"status": "error", "message": "Erro Asaas API", "detail": response.text}

    except Exception as e:
        return {"status": "error", "message": str(e)}