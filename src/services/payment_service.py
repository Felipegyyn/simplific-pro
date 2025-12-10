import mercadopago
import os
from datetime import datetime, timedelta

def get_mp_sdk():
    access_token = os.getenv("MERCADO_PAGO_ACCESS_TOKEN")
    if not access_token:
        print("ERRO: MERCADO_PAGO_ACCESS_TOKEN não configurado.")
        return None
    return mercadopago.SDK(access_token)

# --- NOVA FUNÇÃO: COBRANÇA AVULSA ---
def create_one_time_payment(user_email, card_token, amount, description):
    """Cria uma cobrança única (ex: R$ 4,90 do primeiro mês)."""
    sdk = get_mp_sdk()
    if not sdk: return {"status": "error", "message": "Erro SDK"}

    payment_data = {
        "transaction_amount": float(amount),
        "token": card_token,
        "description": description,
        "installments": 1,
        "payer": {
            "email": user_email
        }
    }

    try:
        print(f"Criando pagamento avulso de R$ {amount} para {user_email}...")
        payment_response = sdk.payment().create(payment_data)
        response = payment_response["response"]

        if payment_response["status"] == 201 and response["status"] == "approved":
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

# --- FUNÇÃO MODIFICADA: ASSINATURA ---
def create_subscription(user_email, card_token, amount, frequency=1, start_date=None):
    """
    Cria uma assinatura.
    Args:
        start_date (datetime): Se fornecido, a assinatura só começa a cobrar nesta data.
    """
    sdk = get_mp_sdk()
    if not sdk: return {"status": "error", "message": "Erro SDK"}

    subscription_data = {
        "reason": "Assinatura - Simplific Pro",
        "payer_email": user_email,
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

    # Se tiver data de início futura (para a promo de R$ 4,90), adicionamos aqui
    if start_date:
        # Formato ISO 8601 (YYYY-MM-DDTHH:MM:SS.000-03:00)
        # Adicionamos o fuso horário ou 'Z'
        subscription_data["auto_recurring"]["start_date"] = start_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")

    try:
        request_options = mercadopago.config.RequestOptions()
        # Se for assinatura futura, o idempotency key deve ser diferente do pagamento avulso
        # para não dar conflito se usarmos o mesmo token
        request_options.custom_headers = {
            'x-idempotency-key': f"sub_{card_token}_{datetime.now().timestamp()}" 
        }
        
        result = sdk.preapproval().create(subscription_data, request_options)
        response = result["response"]

        if result["status"] == 201:
            return {"status": "success", "id": response["id"]}
        else:
            return {"status": "error", "message": "Erro criar assinatura", "detail": response}

    except Exception as e:
        return {"status": "error", "message": str(e)}