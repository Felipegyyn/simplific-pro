import os
from src.main import app
from src.models.db import db
from sqlalchemy import text

def fix_foreign_keys_and_delete_inactive():
    with app.app_context():
        # 1. Encontrar todas as chaves estrangeiras que apontam para users(id)
        query = text("""
            SELECT
                tc.table_name, 
                kcu.column_name, 
                tc.constraint_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND ccu.table_name = 'users' 
              AND ccu.column_name = 'id';
        """)
        
        result = db.session.execute(query).fetchall()
        
        print(f"Encontradas {len(result)} chaves estrangeiras apontando para users(id).")
        
        # 2. Alterar cada constraint para adicionar ON DELETE CASCADE
        for row in result:
            table_name = row[0]
            column_name = row[1]
            constraint_name = row[2]
            
            # Dropar a constraint antiga
            drop_sql = text(f"ALTER TABLE {table_name} DROP CONSTRAINT {constraint_name};")
            db.session.execute(drop_sql)
            
            # Adicionar a nova constraint com CASCADE
            add_sql = text(f"ALTER TABLE {table_name} ADD CONSTRAINT {constraint_name} FOREIGN KEY ({column_name}) REFERENCES users(id) ON DELETE CASCADE;")
            db.session.execute(add_sql)
            
            print(f"Atualizada tabela {table_name}: Constraint {constraint_name} agora tem ON DELETE CASCADE.")
            
        db.session.commit()
        print("Todas as constraints atualizadas com sucesso!")
        
        # 3. Excluir usuários inativos
        delete_query = text("DELETE FROM users WHERE status = 'inativo';")
        result_delete = db.session.execute(delete_query)
        db.session.commit()
        
        print(f"Usuários inativos excluídos com sucesso. Total de registros afetados: {result_delete.rowcount}")

if __name__ == "__main__":
    fix_foreign_keys_and_delete_inactive()
