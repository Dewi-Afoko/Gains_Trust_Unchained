#!/bin/bash

# Build React frontend and copy to Django project for deployment

echo "Building React frontend..."
cd ../frontend
npm run build

echo "Copying build files to Django project..."
cd ../Gains_Trust
rm -rf frontend_build
mkdir -p frontend_build
cp -r ../frontend/build/* frontend_build/

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Frontend build complete!" 