#!/bin/bash
set -e

echo "Running database migrations..."
flask db upgrade

echo "Creating default categories..."
flask create-categories

echo "Creating admin user..."
flask create-admin

echo "Starting Gunicorn server..."
gunicorn --workers 1 --threads 4 src.main:app