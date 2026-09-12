import os
from src.main import app
from src.models.db import db
from sqlalchemy import text

def delete_specific_users():
    with app.app_context():
        emails = [
            'contato.rennedyeidi@gmail.com',
            'jean.hd3@gmail.com',
            'cvn.camila@gmail.com',
            'gabrielemanuelsite@gmail.com',
            'saulo@smcgranitos.com'
        ]
        
        tables_to_clean = [
            "investment_transactions",
            "investments",
            "credit_card_transactions",
            "faturas",
            "credit_cards",
            "transactions",
            "planning",
            "schedule_events",
            "goals",
            "user_achievements",
            "password_reset_tokens",
            "contacts",
            "bank_accounts",
            "inventory_movements",
            "inventory_products",
            "business_payables",
            "business_receivables",
            "business_sales",
            "business_budgets",
            "business_categories",
            "business_bank_accounts",
            "business_stakeholders",
            "business_companies",
            "categories"
        ]
        
        email_list = ', '.join([f"'{e}'" for e in emails])
        users_query = text(f"SELECT id FROM users WHERE email IN ({email_list});")
        target_users = db.session.execute(users_query).fetchall()
        user_ids = [str(u[0]) for u in target_users]
        
        if not user_ids:
            print("Nenhum usuário correspondente encontrado.")
            return

        user_ids_str = ",".join(user_ids)
        print(f"Excluindo dados de {len(user_ids)} usuários: {user_ids_str}")
        
        for table in tables_to_clean:
            try:
                del_sql = text(f"DELETE FROM {table} WHERE user_id IN ({user_ids_str});")
                res = db.session.execute(del_sql)
                print(f"[{table}] {res.rowcount} registros deletados.")
            except Exception as e:
                print(f"Aviso ao deletar de {table}: {e}")
                db.session.rollback()
                continue
                
        try:
            db.session.execute(text(f"DELETE FROM users WHERE id IN ({user_ids_str});"))
            db.session.commit()
            print("Usuários específicos excluídos com SUCESSO!")
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao deletar usuários: {e}")

if __name__ == "__main__":
    delete_specific_users()
