# ==============================================================================
# SHARE MARKET EXPERT ADMIN — PRODUCTION DOCKERFILE FOR RENDER
# PHP 8.2 with Apache, PDO MySQL & Custom Port Handling
# ==============================================================================

FROM php:8.2-apache

# Install required PHP extensions (pdo_mysql)
RUN docker-php-ext-install pdo pdo_mysql \
    && a2enmod rewrite headers

WORKDIR /var/www/html

# Copy project source into document root
COPY . /var/www/html/

# Enable .htaccess overrides for Apache
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Set permissions for Apache www-data
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Copy dynamic port entrypoint for Render (listens on $PORT or 10000)
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Default port used by Render
EXPOSE 10000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
