import mercadopago
import os
from datetime import datetime, timedelta

def get_mp_sdk():
    access_token = os.getenv("MERCADO_PAGO_ACCESS_TOKEN")
    if not access_token:
        print("ERRO: MERCADO_PAGO_ACCESS_TOKEN não configurado.")
        return None
    return mercadopago.SDK(access_token)

# --- FUNÇÃO ATUALIZADA: AGORA ACEITA PARCELAS ---
def create_one_time_payment(user_email, card_token, amount, description, installments=1):
    """
    Cria uma cobrança única.
    Args:
        installments (int): Número de parcelas (Padrão 1).
    """
    sdk = get_mp_sdk()
    if not sdk: return {"status": "error", "message": "Erro SDK"}

    payment_data = {
        "transaction_amount": float(amount),
        "token": card_token,
        "description": description,
        "installments": int(installments), # <-- Agora usa o valor passado
        "payer": {
            "email": user_email
        },
        "external_reference": user_email
    }

    try:
        print(f"Criando pagamento avulso de R$ {amount} ({installments}x) para {user_email}...")
        payment_response = sdk.payment().create(payment_data)
        
        # Verificação de segurança caso a resposta venha vazia
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

# --- FUNÇÃO ASSINATURA (MANTIDA COM PEQUENO AJUSTE) ---
def create_subscription(user_email, card_token, amount, frequency=1, start_date=None):
    """
    Cria uma assinatura recorrente.
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

    # Lógica para agendar o início da cobrança recorrente (ex: daqui 30 dias)
    if start_date:
        subscription_data["auto_recurring"]["start_date"] = start_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")

    try:
        request_options = mercadopago.config.RequestOptions()
        request_options.custom_headers = {
            'x-idempotency-key': f"sub_{card_token}_{datetime.now().timestamp()}" 
        }
        
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