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
        print(f"[ERRO] [ROTA KLAVI] Erro ao criar link session: {e}")
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
        print(f"[WEBHOOK] [WEBHOOK KLAVI EVENTOS] Recebido: {data}")

        if not data:
            return jsonify({"status": "ignored", "reason": "empty body"}), 200

        # Klavi pode enviar uma lista de eventos ou um objeto único
        events_list = data if isinstance(data, list) else [data]

        for item in events_list:
            event_type = item.get("eventName") or item.get("event") or item.get("eventType")
            payload = item.get("payload", {})
            external_info = item.get("externalInfo", {})

            # 1. Trata evento de PRODUTO GERADO COM SUCESSO (Klavi gera e notifica que está pronto)
            if event_type == "product_generated_success":
                product_name = payload.get("product") or payload.get("productName")
                personal_tax_id = payload.get("personalTaxId") or payload.get("taxId")
                user_id = external_info.get("user_id")

                if not user_id and personal_tax_id:
                    u_match = User.query.filter_by(cpf=personal_tax_id).first()
                    if u_match:
                        user_id = u_match.id

                print(f"[EVENTO] [KLAVI EVENTO] Produto {product_name} pronto para ingestão do usuário {user_id} (CPF: {personal_tax_id})")
                if user_id and personal_tax_id and product_name:
                    klavi_service.fetch_and_process_product(user_id, personal_tax_id, product_name)

            # 2. Trata evento de CONSENTIMENTO AUTORIZADO
            elif event_type in ["consent_authorised", "link_completed"]:
                personal_tax_id = payload.get("personalTaxId") or payload.get("taxId")
                link_id = payload.get("linkId")
                consents_raw = payload.get("consents", [])
                
                # Normaliza consents (pode vir como dict ou list)
                if isinstance(consents_raw, dict):
                    consents = [consents_raw]
                elif isinstance(consents_raw, list):
                    consents = consents_raw
                else:
                    consents = []

                user_id = external_info.get("user_id")

                # Se não veio no externalInfo, tenta achar o usuário por email ou CPF
                user_email = external_info.get("user_email")
                if not user_id and user_email:
                    user_match = User.query.filter_by(email=user_email).first()
                    if user_match:
                        user_id = user_match.id

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

                print(f"[SUCESSO] [KLAVI EVENTO] Consentimento autorizado para user_id={user_id}, linkId={link_id}")

                # Dispara a solicitação dos produtos para cada consentimento autorizado
                for c in consents:
                    consent_id = c.get("consentId")
                    institution_code = c.get("institutionCode") or c.get("institutionId")
                    consent_status = c.get("status")

                    # Se o evento é consent_authorised ou o status é AUTHORISED
                    if personal_tax_id and institution_code and (consent_status in [None, "AUTHORISED", "authorised"] or event_type == "consent_authorised"):
                        try:
                            klavi_service.request_institution_data(
                                tax_id=personal_tax_id,
                                institution_id=institution_code,
                                link_id=link_id,
                                consent_ids=[consent_id] if consent_id else None,
                                user_id=user_id
                            )
                            print(f"[DISPARO] [KLAVI] Solicitação de dados disparada para instituição {institution_code}")
                        except Exception as req_err:
                            print(f"[AVISO] [KLAVI] Erro ao disparar coleta para {institution_code}: {req_err}")

            # 3. Trata evento de CONSENTIMENTO REVOGADO OU CANCELADO (ex: no app do banco)
            elif event_type in ["consent_revoked", "consent_cancelled", "consent_rejected"]:
                personal_tax_id = payload.get("personalTaxId") or payload.get("taxId")
                user_id = external_info.get("user_id")
                if not user_id and personal_tax_id:
                    u_match = User.query.filter_by(cpf=personal_tax_id).first()
                    if u_match:
                        user_id = u_match.id

                print(f"[REVOGAÇÃO] [KLAVI EVENTO] Consentimento revogado pelo usuário (user_id={user_id}, CPF={personal_tax_id})")
                if user_id:
                    try:
                        klavi_service.clean_all_user_data(user_id)
                    except Exception as clean_err:
                        print(f"[AVISO] [KLAVI REVOGAÇÃO] Erro ao limpar dados revogados: {clean_err}")

        return jsonify({"status": "success", "message": "Event processed"}), 200

    except Exception as e:
        print(f"[ERRO] [WEBHOOK KLAVI EVENTOS] Erro ao processar evento: {e}")
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
        print(f"[DADOS] [WEBHOOK KLAVI PRODUTOS] Recebido relatório de dados.")

        if not data:
            return jsonify({"status": "ignored", "reason": "empty body"}), 200

        products_list = data if isinstance(data, list) else [data]

        for item in products_list:
            product_name = item.get("productName") or item.get("product")
            product_data = item.get("data") or []
            external_info = item.get("externalInfo") or {}
            user_id = external_info.get("user_id")
            user_email = external_info.get("user_email")

            if not user_id and user_email:
                usr_by_email = User.query.filter_by(email=user_email).first()
                if usr_by_email:
                    user_id = usr_by_email.id

            # Se não veio no externalInfo, tenta pegar do item ou de product_data
            if not user_id:
                tax_id = item.get("taxId") or item.get("personalTaxId")
                if not tax_id and isinstance(product_data, list) and len(product_data) > 0:
                    first_item = product_data[0]
                    if isinstance(first_item, dict):
                        tax_id = first_item.get("taxId") or first_item.get("personalTaxId")
                elif not tax_id and isinstance(product_data, dict):
                    tax_id = product_data.get("taxId") or product_data.get("personalTaxId")

                if tax_id:
                    user_match = User.query.filter_by(cpf=tax_id).first()
                    if user_match:
                        user_id = user_match.id

            if not user_id:
                print(f"[AVISO] [KLAVI PRODUTOS] Não foi possível correlacionar o usuário para o produto {product_name}.")
                continue

            link_id = item.get("linkId")

            # 1. CONTAS CORRENTES E POUPANÇA (Padrão e L3 Categorizado)
            if product_name in ["pf_checking_account", "pf_categorized_checking_l3", "pf_categorized_savings_l3"]:
                klavi_service.process_checking_account_data(user_id, product_data, link_id=link_id)

            # 2. CARTÕES DE CRÉDITO (Padrão e L3 Categorizado)
            elif product_name in ["pf_credit_card", "pf_categorized_creditcard_l3"]:
                klavi_service.process_credit_card_data(user_id, product_data, link_id=link_id)

            # 3. EMPRÉSTIMOS E FINANCIAMENTOS
            elif product_name in ["pf_loans", "pf_financing"]:
                klavi_service.process_loans_data(user_id, product_data, link_id=link_id)

            else:
                print(f"[INFO] [KLAVI PRODUTOS] Produto recebido sem handler específico: {product_name}")

        return jsonify({"status": "success", "message": "Products ingested successfully"}), 200

    except Exception as e:
        print(f"[ERRO] [WEBHOOK KLAVI PRODUTOS] Erro na ingestão: {e}")
        return jsonify({"error": str(e)}), 500


# =============================================================================
# 4. STATUS DE CONEXÕES ATIVAS
# =============================================================================
@klavi_bp.route('/sync-now', methods=['POST'])
@jwt_required()
def sync_now():
    """Sincroniza imediatamente todas as instituições ativas do usuário na Klavi."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    success = klavi_service.sync_all_user_data(user_id, tax_id=getattr(user, 'cpf', None))
    return jsonify({"status": "success" if success else "no_data"}), 200


@klavi_bp.route('/status', methods=['GET'])
@jwt_required()
def get_klavi_status():
    """
    Retorna um resumo de todas as contas e cartões vinculados via Open Finance pelo usuário.
    Se não houver contas carregadas mas o usuário tiver CPF, tenta sincronizar ativamente.
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

    # Auto-recuperação: Se não há contas salvas, tenta sincronizar dos consentimentos da Klavi
    if len(connected_accounts) == 0 and getattr(user, 'cpf', None):
        try:
            if klavi_service.sync_all_user_data(user_id, tax_id=user.cpf):
                connected_accounts = BankAccount.query.filter(
                    BankAccount.user_id == user_id,
                    BankAccount.klavi_account_id != None
                ).all()
                connected_cards = CreditCard.query.filter(
                    CreditCard.user_id == user_id,
                    CreditCard.klavi_card_id != None
                ).all()
        except Exception as e:
            print(f"[AVISO] [KLAVI STATUS] Falha na auto-sincronização: {e}")

    return jsonify({
        "status": "success",
        "has_cpf": bool(getattr(user, 'cpf', None)),
        "cpf": getattr(user, 'cpf', None),
        "total_connected_accounts": len(connected_accounts),
        "total_connected_cards": len(connected_cards),
        "accounts": [acc.to_dict() for acc in connected_accounts],
        "cards": [card.to_dict() for card in connected_cards]
    }), 200


# =============================================================================
# 5. LIMPEZA TOTAL DE DADOS E DESCONEXÃO (REVOGAÇÃO LOCAL)
# =============================================================================
@klavi_bp.route('/clean-data', methods=['POST'])
@klavi_bp.route('/disconnect-all', methods=['POST'])
@jwt_required()
def clean_open_finance_data():
    """
    Remove todos os dados (contas, cartões, faturas, extratos e compras)
    importados via Klavi Open Finance para o usuário logado.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        results = klavi_service.clean_all_user_data(user_id)
        return jsonify({
            "status": "success",
            "message": "Todos os dados importados do Open Finance foram removidos com sucesso.",
            "details": results
        }), 200
    except Exception as e:
        print(f"[ERRO] [ROTA KLAVI LIMPEZA] Falha ao limpar dados: {e}")
        return jsonify({"error": str(e)}), 500


