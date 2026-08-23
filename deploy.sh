#!/bin/bash
# Deploy: run as andrey from /var/www/stackdiagram
set -euo pipefail
cd /var/www/stackdiagram
git pull --ff-only
composer install --no-dev --optimize-autoloader --no-interaction
npm ci && npm run build
php artisan migrate --force
php artisan config:cache && php artisan route:cache && php artisan view:cache
sudo systemctl restart stackdiagram-queue
sudo systemctl reload php8.4-fpm
echo "deployed $(git rev-parse --short HEAD)"
