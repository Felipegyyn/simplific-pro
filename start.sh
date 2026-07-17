#!/bin/bash
set -e

echo "Checking database migration consistency..."
python -m src.fix_db_migration || true

echo "Running database migrations..."
if ! flask db upgrade; then
    echo "⚠️ 'flask db upgrade' encontrou uma divergência de gráfico/versão. Forçando alinhamento ('flask db stamp head')..."
    flask db stamp head || true
    echo "🚀 Rodando 'flask db upgrade' após o stamp..."
    flask db upgrade || true
fi

echo "Creating default categories..."
flask create-categories || true

echo "Creating admin user..."
flask create-admin || true

echo "Starting Gunicorn server..."
gunicorn src.main:app