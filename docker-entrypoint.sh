#!/bin/bash
set -e

# Render injects $PORT (usually 10000)
RENDER_PORT=${PORT:-10000}

# Update Apache ports configuration
sed -i "s/Listen 80/Listen ${RENDER_PORT}/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:${RENDER_PORT}>/g" /etc/apache2/sites-available/000-default.conf

exec "$@"
