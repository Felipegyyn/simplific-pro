import os
import sys
import glob
import re
import sqlalchemy as sa

def fix_alembic_version():
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("[INFO] DATABASE_URL nao configurada no ambiente. Nenhuma acao no banco de dados remota.")
        return
        
    # No Render ou Heroku as vezes DATABASE_URL comeca com postgres:// em vez de postgresql://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    try:
        engine = sa.create_engine(db_url)
        with engine.connect() as conn:
            # Verifica se a tabela alembic_version existe
            inspector = sa.inspect(engine)
            if 'alembic_version' not in inspector.get_table_names():
                print("[INFO] Tabela alembic_version nao existe ainda no banco. Nada a corrigir.")
                return
                
            result = conn.execute(sa.text("SELECT version_num FROM alembic_version")).fetchone()
            if not result:
                print("[INFO] Tabela alembic_version esta vazia.")
                return
                
            current_version = result[0]
            print(f"[INFO] Versao atual registrada no banco (alembic_version): {current_version}")
            
            # Mapeia todos os arquivos em migrations/versions (na raiz ou em src)
            root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
            migrations_dir = os.path.join(root_dir, 'migrations', 'versions')
            if not os.path.exists(migrations_dir) or not glob.glob(os.path.join(migrations_dir, '*.py')):
                alt_dir = os.path.join(root_dir, 'src', 'migrations', 'versions')
                if os.path.exists(alt_dir) and glob.glob(os.path.join(alt_dir, '*.py')):
                    migrations_dir = alt_dir

            if not os.path.exists(migrations_dir):
                print(f"[WARN] Diretorio de migracoes nao encontrado em: {migrations_dir}")
                return

            migration_files = glob.glob(os.path.join(migrations_dir, '*.py'))
            
            all_revisions = set()
            all_parents = set()
            
            for f in migration_files:
                with open(f, 'r', encoding='utf-8', errors='ignore') as file:
                    content = file.read()
                    rev_match = re.search(r"revision\s*=\s*['\"]([^'\"]+)['\"]", content)
                    down_match = re.search(r"down_revision\s*=\s*['\"]([^'\"]+)['\"]", content)
                    
                    if rev_match:
                        rev = rev_match.group(1)
                        all_revisions.add(rev)
                    else:
                        basename = os.path.basename(f)
                        rev = basename.split('_')[0]
                        all_revisions.add(rev)
                        
                    if down_match and down_match.group(1) != 'None':
                        all_parents.add(down_match.group(1))
                        
            if current_version in all_revisions:
                print(f"[OK] Versao {current_version} e valida e existe nos arquivos de migracao locais.")
            else:
                print(f"[WARN] ATENCAO: Versao {current_version} do banco NAO EXISTE nos arquivos locais (causado pelo rollback no Git)!")
                
                # Identifica a versao HEAD local (revisao que esta em all_revisions mas nao em all_parents)
                head_revisions = list(all_revisions - all_parents)
                new_version = head_revisions[0] if head_revisions else None
                
                if new_version:
                    print(f"[FIX] Substituindo revisao orfa '{current_version}' pela revisao HEAD local '{new_version}'...")
                    conn.execute(sa.text("DELETE FROM alembic_version"))
                    conn.execute(sa.text("INSERT INTO alembic_version (version_num) VALUES (:ver)"), {"ver": new_version})
                    conn.commit()
                    print(f"[SUCCESS] Tabela alembic_version alinhada com precisao para: {new_version}")
                else:
                    print("[FIX] Limpando registro orfao de alembic_version para permitir novo stamp/upgrade...")
                    conn.execute(sa.text("DELETE FROM alembic_version"))
                    conn.commit()
                    print("[SUCCESS] Tabela alembic_version limpa com sucesso.")
                    
    except Exception as e:
        print(f"[WARN] Aviso durante a verificacao automatica de alembic_version: {e}")

if __name__ == '__main__':
    fix_alembic_version()
