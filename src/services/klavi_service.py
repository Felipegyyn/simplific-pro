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
            print(f"✅ [KLAVI] Novo accessToken gerado com sucesso! Expira em {expire_in}s")
            return self._access_token
        except Exception as e:
            print(f"❌ [KLAVI] Falha na autenticação: {e}")
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
            print(f"🔗 [KLAVI] Link criado para o usuário {user.email}: linkId={data.get('linkId')}")
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
            print(f"❌ [KLAVI] Erro ao criar Link Session: {e}{err_details}")
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
            "institutionId": str(institution_id),
            "products": target_products,
            "externalInfo": {
                "user_id": str(user_id) if user_id else ""
            }
        }

        if link_id:
            payload["linkId"] = str(link_id)
        if consent_ids:
            payload["consentId"] = consent_ids if isinstance(consent_ids, list) else [str(consent_ids)]

        try:
            response = self.session.post(url, json=payload, headers=headers, timeout=20)
            response.raise_for_status()
            print(f"📥 [KLAVI] Solicitação de dados enviada com sucesso para inst={institution_id}, taxId={clean_cpf}")
            return response.json()
        except Exception as e:
            print(f"❌ [KLAVI] Erro ao solicitar institution-data: {e}")
            # Log de erro detalhado da Klavi se disponível
            if hasattr(e, 'response') and e.response is not None:
                print(f"   Resposta Klavi: {e.response.text}")
            raise e

    # =========================================================================
    # 4. MOTOR DE INGESTÃO 1: CONTAS CORRENTES (SALDOS E EXTRATO)
    # =========================================================================
    def process_checking_account_data(self, user_id, accounts_data, link_id=None):
        """
        Processa o produto 'pf_checking_account'.
        Atualiza o saldo bancário e registra lançamentos no extrato com categorização automática.
        """
        print(f"🏦 [KLAVI] Processando contas correntes para User ID: {user_id}")
        user = User.query.get(user_id)
        if not user:
            print(f"⚠️ [KLAVI] Usuário {user_id} não encontrado.")
            return False

        if not isinstance(accounts_data, list):
            accounts_data = [accounts_data]

        imported_tx_count = 0
        updated_accounts_count = 0

        for acc in accounts_data:
            brand_name = acc.get("brandName") or "Banco Open Finance"
            branch_code = acc.get("branchCode") or ""
            account_number = acc.get("number") or ""
            check_digit = acc.get("checkDigit")
            full_account = f"{account_number}-{check_digit}" if check_digit else account_number
            account_id_klavi = f"{brand_name}_{branch_code}_{full_account}".replace(" ", "_")

            # 1. Busca ou Cria a Conta Bancária
            bank_account = BankAccount.query.filter(
                BankAccount.user_id == user_id,
                (BankAccount.klavi_account_id == account_id_klavi) | 
                (BankAccount.account_number == full_account)
            ).first()

            # Saldo disponível
            balances = acc.get("balances", {})
            available_amt_data = balances.get("availableAmount", {})
            available_balance = float(available_amt_data.get("amount", 0.0))

            if not bank_account:
                bank_account = BankAccount(
                    user_id=user_id,
                    bank_name=brand_name,
                    agency=branch_code,
                    account_number=full_account or "000000",
                    initial_balance=available_balance,
                    current_balance=available_balance,
                    klavi_link_id=link_id,
                    klavi_account_id=account_id_klavi,
                    observations="Sincronizado automaticamente via Klavi Open Finance"
                )
                db.session.add(bank_account)
                db.session.flush()
                print(f"✨ [KLAVI] Nova Conta Bancária criada: {brand_name} ({full_account})")
            else:
                bank_account.current_balance = available_balance
                bank_account.klavi_link_id = link_id
                bank_account.klavi_account_id = account_id_klavi
                print(f"🔄 [KLAVI] Saldo atualizado para {brand_name}: R$ {available_balance:.2f}")

            updated_accounts_count += 1

            # 2. Processa o Histórico de Transações do Extrato
            transactions_list = acc.get("transactionDetails") or acc.get("transactions") or []
            for tx in transactions_list:
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
                amount_val = float(amt_data.get("amount", tx.get("amount", 0.0)))
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

        db.session.commit()
        print(f"✅ [KLAVI] Extrato concluído: {updated_accounts_count} contas atualizadas, {imported_tx_count} transações importadas.")
        return True

    # =========================================================================
    # 5. MOTOR DE INGESTÃO 2: CARTÕES DE CRÉDITO (FATURAS E GASTOS)
    # =========================================================================
    def process_credit_card_data(self, user_id, cards_data, link_id=None):
        """
        Processa o produto 'pf_credit_card'.
        Cadastra o cartão, ajusta limites, faturas e compras com desdobramento de parcelas.
        """
        print(f"💳 [KLAVI] Processando cartões de crédito para User ID: {user_id}")
        user = User.query.get(user_id)
        if not user:
            return False

        if not isinstance(cards_data, list):
            cards_data = [cards_data]

        imported_card_tx = 0

        for card_item in cards_data:
            brand_name = card_item.get("brandName") or "Cartão de Crédito"
            card_name = card_item.get("name") or f"{brand_name} Open Finance"
            last_digits = str(card_item.get("lastDigits") or card_item.get("number") or "0000")[-4:]
            klavi_card_id = f"card_{brand_name}_{last_digits}".replace(" ", "_")

            # Limites
            limits_info = card_item.get("limits") or {}
            total_limit = float(limits_info.get("creditLimit", card_item.get("limit", 2000.0)))
            avail_limit = float(limits_info.get("availableLimit", card_item.get("availableLimit", total_limit)))

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
                db.session.flush()
                print(f"✨ [KLAVI] Novo Cartão cadastrado: {card_name} (Final {last_digits})")
            else:
                credit_card.limit = total_limit
                credit_card.available_limit = avail_limit
                credit_card.klavi_link_id = link_id
                credit_card.klavi_card_id = klavi_card_id
                print(f"🔄 [KLAVI] Limites atualizados para {card_name}: Disponível R$ {avail_limit:.2f}")

            # 2. Processa as Faturas e Transações do Cartão
            bills = card_item.get("bills") or card_item.get("invoices") or []
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
                bill_total = float(bill.get("totalAmount", bill.get("amount", 0.0)))
                if bill_total > 0:
                    fatura.valor_total = bill_total

                # Transações da fatura específica
                bill_txs = bill.get("transactions") or []
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

        db.session.commit()
        print(f"✅ [KLAVI] Cartões concluídos: {imported_card_tx} compras de cartão importadas/atualizadas.")
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
        print(f"📑 [KLAVI] Processando empréstimos e financiamentos para User ID: {user_id}")
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

            print(f"📄 [KLAVI] Contrato {contract_number} ({brand_name}): Total R$ {total_amount:.2f}")

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
        print(f"✅ [KLAVI] Empréstimos concluídos: {imported_installments_count} parcelas registradas.")
        return True

    # =========================================================================
    # FUNÇÕES AUXILIARES DE SUPORTE
    # =========================================================================
    def _save_card_transaction(self, user_id, credit_card, fatura, tx_data):
        """Salva uma compra no cartão de crédito evitando duplicidade."""
        tx_id = tx_data.get("transactionId") or tx_data.get("id")
        if not tx_id:
            return False

        klavi_tx_key = f"klavi_card_{tx_id}"
        existing = CreditCardTransaction.query.filter_by(
            user_id=user_id,
            klavi_transaction_id=klavi_tx_key
        ).first()
        if existing:
            return False

        amount = abs(float(tx_data.get("amount", tx_data.get("transactionAmount", {}).get("amount", 0.0))))
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
            mes=mes_ref,
            ano=ano_ref
        ).first()

        if not fatura:
            hoje = date.today()
            status_fatura = "paga" if (ano_ref < hoje.year or (ano_ref == hoje.year and mes_ref < hoje.month)) else "em_aberto"
            fatura = Fatura(
                cartao_id=card.id,
                user_id=user_id,
                valor_total=0.0,
                mes=mes_ref,
                ano=ano_ref,
                status=status_fatura
            )
            db.session.add(fatura)
            db.session.flush()

        return fatura

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

