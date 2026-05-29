#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Run database migrations
echo "⚙️ Running database migrations..."
python manage.py migrate --noinput

# Seed database with initial patient data and reference metadata
echo "🌱 Seeding reference metadata..."
python seed_medical_reference.py
echo "🌱 Seeding dynamic form configs..."
python seed_dynamic_config.py
echo "🌱 Seeding 1,000 realistic clinical records..."
python seed_dzcancer.py

# Collect static files for Django Admin
echo "📂 Collecting static files..."
python manage.py collectstatic --noinput

# Start the application using Gunicorn
echo "🚀 Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:8000 backend.wsgi:application
