from sqlalchemy import text
from src.models.db import db  # sua instância única do SQLAlchemy

def execute_query(query, params=None):
    try:
        with db.engine.connect() as conn:
            trans = conn.begin()
            try:
                if params:
                    result = conn.execute(text(query), params)
                else:
                    result = conn.execute(text(query))

                if query.strip().lower().startswith('select'):
                    return [dict(row._mapping) for row in result.fetchall()]
                else:
                    trans.commit()
                    return result.rowcount

            except Exception as e:
                trans.rollback()
                print(f"Erro ao executar query: {e}")
                raise

    except Exception as e:
        print(f"Erro de conexão com o banco: {e}")
        raise
