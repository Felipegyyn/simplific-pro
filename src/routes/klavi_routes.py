# src/routes/klavi_routes.py
"""
Rotas de integração Klavi Open Finance:
- Criação de Link Session (Advanced Whitelabel)
- Webhook de Eventos (autorização de consentimento)
- Webhook de Produtos (recebimento de extratos, faturas e empréstimos)
- Status de Conexões e Sincronização
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.klavi_service import KlaviService
from src.models.user import User
from src.models.extended_modules import BankAccount, CreditCard
from src.models.db import db

klavi_bp = Blueprint('klavi', __name__)
klavi_service = KlaviService()

# =============================================================================
# 1. CRIAR LINK SESSION (ADVANCED WHITELABEL)
# =============================================================================
@klavi_bp.route('/create-link', methods=['POST'])
@jwt_required()
def create_link():
    """
    Inicia a jornada de Open Finance via Advanced Whitelabel.
    Retorna a linkURL personalizada com a marca Simplific Pro.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    try:
        data = request.get_json() or {}
        redirect_url = data.get('redirectURL')
        
        # Opcional: Se o front enviar o CPF durante o clique, já salva no user
        user_cpf = data.get('cpf')
        if user_cpf:
            clean_cpf = ''.join(filter(str.isdigit, str(user_cpf)))
            if clean_cpf and getattr(user, 'cpf', None) != clean_cpf:
                user.cpf = clean_cpf
                db.session.commit()

        link_session = klavi_service.create_link_session(user, redirect_url=redirect_url)
        return jsonify({
            "status": "success",
            "linkId": link_session.get("linkId"),
            "linkURL": link_session.get("linkURL"),
            "linkToken": link_session.get("linkToken"),
            "expireIn": link_session.get("expireIn")
        }), 200

    except Exception as e:
        print(f"❌ [ROTA KLAVI] Erro ao criar link session: {e}")
        return jsonify({"error": "Erro ao iniciar conexão Open Finance. Tente novamente."}), 500


# =============================================================================
# 2. WEBHOOK DE EVENTOS (AUTORIZAÇÃO DE CONSENTIMENTO)
# =============================================================================
@klavi_bp.route('/webhook/events', methods=['POST'])
def handle_events_webhook():
    """
    Recebe eventos de ciclo de vida da Klavi.
    Quando recebe 'consent_authorised', dispara automaticamente a coleta de:
    - Extrato / Contas Correntes
    - Cartões de Crédito / Faturas
    - Empréstimos e Financiamentos
    """
    try:
        data = request.get_json()
        print(f"📡 [WEBHOOK KLAVI EVENTOS] Recebido: {data}")

        if not data:
            return jsonify({"status": "ignored", "reason": "empty body"}), 200

        # Klavi pode enviar uma lista de eventos ou um objeto único
        events_list = data if isinstance(data, list) else [data]

        for item in events_list:
            event_type = item.get("event")
            payload = item.get("payload", {})
            external_info = item.get("externalInfo", {})

            # 1. Trata evento de CONSENTIMENTO AUTORIZADO
            if event_type == "consent_authorised" or event_type == "link_completed":
                personal_tax_id = payload.get("personalTaxId")
                link_id = payload.get("linkId")
                consents = payload.get("consents", [])
                user_id = external_info.get("user_id")

                # Se não veio no externalInfo, tenta achar o usuário pelo CPF
                if not user_id and personal_tax_id:
                    user_match = User.query.filter_by(cpf=personal_tax_id).first()
                    if user_match:
                        user_id = user_match.id

                # Se achou usuário e ele ainda não tinha CPF, salva
                if user_id and personal_tax_id:
                    usr = User.query.get(user_id)
                    if usr and not getattr(usr, 'cpf', None):
                        usr.cpf = personal_tax_id
                        db.session.commit()

                print(f"🎉 [KLAVI EVENTO] Consentimento autorizado para user_id={user_id}, linkId={link_id}")

                # Dispara a solicitação dos produtos para cada consentimento autorizado
                for c in consents:
                    consent_id = c.get("consentId")
                    institution_code = c.get("institutionCode")
                    consent_status = c.get("status")

                    if consent_status == "AUTHORISED" and personal_tax_id and institution_code:
                        try:
                            klavi_service.request_institution_data(
                                tax_id=personal_tax_id,
                                institution_id=institution_code,
                                link_id=link_id,
                                consent_ids=[consent_id] if consent_id else None,
                                user_id=user_id
                            )
                            print(f"🚀 [KLAVI] Solicitação de dados disparada para instituição {institution_code}")
                        except Exception as req_err:
                            print(f"⚠️ [KLAVI] Erro ao disparar coleta para {institution_code}: {req_err}")

        return jsonify({"status": "success", "message": "Event processed"}), 200

    except Exception as e:
        print(f"❌ [WEBHOOK KLAVI EVENTOS] Erro ao processar evento: {e}")
        return jsonify({"error": str(e)}), 500


# =============================================================================
# 3. WEBHOOK DE PRODUTOS (RECEBIMENTO DOS DADOS FINANCEIROS)
# =============================================================================
@klavi_bp.route('/webhook/products', methods=['POST'])
def handle_products_webhook():
    """
    Recebe os relatórios e extratos gerados pela Klavi:
    - pf_checking_account: Contas e extrato
    - pf_credit_card: Cartões e faturas
    - pf_loans / pf_financing: Contratos de empréstimos e parcelas futuras
    """
    try:
        data = request.get_json()
        print(f"📦 [WEBHOOK KLAVI PRODUTOS] Recebido relatório de dados.")

        if not data:
            return jsonify({"status": "ignored", "reason": "empty body"}), 200

        products_list = data if isinstance(data, list) else [data]

        for item in products_list:
            product_name = item.get("productName") or item.get("product")
            product_data = item.get("data") or []
            external_info = item.get("externalInfo") or {}
            user_id = external_info.get("user_id")

            # Se não veio no externalInfo, tenta pegar do primeiro item de data
            if not user_id and isinstance(product_data, list) and len(product_data) > 0:
                first_item = product_data[0]
                tax_id = first_item.get("taxId") or first_item.get("personalTaxId")
                if tax_id:
                    user_match = User.query.filter_by(cpf=tax_id).first()
                    if user_match:
                        user_id = user_match.id

            if not user_id:
                print(f"⚠️ [KLAVI PRODUTOS] Não foi possível correlacionar o usuário para o produto {product_name}.")
                continue

            link_id = item.get("linkId")

            # 1. CONTAS CORRENTES
            if product_name == "pf_checking_account":
                klavi_service.process_checking_account_data(user_id, product_data, link_id=link_id)

            # 2. CARTÕES DE CRÉDITO
            elif product_name == "pf_credit_card":
                klavi_service.process_credit_card_data(user_id, product_data, link_id=link_id)

            # 3. EMPRÉSTIMOS E FINANCIAMENTOS
            elif product_name in ["pf_loans", "pf_financing"]:
                klavi_service.process_loans_data(user_id, product_data, link_id=link_id)

            else:
                print(f"ℹ️ [KLAVI PRODUTOS] Produto recebido sem handler específico: {product_name}")

        return jsonify({"status": "success", "message": "Products ingested successfully"}), 200

    except Exception as e:
        print(f"❌ [WEBHOOK KLAVI PRODUTOS] Erro na ingestão: {e}")
        return jsonify({"error": str(e)}), 500


# =============================================================================
# 4. STATUS DE CONEXÕES ATIVAS
# =============================================================================
@klavi_bp.route('/status', methods=['GET'])
@jwt_required()
def get_klavi_status():
    """
    Retorna um resumo de todas as contas e cartões vinculados via Open Finance pelo usuário.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    connected_accounts = BankAccount.query.filter(
        BankAccount.user_id == user_id,
        BankAccount.klavi_account_id != None
    ).all()

    connected_cards = CreditCard.query.filter(
        CreditCard.user_id == user_id,
        CreditCard.klavi_card_id != None
    ).all()

    return jsonify({
        "status": "success",
        "has_cpf": bool(getattr(user, 'cpf', None)),
        "cpf": getattr(user, 'cpf', None),
        "total_connected_accounts": len(connected_accounts),
        "total_connected_cards": len(connected_cards),
        "accounts": [acc.to_dict() for acc in connected_accounts],
        "cards": [card.to_dict() for card in connected_cards]
    }), 200

