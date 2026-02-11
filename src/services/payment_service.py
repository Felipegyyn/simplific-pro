import mercadopago
import os
from datetime import datetime, timedelta

def get_mp_sdk():
    access_token = os.getenv("MERCADO_PAGO_ACCESS_TOKEN")
    if not access_token:
        print("ERRO: MERCADO_PAGO_ACCESS_TOKEN não configurado.")
        return None
    return mercadopago.SDK(access_token)

# --- FUNÇÃO ATUALIZADA: AGORA ACEITA DADOS COMPLETOS E DEVICE ID ---
def create_one_time_payment(user_email, card_token, amount, description, installments=1, payer_info=None, device_id=None):
    """
    Cria uma cobrança única com dados completos de antifraude.
    """
    sdk = get_mp_sdk()
    if not sdk: return {"status": "error", "message": "Erro SDK"}

    # Garante que payer_info existe para evitar erros
    if not payer_info:
        payer_info = {}

    payment_data = {
        "transaction_amount": float(amount),
        "token": card_token,
        "description": description,
        "installments": int(installments),
        "payer": {
            "email": user_email,
            "first_name": payer_info.get("first_name"),
            "last_name": payer_info.get("last_name"),
            "identification": {
                "type": "CPF", 
                "number": payer_info.get("cpf") # CPF é crucial
            },
            "address": {
                "zip_code": payer_info.get("zip_code"),
                "street_name": payer_info.get("street_name"),
                "street_number": payer_info.get("street_number"),
                "neighborhood": payer_info.get("neighborhood"),
                "city": payer_info.get("city"),
                "federal_unit": payer_info.get("state")
            }
        },
        "external_reference": user_email,
        "additional_info": {
            "ip_address": "127.0.0.1" # Idealmente, pegar o IP real do cliente na rota
        }
    }

    # Adiciona Device ID se disponível (CRÍTICO PARA ANTIFRAUDE)
    if device_id:
        payment_data["metadata"] = {"device_id": device_id}

    try:
        print(f"Criando pagamento avulso de R$ {amount} ({installments}x) para {user_email}...")
        payment_response = sdk.payment().create(payment_data)
        
        if "response" not in payment_response:
             return {"status": "error", "message": "Sem resposta do MP", "detail": payment_response}

        response = payment_response["response"]

        if payment_response["status"] == 201 and response.get("status") == "approved":
            return {"status": "success", "id": response["id"]}
        else:
            return {
                "status": "error", 
                "message": response.get("status_detail", "Pagamento não aprovado"),
                "detail": response
            }
    except Exception as e:
        print(f"Erro pagamento avulso: {e}")
        return {"status": "error", "message": str(e)}

# --- FUNÇÃO ASSINATURA ATUALIZADA ---
def create_subscription(user_email, card_token, amount, frequency=1, start_date=None, device_id=None):
    """
    Cria uma assinatura recorrente.
    OBS: Assinaturas (Preapproval) têm menos campos de 'payer' no payload direto, 
    mas o device_id e o card_token_id rico ajudam.
    """
    sdk = get_mp_sdk()
    if not sdk: return {"status": "error", "message": "Erro SDK"}

    subscription_data = {
        "reason": "Assinatura - Simplific Pro",
        "payer_email": user_email,
        "external_reference": user_email,
        "auto_recurring": {
            "frequency": frequency,
            "frequency_type": "months",
            "transaction_amount": float(amount),
            "currency_id": "BRL"
        },
        "back_url": "https://simplificpro.com/dashboard",
        "status": "authorized",
        "card_token_id": card_token
    }

    if start_date:
        subscription_data["auto_recurring"]["start_date"] = start_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")

    try:
        request_options = mercadopago.config.RequestOptions()
        
        # Envia Device ID no Header customizado se houver (para Preapproval é diferente)
        # Em preapproval, o antifraude roda forte na criação do card_token.
        # Garantir que o card_token foi criado no front com o device_id vinculado é o principal.
        
        headers = {
            'x-idempotency-key': f"sub_{card_token}_{datetime.now().timestamp()}" 
        }
        if device_id:
             headers['x-device-id'] = device_id # Tentativa de enviar device no header

        request_options.custom_headers = headers
        
        result = sdk.preapproval().create(subscription_data, request_options)
        
        if "response" not in result:
             return {"status": "error", "message": "Sem resposta do MP na assinatura"}

        response = result["response"]

        if result["status"] == 201:
            return {"status": "success", "id": response["id"]}
        else:
            return {"status": "error", "message": "Erro criar assinatura", "detail": response}

    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_subscription_details(subscription_id):
    sdk = get_mp_sdk()
    if not sdk: return None
    try:
        result = sdk.preapproval().get(subscription_id)
        if result["status"] == 200: return result["response"]
        return None
    except Exception:
        return None

def cancel_subscription_service(subscription_id):
    sdk = get_mp_sdk()
    if not sdk: return {"status": "error", "message": "SDK Indisponível"}
    try:
        result = sdk.preapproval().update(subscription_id, {"status": "cancelled"})
        if result["status"] == 200: return {"status": "success", "response": result["response"]}
        return {"status": "error", "message": "Falha ao cancelar no MP"}
    except Exception as e:
        return {"status": "error", "message": str(e)}