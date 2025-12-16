#!/bin/bash
set -e

echo "Running database migrations..."
flask db upgrade

echo "Creating default categories..."
flask create-categories

echo "Creating admin user..."
flask create-admin

echo "Starting Gunicorn server..."
gunicorn --timeout 600 src.main:app