# src/services/klavi_service.py
"""
Klavi Open Finance Service para Simplific Pro.
Integração ponta a ponta:
1. Contas Correntes (saldos, conciliação e extrato automático)
2. Cartões de Crédito (limites, faturas e lançamentos)
3. Empréstimos e Financiamentos (lançamentos futuros como 'pendentes' e agenda financeira)
"""

import os
import requests
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta
from sqlalchemy import func
from src.models.db import db
from src.models.user import User
from src.models.financial import Transaction, Category
from src.models.extended_modules import BankAccount, CreditCard, CreditCardTransaction, Fatura
from src.models.extended import ScheduleEvent

class KlaviService:
    def __init__(self):
        self.access_key = os.getenv('KLAVI_ACCESS_KEY', '9578b5fe-7a15-4e07-922b-cf583a8fb0be').strip()
        self.secret_key = os.getenv('KLAVI_SECRET_KEY', 'a32d6ac8-efbe-4535-8a64-aec97cc1dc4c').strip()
        self.base_url = os.getenv('KLAVI_BASE_URL', 'https://api-testing.klavi.ai').rstrip('/')
        self.frontend_url = os.getenv('FRONTEND_URL', 'https://www.simplificpro.com').rstrip('/')
        self._access_token = None
        self._token_expires_at = None

        # Sessão segura sem proxy local
        self.session = requests.Session()
        self.session.trust_env = False

    # =========================================================================
    # 1. AUTENTICAÇÃO E GERAÇÃO DE TOKEN
    # =========================================================================
    def get_access_token(self):
        """
        Retorna o accessToken ativo ou gera um novo via POST /data/v1/auth.
        Token é armazenado em cache até 60s antes do vencimento (1800s).
        """
        now = datetime.utcnow()
        if self._access_token and self._token_expires_at and now < self._token_expires_at:
            return self._access_token

        url = f"{self.base_url}/data/v1/auth"
        payload = {
            "accessKey": self.access_key,
            "secretKey": self.secret_key
        }
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        try:
            response = self.session.post(url, json=payload, headers=headers, timeout=15)
            response.raise_for_status()
            data = response.json()

            self._access_token = data.get("accessToken")
            expire_in = data.get("expireIn", 1800)
            self._token_expires_at = now + timedelta(seconds=max(expire_in - 60, 60))
            print(f"[OK] [KLAVI] Novo accessToken gerado com sucesso! Expira em {expire_in}s")
            return self._access_token
        except Exception as e:
            print(f"[ERRO] [KLAVI] Falha na autenticação: {e}")
            raise e

    # =========================================================================
    # 2. CRIAÇÃO DE LINK SESSION (ADVANCED WHITELABEL)
    # =========================================================================
    def create_link_session(self, user, redirect_url=None):
        """
        Gera uma sessão de Link na Klavi (Advanced Whitelabel).
        Retorna a linkURL configurada com a logo do Simplific Pro.
        """
        token = self.get_access_token()
        url = f"{self.base_url}/data/v1/links"
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        # URL de retorno após a autorização bancária
        final_redirect_url = redirect_url or f"{self.frontend_url}/#/bank-accounts?klavi_status=success"

        payload = {
            "email": user.email,
            "redirectURL": final_redirect_url,
            "products": [
                "pf_categorized_checking_l3",
                "pf_categorized_creditcard_l3",
                "pf_categorized_savings_l3",
                "pf_identity"
            ],
            "externalInfo": {
                "user_id": str(user.id),
                "user_email": user.email,
                "user_name": user.name or ""
            }
        }

        # Trata o telefone se existir: Klavi exige estritamente 10 ou 11 dígitos (DDD + número brasileiro, sem 55 ou símbolos)
        user_phone = getattr(user, 'whatsapp', None) or getattr(user, 'telefone_whatsapp', None)
        if user_phone:
            clean_phone = ''.join(filter(str.isdigit, str(user_phone)))
            if len(clean_phone) in [12, 13] and clean_phone.startswith('55'):
                clean_phone = clean_phone[2:]
            if len(clean_phone) in [10, 11]:
                payload["phone"] = clean_phone

        # Se o usuário já tiver CPF cadastrado, pré-carrega para simplificar o consentimento
        if getattr(user, 'cpf', None):
            clean_cpf = ''.join(filter(str.isdigit, str(user.cpf)))
            if len(clean_cpf) == 11:
                payload["personalTaxId"] = clean_cpf

        try:
            response = self.session.post(url, json=payload, headers=headers, timeout=15)
            response.raise_for_status()
            data = response.json()
            print(f"[LINK] [KLAVI] Link criado para o usuário {user.email}: linkId={data.get('linkId')}")
            return {
                "linkId": data.get("linkId"),
                "linkURL": data.get("linkURL"),
                "linkToken": data.get("linkToken"),
                "expireIn": data.get("expireIn", 1800)
            }
        except Exception as e:
            err_details = ""
            if hasattr(e, 'response') and e.response is not None:
                err_details = f" | Resposta Klavi: {e.response.text}"
            print(f"[ERRO] [KLAVI] Erro ao criar Link Session: {e}{err_details}")
            raise e

    # =========================================================================
    # 3. SOLICITAÇÃO DE PRODUTOS DE DADOS (INSTITUTION-DATA)
    # =========================================================================
    def request_institution_data(self, tax_id, institution_id, link_id=None, consent_ids=None, user_id=None, products=None):
        """
        Solicita à Klavi o processamento e entrega dos dados da instituição autorizada.
        Produtos padrão: Contas Correntes, Cartões de Crédito, Empréstimos e Financiamentos.
        """
        token = self.get_access_token()
        url = f"{self.base_url}/data/v1/personal/institution-data"
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        clean_cpf = ''.join(filter(str.isdigit, str(tax_id or '')))
        
        target_products = products or [
            "pf_categorized_checking_l3",
            "pf_categorized_creditcard_l3",
            "pf_categorized_savings_l3",
            "pf_identity"
        ]

        payload = {
            "taxId": clean_cpf,
            "institutionCode": str(institution_id),
            "products": target_products,
            "externalInfo": {
                "user_id": str(user_id) if user_id else ""
            }
        }

        if link_id:
            payload["linkId"] = str(link_id)
        if consent_ids:
            payload["consentIds"] = consent_ids if isinstance(consent_ids, list) else [str(consent_ids)]

        try:
            response = self.session.post(url, json=payload, headers=headers, timeout=20)
            response.raise_for_status()
            print(f"[RECEBIDO] [KLAVI] Solicitação de dados enviada com sucesso para inst={institution_id}, taxId={clean_cpf}")
            return response.json()
        except Exception as e:
            print(f"[ERRO] [KLAVI] Erro ao solicitar institution-data: {e}")
            # Log de erro detalhado da Klavi se disponível
            if hasattr(e, 'response') and e.response is not None:
                print(f"   Resposta Klavi: {e.response.text}")
            raise e

    # =========================================================================
    # 3.1. BUSCA DE CONSENTIMENTOS E INGESTÃO ATIVA DE PRODUTOS
    # =========================================================================
    def get_user_consents(self, tax_id):
        """Busca os consentimentos ativos do usuário na Klavi."""
        token = self.get_access_token()
        clean_cpf = ''.join(filter(str.isdigit, str(tax_id or '')))
        url = f"{self.base_url}/data/v1/consents"
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
        try:
            res = self.session.get(url, params={"personalTaxId": clean_cpf}, headers=headers, timeout=15)
            if res.status_code == 200:
                return res.json()
            print(f"[AVISO] [KLAVI] Busca de consentimentos retornou {res.status_code}: {res.text[:150]}")
        except Exception as e:
            print(f"[ERRO] [KLAVI] Erro ao buscar consentimentos para CPF {clean_cpf}: {e}")
        return []

    def fetch_and_process_product(self, user_id, tax_id, product, institution_code=None):
        """
        Busca o relatório de dados gerado na Klavi via GET /data/v1/personal/institution-data
        e aciona o motor de ingestão correspondente.
        """
        token = self.get_access_token()
        clean_cpf = ''.join(filter(str.isdigit, str(tax_id or '')))
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

        inst_codes = [str(institution_code)] if institution_code else []
        if not inst_codes:
            consents = self.get_user_consents(clean_cpf)
            for c in consents:
                code = c.get("institutionCode")
                if code and str(code) not in inst_codes:
                    inst_codes.append(str(code))

        if not inst_codes:
            print(f"[AVISO] [KLAVI] Nenhuma instituição com consentimento encontrada para CPF {clean_cpf}")
            return False

        success = False
        for inst in inst_codes:
            url = f"{self.base_url}/data/v1/personal/institution-data"
            params = {
                "taxId": clean_cpf,
                "product": product,
                "institutionCode": str(inst)
            }
            try:
                res = self.session.get(url, params=params, headers=headers, timeout=30)
                if res.status_code != 200:
                    print(f"[AVISO] [KLAVI] GET institution-data ({product}, inst={inst}) falhou: {res.status_code} {res.text[:150]}")
                    continue

                data = res.json()
                print(f"[DADOS] [KLAVI] Relatório {product} recebido com sucesso para inst {inst}!")

                if product in ["pf_categorized_checking_l3", "pf_checking_account", "pf_categorized_savings_l3"]:
                    accounts = data.get("checkingAccounts") or data.get("savingsAccounts") or data.get("accounts") or []
                    if self.process_checking_account_data(user_id, accounts):
                        success = True

                elif product in ["pf_categorized_creditcard_l3", "pf_credit_card"]:
                    cards = data.get("creditCards") or data.get("cards") or []
                    if self.process_credit_card_data(user_id, cards):
                        success = True

            except Exception as e:
                print(f"[ERRO] [KLAVI] Erro ao buscar/processar {product} para inst {inst}: {e}")

        return success

    def sync_all_user_data(self, user_id, tax_id=None):
        """Sincroniza todos os produtos contratados para o usuário a partir de consentimentos ativos."""
        user = User.query.get(user_id)
        if not user:
            return False

        clean_cpf = ''.join(filter(str.isdigit, str(tax_id or getattr(user, 'cpf', '') or '')))
        if not clean_cpf:
            return False

        consents = self.get_user_consents(clean_cpf)
        if not consents:
            return False

        success = False
        for c in consents:
            inst = c.get("institutionCode")
            if not inst:
                continue
            for prod in ["pf_categorized_checking_l3", "pf_categorized_creditcard_l3"]:
                if self.fetch_and_process_product(user_id, clean_cpf, prod, institution_code=inst):
                    success = True

        return success

    # =========================================================================
    # 4. MOTOR DE INGESTÃO 1: CONTAS CORRENTES (SALDOS E EXTRATO)
    # =========================================================================
    def process_checking_account_data(self, user_id, accounts_data, link_id=None):
        """
        Processa o produto 'pf_checking_account'.
        Atualiza o saldo bancário e registra lançamentos no extrato com categorização automática.
        """
        print(f"[CONTA] [KLAVI] Processando contas correntes para User ID: {user_id}")
        user = User.query.get(user_id)
        if not user:
            print(f"[AVISO] [KLAVI] Usuário {user_id} não encontrado.")
            return False

        if isinstance(accounts_data, dict):
            if "accounts" in accounts_data and isinstance(accounts_data["accounts"], list):
                accounts_data = accounts_data["accounts"]
            elif "data" in accounts_data and isinstance(accounts_data["data"], list):
                accounts_data = accounts_data["data"]
            elif "items" in accounts_data and isinstance(accounts_data["items"], list):
                accounts_data = accounts_data["items"]
            else:
                accounts_data = [accounts_data]
        elif not isinstance(accounts_data, list):
            accounts_data = [accounts_data]

        imported_tx_count = 0
        updated_accounts_count = 0

        for acc in accounts_data:
            if not isinstance(acc, dict):
                continue

            brand_name = acc.get("brandName") or acc.get("institutionName") or acc.get("bankName") or "Banco Open Finance"
            branch_code = acc.get("branchCode") or acc.get("agency") or ""
            account_number = acc.get("number") or acc.get("accountNumber") or ""
            check_digit = acc.get("checkDigit") or acc.get("digit")
            full_account = f"{account_number}-{check_digit}" if check_digit else str(account_number)
            account_id_klavi = acc.get("accountId") or f"{brand_name}_{branch_code}_{full_account}".replace(" ", "_")

            # 1. Busca ou Cria a Conta Bancária
            bank_account = BankAccount.query.filter(
                BankAccount.user_id == user_id,
                (BankAccount.klavi_account_id == account_id_klavi) | 
                (BankAccount.account_number == full_account)
            ).first()

            # Saldo disponível flexível
            balances = acc.get("balances") or {}
            available_balance = 0.0
            if isinstance(balances, dict):
                avail_data = balances.get("availableAmount") or balances.get("available")
                if isinstance(avail_data, dict):
                    available_balance = float(avail_data.get("amount", 0.0))
                elif isinstance(avail_data, (int, float)):
                    available_balance = float(avail_data)
                elif "amount" in balances:
                    available_balance = float(balances.get("amount", 0.0))
            elif isinstance(balances, (int, float)):
                available_balance = float(balances)
            elif "balance" in acc:
                available_balance = float(acc.get("balance", 0.0))
            elif "availableBalance" in acc:
                available_balance = float(acc.get("availableBalance", 0.0))

            if not bank_account:
                bank_account = BankAccount(
                    user_id=user_id,
                    bank_name=brand_name,
                    agency=branch_code,
                    account_number=full_account or "000000",
                    initial_balance=available_balance,
                    current_balance=available_balance,
                    is_active=True,
                    klavi_link_id=link_id,
                    klavi_account_id=account_id_klavi,
                    observations="Sincronizado automaticamente via Klavi Open Finance"
                )
                db.session.add(bank_account)
                db.session.commit()
                print(f"[NOVO] [KLAVI] Nova Conta Bancária criada e comitada: {brand_name} ({full_account}) com saldo R$ {available_balance:.2f}")
            else:
                bank_account.current_balance = available_balance
                bank_account.is_active = True
                bank_account.klavi_link_id = link_id
                bank_account.klavi_account_id = account_id_klavi
                db.session.commit()
                print(f"[ATUALIZADO] [KLAVI] Saldo atualizado e comitado para {brand_name}: R$ {available_balance:.2f}")

            updated_accounts_count += 1

            # 2. Processa o Histórico de Transações do Extrato
            transactions_list = acc.get("transactionDetails") or acc.get("transactions") or []
            batch_tx_count = 0
            for tx in transactions_list:
                try:
                    tx_id = tx.get("transactionId") or tx.get("id")
                    if not tx_id:
                        continue

                    klavi_tx_key = f"klavi_{tx_id}"
                    # Evita duplicidade
                    existing_tx = Transaction.query.filter_by(
                        user_id=user_id,
                        klavi_transaction_id=klavi_tx_key
                    ).first()
                    if existing_tx:
                        continue

                    # Determina tipo (entrada vs saída)
                    credit_debit = str(tx.get("creditDebitType", "")).upper()
                    is_income = "CREDITO" in credit_debit or "CREDIT" in credit_debit
                    tx_type = "entrada" if is_income else "saida"

                    # Valor
                    amt_data = tx.get("transactionAmount", {})
                    if isinstance(amt_data, dict):
                        amount_val = float(amt_data.get("amount", tx.get("amount", 0.0)))
                    else:
                        amount_val = float(amt_data or tx.get("amount", 0.0))
                    amount_val = abs(amount_val)
                    if amount_val == 0:
                        continue

                    # Data
                    date_str = tx.get("transactionDate") or tx.get("date")
                    tx_date = date.today()
                    if date_str:
                        try:
                            tx_date = datetime.strptime(date_str[:10], "%Y-%m-%d").date()
                        except Exception:
                            tx_date = date.today()

                    # Descrição
                    tx_name = tx.get("transactionName") or tx.get("description") or tx.get("type") or "Lançamento Bancário"

                    # Auto-categorização com suporte a IA L3 da Klavi
                    klavi_cat = tx.get("category") or tx.get("categoryL2") or tx.get("subCategory") or tx.get("categoryName")
                    category = self._match_or_create_category(user_id, tx_name, tx_type, klavi_cat=klavi_cat)

                    new_tx = Transaction(
                        user_id=user_id,
                        date=tx_date,
                        type=tx_type,
                        category_id=category.id,
                        format="variavel",
                        payment_form="a_vista",
                        installments=1,
                        current_installment=1,
                        description=tx_name,
                        value=amount_val,
                        status="confirmada",
                        confirmed_at=datetime.utcnow(),
                        bank_account_id=bank_account.id,
                        klavi_transaction_id=klavi_tx_key
                    )
                    db.session.add(new_tx)
                    imported_tx_count += 1
                    batch_tx_count += 1

                    if batch_tx_count >= 50:
                        db.session.commit()
                        batch_tx_count = 0
                except Exception as tx_err:
                    db.session.rollback()
                    print(f"[AVISO] [KLAVI] Erro ao importar transação do extrato: {tx_err}")
                    continue

            if batch_tx_count > 0:
                try:
                    db.session.commit()
                except Exception as b_err:
                    db.session.rollback()
                    print(f"[AVISO] [KLAVI] Erro ao comitar lote final: {b_err}")

        try:
            db.session.commit()
        except Exception:
            pass
        print(f"[OK] [KLAVI] Extrato concluído: {updated_accounts_count} contas atualizadas, {imported_tx_count} transações importadas.")
        return True

    # =========================================================================
    # 5. MOTOR DE INGESTÃO 2: CARTÕES DE CRÉDITO (FATURAS E GASTOS)
    # =========================================================================
    def process_credit_card_data(self, user_id, cards_data, link_id=None):
        """
        Processa o produto 'pf_credit_card'.
        Cadastra o cartão, ajusta limites, faturas e compras com desdobramento de parcelas.
        """
        print(f"[CARTAO] [KLAVI] Processando cartões de crédito para User ID: {user_id}")
        user = User.query.get(user_id)
        if not user:
            return False

        if isinstance(cards_data, dict):
            if "creditCards" in cards_data and isinstance(cards_data["creditCards"], list):
                cards_data = cards_data["creditCards"]
            elif "cards" in cards_data and isinstance(cards_data["cards"], list):
                cards_data = cards_data["cards"]
            elif "data" in cards_data and isinstance(cards_data["data"], list):
                cards_data = cards_data["data"]
            elif "items" in cards_data and isinstance(cards_data["items"], list):
                cards_data = cards_data["items"]
            else:
                cards_data = [cards_data]
        elif not isinstance(cards_data, list):
            cards_data = [cards_data]

        imported_card_tx = 0

        for card_item in cards_data:
            if not isinstance(card_item, dict):
                continue
            brand_name = card_item.get("brandName") or card_item.get("bacenName") or card_item.get("institutionName") or "Cartão de Crédito"
            card_name = card_item.get("name") or card_item.get("cardName") or f"{brand_name} Open Finance"
            last_digits = str(card_item.get("lastDigits") or card_item.get("number") or card_item.get("lastFourDigits") or "0000")[-4:]
            klavi_card_id = card_item.get("cardId") or f"card_{brand_name}_{last_digits}".replace(" ", "_")

            # Limites (suporta estrutura Klavi L3 limitAmount e availableAmount)
            limits_info = card_item.get("limits") or {}
            total_limit = 2000.0
            avail_limit = 2000.0
            if isinstance(limits_info, dict):
                lim_obj = limits_info.get("limitAmount") or limits_info.get("creditLimit")
                if isinstance(lim_obj, dict):
                    total_limit = float(lim_obj.get("amount", 2000.0))
                elif lim_obj is not None:
                    total_limit = float(lim_obj)
                elif "limit" in card_item:
                    total_limit = float(card_item.get("limit", 2000.0))

                avail_obj = limits_info.get("availableAmount") or limits_info.get("availableLimit")
                if isinstance(avail_obj, dict):
                    avail_limit = float(avail_obj.get("amount", total_limit))
                elif avail_obj is not None:
                    avail_limit = float(avail_obj)
                else:
                    avail_limit = total_limit

            # Dias de fechamento e vencimento (com defaults seguros se não fornecidos pelo banco)
            due_day = int(card_item.get("dueDay", 10))
            closing_day = int(card_item.get("closingDay", max(due_day - 7, 1)))

            # 1. Busca ou Cria o Cartão
            credit_card = CreditCard.query.filter(
                CreditCard.user_id == user_id,
                (CreditCard.klavi_card_id == klavi_card_id) |
                ((CreditCard.name == card_name) & (CreditCard.last_digits == last_digits))
            ).first()

            if not credit_card:
                credit_card = CreditCard(
                    user_id=user_id,
                    name=card_name,
                    brand=brand_name,
                    limit=total_limit,
                    available_limit=avail_limit,
                    closing_day=closing_day,
                    due_day=due_day,
                    last_digits=last_digits,
                    klavi_link_id=link_id,
                    klavi_card_id=klavi_card_id,
                    is_active=True
                )
                db.session.add(credit_card)
                db.session.commit()
                print(f"[NOVO] [KLAVI] Novo Cartão cadastrado e comitado: {card_name} (Final {last_digits})")
            else:
                credit_card.limit = total_limit
                credit_card.available_limit = avail_limit
                credit_card.is_active = True
                credit_card.klavi_link_id = link_id
                credit_card.klavi_card_id = klavi_card_id
                db.session.commit()
                print(f"[ATUALIZADO] [KLAVI] Limites atualizados para {card_name}: Disponível R$ {avail_limit:.2f}")

            # 2. Processa as Faturas e Transações do Cartão (suporte a closedStatements e openStatement)
            closed_stmts = card_item.get("closedStatements") or []
            open_stmt = card_item.get("openStatement")
            all_stmts = closed_stmts + ([open_stmt] if isinstance(open_stmt, dict) else [])

            bills = card_item.get("bills") or card_item.get("invoices") or all_stmts
            transactions_list = card_item.get("transactions") or []

            # Se vier por faturas
            for bill in bills:
                bill_date_str = bill.get("dueDate") or bill.get("closingDate")
                bill_date = date.today()
                if bill_date_str:
                    try:
                        bill_date = datetime.strptime(bill_date_str[:10], "%Y-%m-%d").date()
                    except Exception:
                        bill_date = date.today()

                fatura = self._get_or_create_fatura(user_id, credit_card, bill_date)
                raw_bill_total = bill.get("totalAmount") or bill.get("billTotalAmount") or bill.get("amount") or 0.0
                if isinstance(raw_bill_total, dict):
                    bill_total = float(raw_bill_total.get("amount", 0.0))
                else:
                    bill_total = float(raw_bill_total or 0.0)

                if bill_total > 0:
                    fatura.valor_total = bill_total
                    db.session.commit()

                # Transações da fatura específica (suporta transactionDetails e transactions)
                bill_txs = bill.get("transactionDetails") or bill.get("transactions") or []
                for b_tx in bill_txs:
                    if self._save_card_transaction(user_id, credit_card, fatura, b_tx):
                        imported_card_tx += 1

            # Transações gerais do cartão (se não aninhadas em faturas)
            for g_tx in transactions_list:
                tx_date_str = g_tx.get("transactionDate") or g_tx.get("date")
                tx_date = date.today()
                if tx_date_str:
                    try:
                        tx_date = datetime.strptime(tx_date_str[:10], "%Y-%m-%d").date()
                    except Exception:
                        tx_date = date.today()

                fatura = self._get_or_create_fatura(user_id, credit_card, tx_date)
                if self._save_card_transaction(user_id, credit_card, fatura, g_tx):
                    imported_card_tx += 1

            # Recalcula o valor_total de cada fatura deste cartão com base nas transações importadas
            try:
                card_faturas = Fatura.query.filter_by(cartao_id=credit_card.id, user_id=user_id).all()
                for fat in card_faturas:
                    sum_val = db.session.query(func.coalesce(func.sum(CreditCardTransaction.value), 0.0)).filter_by(fatura_id=fat.id).scalar()
                    if sum_val and float(sum_val) > 0:
                        fat.valor_total = float(sum_val)
                db.session.commit()
            except Exception as rec_err:
                print(f"[AVISO] [KLAVI] Erro ao recalcular faturas: {rec_err}")

        db.session.commit()
        print(f"[OK] [KLAVI] Cartões concluídos: {imported_card_tx} compras de cartão importadas/atualizadas.")
        return True

    # =========================================================================
    # 6. MOTOR DE INGESTÃO 3: EMPRÉSTIMOS E FINANCIAMENTOS (PARCELAS FUTURAS PENDENTES)
    # =========================================================================
    def process_loans_data(self, user_id, loans_data, link_id=None):
        """
        Processa os produtos 'pf_loans' e 'pf_financing'.
        Mapeia contratos de empréstimos, taxas e cria as parcelas a vencer como:
        1. Transações com status 'pendente' (previsão de saída no fluxo de caixa)
        2. Eventos na Agenda Financeira (lembretes de vencimento)
        """
        print(f"[CONTRATO] [KLAVI] Processando empréstimos e financiamentos para User ID: {user_id}")
        user = User.query.get(user_id)
        if not user:
            return False

        if not isinstance(loans_data, list):
            loans_data = [loans_data]

        imported_installments_count = 0
        today = date.today()

        # Garante categoria de empréstimos
        loan_category = Category.query.filter_by(user_id=user_id, name="Empréstimos e Financiamentos").first()
        if not loan_category:
            loan_category = Category(
                name="Empréstimos e Financiamentos",
                type="saida",
                color="#EF4444",
                user_id=user_id
            )
            db.session.add(loan_category)
            db.session.flush()

        for contract in loans_data:
            contract_number = str(contract.get("contractNumber") or contract.get("contractId") or "CONTRATO_OP")
            brand_name = contract.get("brandName") or "Instituição Financeira"
            total_amount = float(contract.get("contractAmount", contract.get("totalAmount", 0.0)))
            
            installments = contract.get("installments") or contract.get("balloonPayments") or []
            total_inst_count = len(installments) if installments else int(contract.get("totalNumberOfInstallments", 1))

            print(f"[DOC] [KLAVI] Contrato {contract_number} ({brand_name}): Total R$ {total_amount:.2f}")

            # Itera pelas parcelas informadas pelo Open Finance
            for idx, inst in enumerate(installments, start=1):
                due_date_str = inst.get("dueDate") or inst.get("date")
                if not due_date_str:
                    continue

                try:
                    due_date = datetime.strptime(due_date_str[:10], "%Y-%m-%d").date()
                except Exception:
                    continue

                # Focamos em parcelas futuras ou do mês atual que estejam pendentes
                inst_amount = float(inst.get("amount", inst.get("installmentAmount", 0.0)))
                if inst_amount <= 0:
                    continue

                inst_number = int(inst.get("installmentNumber", idx))
                unique_loan_tx_id = f"klavi_loan_{contract_number}_{inst_number}_{due_date}"

                # 1. Verifica se já existe a transação dessa parcela
                existing_tx = Transaction.query.filter_by(
                    user_id=user_id,
                    klavi_transaction_id=unique_loan_tx_id
                ).first()

                # Status: Se já venceu no passado e está quitada pelo banco, confirmada; senão 'pendente'
                is_paid = inst.get("status") in ["PAID", "PAGA", "QUITADA"] or due_date < today
                tx_status = "confirmada" if is_paid else "pendente"

                if not existing_tx:
                    loan_tx = Transaction(
                        user_id=user_id,
                        date=due_date,
                        type="saida",
                        category_id=loan_category.id,
                        format="fixo",
                        payment_form="parcelado",
                        installments=total_inst_count,
                        current_installment=inst_number,
                        description=f"Parcela {inst_number}/{total_inst_count} - Empréstimo {brand_name}",
                        value=inst_amount,
                        status=tx_status,
                        is_loan_installment=True,
                        contract_id=contract_number,
                        klavi_transaction_id=unique_loan_tx_id
                    )
                    db.session.add(loan_tx)
                    imported_installments_count += 1

                # 2. Se for parcela futura, adiciona ou atualiza na Agenda Financeira (schedule_events)
                if due_date >= today:
                    existing_event = ScheduleEvent.query.filter_by(
                        user_id=user_id,
                        date=due_date,
                        title=f"Vencimento Empréstimo: {brand_name} ({inst_number}/{total_inst_count})"
                    ).first()

                    if not existing_event:
                        schedule_item = ScheduleEvent(
                            user_id=user_id,
                            title=f"Vencimento Empréstimo: {brand_name} ({inst_number}/{total_inst_count})",
                            description=f"Contrato nº {contract_number}. Parcela de R$ {inst_amount:.2f}.",
                            date=due_date,
                            time="08:00",
                            type="pagamento",
                            priority="high",
                            value=inst_amount,
                            category="Empréstimos",
                            is_completed=False,
                            is_recurring=False
                        )
                        db.session.add(schedule_item)

        db.session.commit()
        print(f"[OK] [KLAVI] Empréstimos concluídos: {imported_installments_count} parcelas registradas.")
        return True

    # =========================================================================
    # FUNÇÕES AUXILIARES DE SUPORTE
    # =========================================================================
    def _save_card_transaction(self, user_id, credit_card, fatura, tx_data):
        """
        Salva uma compra no cartão de crédito:
        1. Registra em CreditCardTransaction vinculado à Fatura (para exibição no módulo Cartões/Faturas)
        2. Espelha na tabela Transaction (para exibição geral no módulo Lançamentos)
        """
        tx_id = tx_data.get("transactionId") or tx_data.get("id")
        if not tx_id:
            return False

        klavi_tx_key = f"klavi_card_{tx_id}"
        existing = CreditCardTransaction.query.filter_by(
            user_id=user_id,
            klavi_transaction_id=klavi_tx_key
        ).first()

        raw_amt = tx_data.get("brazilianAmount") or tx_data.get("transactionAmount") or tx_data.get("amount") or 0.0
        if isinstance(raw_amt, dict):
            amount = abs(float(raw_amt.get("amount", 0.0)))
        else:
            amount = abs(float(raw_amt or 0.0))
        if amount == 0:
            return False

        date_str = tx_data.get("transactionDate") or tx_data.get("date")
        tx_date = date.today()
        if date_str:
            try:
                tx_date = datetime.strptime(date_str[:10], "%Y-%m-%d").date()
            except Exception:
                tx_date = date.today()

        desc = tx_data.get("description") or tx_data.get("transactionName") or "Compra no Cartão"
        klavi_cat = tx_data.get("category") or tx_data.get("categoryL2") or tx_data.get("subCategory") or tx_data.get("categoryName")
        category = self._match_or_create_category(user_id, desc, "saida", klavi_cat=klavi_cat)

        installments = int(tx_data.get("installments", tx_data.get("totalInstallments", 1)))
        current_inst = int(tx_data.get("currentInstallment", 1))

        # 1. Salva em CreditCardTransaction (para faturas e cartões)
        if not existing:
            new_card_tx = CreditCardTransaction(
                user_id=user_id,
                credit_card_id=credit_card.id,
                fatura_id=fatura.id if fatura else None,
                category_id=category.id,
                description=desc,
                value=amount,
                date=tx_date,
                installments=installments,
                current_installment=current_inst,
                is_recurring=False,
                klavi_transaction_id=klavi_tx_key
            )
            db.session.add(new_card_tx)

        # 2. Espelha na tabela Transaction (para aparecer em 'Lançamentos' gerais)
        main_tx_key = f"klavi_card_main_{tx_id}"
        existing_main = Transaction.query.filter_by(
            user_id=user_id,
            klavi_transaction_id=main_tx_key
        ).first()

        if not existing_main:
            card_desc = f"{desc} ({credit_card.name})" if credit_card else desc
            main_tx = Transaction(
                user_id=user_id,
                date=tx_date,
                type="saida",
                category_id=category.id,
                format="variavel",
                payment_form="parcelado" if installments > 1 else "a_vista",
                installments=installments,
                current_installment=current_inst,
                description=card_desc,
                value=amount,
                status="confirmada",
                confirmed_at=datetime.utcnow(),
                klavi_transaction_id=main_tx_key
            )
            db.session.add(main_tx)

        return True

    def _get_or_create_fatura(self, user_id, card, trans_date):
        """Calcula o mês de referência e busca/cria a fatura correspondente."""
        if trans_date.day >= card.closing_day:
            if trans_date.month == 12:
                mes_ref = 1
                ano_ref = trans_date.year + 1
            else:
                mes_ref = trans_date.month + 1
                ano_ref = trans_date.year
        else:
            mes_ref = trans_date.month
            ano_ref = trans_date.year

        fatura = Fatura.query.filter_by(
            cartao_id=card.id,
            user_id=user_id,
            mes=mes_ref,
            ano=ano_ref
        ).first()

        hoje = date.today()
        is_passada = (ano_ref < hoje.year or (ano_ref == hoje.year and mes_ref < hoje.month))
        status_esperado = "paga" if is_passada else "aberta"

        if not fatura:
            fatura = Fatura(
                cartao_id=card.id,
                user_id=user_id,
                valor_total=0.0,
                mes=mes_ref,
                ano=ano_ref,
                status=status_esperado
            )
            db.session.add(fatura)
            db.session.commit()
        else:
            # Normaliza faturas antigas marcadas com 'em_aberto' para 'aberta'
            if fatura.status == "em_aberto":
                fatura.status = "aberta"
                db.session.commit()

        return fatura

    # =========================================================================
    # 7. LIMPEZA E DESCONEXÃO DE DADOS (CLEANUP)
    # =========================================================================
    def clean_all_user_data(self, user_id):
        """
        Remove todas as contas, cartões, faturas e transações importadas via Klavi Open Finance
        para o usuário especificado, restaurando o estado limpo do Simplific Pro.
        """
        try:
            print(f"[LIMPEZA] [KLAVI] Iniciando limpeza total de dados Open Finance para user_id={user_id}...")
            
            # 1. Busca IDs dos cartões e contas da Klavi
            klavi_cards = CreditCard.query.filter(
                CreditCard.user_id == user_id,
                (CreditCard.klavi_card_id.isnot(None) | CreditCard.klavi_link_id.isnot(None))
            ).all()
            card_ids = [c.id for c in klavi_cards]

            klavi_accounts = BankAccount.query.filter(
                BankAccount.user_id == user_id,
                (BankAccount.klavi_account_id.isnot(None) | BankAccount.klavi_link_id.isnot(None))
            ).all()
            account_ids = [a.id for a in klavi_accounts]

            # 2. Deleta CreditCardTransaction
            deleted_card_tx = 0
            if card_ids:
                deleted_card_tx += CreditCardTransaction.query.filter(
                    CreditCardTransaction.user_id == user_id,
                    CreditCardTransaction.credit_card_id.in_(card_ids)
                ).delete(synchronize_session=False)

            deleted_card_tx += CreditCardTransaction.query.filter(
                CreditCardTransaction.user_id == user_id,
                CreditCardTransaction.klavi_transaction_id.isnot(None)
            ).delete(synchronize_session=False)

            # 3. Deleta Faturas dos cartões Klavi
            deleted_faturas = 0
            if card_ids:
                deleted_faturas = Fatura.query.filter(
                    Fatura.user_id == user_id,
                    Fatura.cartao_id.in_(card_ids)
                ).delete(synchronize_session=False)

            # 4. Deleta Cartões Klavi
            deleted_cards = len(klavi_cards)
            for c in klavi_cards:
                db.session.delete(c)

            # 5. Deleta Transações gerais da Klavi (extrato e compras espelhadas de cartão)
            deleted_tx = Transaction.query.filter(
                Transaction.user_id == user_id,
                (
                    Transaction.klavi_transaction_id.isnot(None) |
                    (Transaction.bank_account_id.in_(account_ids) if account_ids else False)
                )
            ).delete(synchronize_session=False)

            # 6. Deleta Contas Bancárias Klavi
            deleted_accounts = len(klavi_accounts)
            for a in klavi_accounts:
                db.session.delete(a)

            # 7. Deleta eventos de agenda gerados por empréstimos Klavi
            ScheduleEvent.query.filter(
                ScheduleEvent.user_id == user_id,
                ScheduleEvent.category == "Empréstimos",
                ScheduleEvent.title.ilike("%Vencimento Empréstimo:%")
            ).delete(synchronize_session=False)

            db.session.commit()
            print(f"[OK] [KLAVI LIMPEZA] Concluída com sucesso! Removidos: {deleted_accounts} contas, {deleted_cards} cartões, {deleted_faturas} faturas, {deleted_card_tx} compras de cartão, {deleted_tx} transações.")
            return {
                "deleted_accounts": deleted_accounts,
                "deleted_cards": deleted_cards,
                "deleted_faturas": deleted_faturas,
                "deleted_card_transactions": deleted_card_tx,
                "deleted_transactions": deleted_tx
            }
        except Exception as e:
            db.session.rollback()
            print(f"[ERRO] [KLAVI LIMPEZA] Falha ao limpar dados: {e}")
            raise e

    def _match_or_create_category(self, user_id, description, tx_type, klavi_cat=None):
        """Mapeia inteligentemente ou encontra a melhor categoria para o lançamento."""
        # 1. Se a Klavi enviou categoria pelo modelo de IA L3, prioriza ela
        if klavi_cat and isinstance(klavi_cat, str) and klavi_cat.strip():
            clean_name = klavi_cat.strip()
            cat = Category.query.filter(
                Category.user_id == user_id,
                Category.type == tx_type,
                Category.name.ilike(clean_name)
            ).first()
            if cat:
                return cat
            cat = Category(
                name=clean_name.capitalize(),
                type=tx_type,
                color="#10B981" if tx_type == "entrada" else "#F59E0B",
                user_id=user_id
            )
            db.session.add(cat)
            db.session.flush()
            return cat

        # 2. Heurística baseada na descrição (regras de palavras-chave)
        desc_lower = (description or "").lower()

        # Dicionário de regras rápidas para Open Finance
        keyword_map = {
            "alimentacao": ["restaurante", "ifood", "uber eats", "mercado", "padaria", "supermercado", "carrefour", "pao de acucar", "lanchonete", "mcdonalds", "burger", "refeicao"],
            "transporte": ["uber", "99app", "posto", "combustivel", "gasolina", "estacionamento", "pedagio", "sem parar", "veloe", "ipva"],
            "moradia": ["aluguel", "condominio", "energia", "enel", "sabesp", "copasa", "cpfl", "luz", "agua", "internet", "claro", "vivo", "tim"],
            "lazer": ["netflix", "spotify", "cinema", "ingresso", "amazon prime", "disney", "steam", "playstation", "show"],
            "saude": ["farmacia", "drogaria", "droga", "hospital", "clinica", "medico", "consulta", "laboratorio", "unimed", "dentista"],
            "educacao": ["curso", "escola", "faculdade", "udemy", "livraria", "idiomas", "mensalidade"],
            "salario": ["salario", "ted recebida", "pix recebido", "pro labore", "rendimento", "deposito", "transferencia recebida"]
        }

        matched_name = None
        for cat_name, keywords in keyword_map.items():
            if any(k in desc_lower for k in keywords):
                matched_name = cat_name.capitalize()
                break

        # Tenta achar categoria existente do usuário
        if matched_name:
            cat = Category.query.filter(
                Category.user_id == user_id,
                Category.type == tx_type,
                Category.name.ilike(f"%{matched_name}%")
            ).first()
            if cat:
                return cat

        # Categoria padrão de fallback
        default_name = "Receitas Diversas" if tx_type == "entrada" else "Outros Gastos"
        fallback_cat = Category.query.filter_by(user_id=user_id, name=default_name, type=tx_type).first()
        if not fallback_cat:
            fallback_cat = Category(
                name=default_name,
                type=tx_type,
                color="#64748B",
                user_id=user_id
            )
            db.session.add(fallback_cat)
            db.session.flush()

        return fallback_cat

