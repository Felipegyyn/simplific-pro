import mercadopago
import os

def create_subscription(user_email, card_token, amount, frequency=1):
    """
    Cria uma assinatura mensal (Preapproval) no Mercado Pago.
    
    Args:
        user_email (str): Email do usuário (pagador).
        card_token (str): Token do cartão gerado pelo Frontend (Card Brick).
        amount (float): Valor da mensalidade.
        
    Returns:
        dict: Resposta do Mercado Pago ou dicionário de erro.
    """
    
    # 1. Inicializa o SDK com sua ACCESS TOKEN (que está no Render)
    access_token = os.getenv("MERCADO_PAGO_ACCESS_TOKEN")
    if not access_token:
        print("ERRO: MERCADO_PAGO_ACCESS_TOKEN não configurado.")
        return {"status": "error", "message": "Erro de configuração no servidor."}

    sdk = mercadopago.SDK(access_token)

    # 2. Prepara os dados da assinatura
    subscription_data = {
        "reason": "Assinatura Mensal - Simplific Pro", # O que aparece na fatura
        "payer_email": user_email,
        "auto_recurring": {
            "frequency": frequency,
            "frequency_type": "months",
            "transaction_amount": float(amount),
            "currency_id": "BRL"
        },
        "back_url": "https://simplificpro.com/dashboard", # Para onde voltar (opcional)
        "status": "authorized", # Tenta autorizar imediatamente
        "card_token_id": card_token # O token mágico que veio do front
    }

    try:
        # 3. Chama a API de Preapproval (Assinaturas)
        print(f"Criando assinatura para {user_email}...")
        request_options = mercadopago.config.RequestOptions()
        request_options.custom_headers = {
            'x-idempotency-key': card_token # Evita cobrança duplicada se clicar 2x
        }
        
        result = sdk.preapproval().create(subscription_data, request_options)
        response = result["response"]

        # 4. Verifica se deu certo
        if result["status"] == 201:
            print(f"Assinatura criada com sucesso! ID: {response['id']}")
            return {
                "status": "success", 
                "id": response["id"],
                "status_detail": response["status"]
            }
        else:
            print(f"Erro no Mercado Pago: {response}")
            return {
                "status": "error", 
                "message": "Não foi possível processar o pagamento.",
                "detail": response
            }

    except Exception as e:
        print(f"Erro crítico ao criar assinatura: {e}")
        return {"status": "error", "message": str(e)}