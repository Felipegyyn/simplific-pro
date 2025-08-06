#!/bin/bash
set -e

echo "Starting build process..."

echo "Step 1: Installing dependencies..."
pip install -r requirements.txt

echo "Step 2: Running database migrations..."
flask db upgrade

echo "Step 3: Creating default categories..."
flask create-categories

echo "Step 4: Creating admin user..."
flask create-admin

echo "Build process finished successfully!"