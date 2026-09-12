import os
from src.main import app
from src.models.db import db
from sqlalchemy import text

def delete_inactive_users_safely():
    with app.app_context():
        # Tabelas que possuem user_id, ordenadas das mais dependentes para as menos dependentes
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
        
        # Encontra IDs dos usuários inativos
        users_query = text("SELECT id FROM users WHERE status = 'inativo';")
        inactive_users = db.session.execute(users_query).fetchall()
        user_ids = [str(u[0]) for u in inactive_users]
        
        if not user_ids:
            print("Nenhum usuário inativo encontrado para exclusão.")
            return

        user_ids_str = ",".join(user_ids)
        print(f"Excluindo dados de {len(user_ids)} usuários inativos: {user_ids_str}")
        
        # Deleta de cada tabela dependente
        for table in tables_to_clean:
            try:
                del_sql = text(f"DELETE FROM {table} WHERE user_id IN ({user_ids_str});")
                res = db.session.execute(del_sql)
                print(f"[{table}] {res.rowcount} registros deletados.")
            except Exception as e:
                print(f"Aviso ao deletar de {table}: {e}")
                db.session.rollback()
                continue
                
        # Finalmente, deleta os usuários
        try:
            db.session.execute(text(f"DELETE FROM users WHERE id IN ({user_ids_str});"))
            db.session.commit()
            print("Usuários inativos excluídos com SUCESSO!")
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao deletar usuários: {e}")

if __name__ == "__main__":
    delete_inactive_users_safely()
