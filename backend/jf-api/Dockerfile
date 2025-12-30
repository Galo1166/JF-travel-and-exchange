FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libpq-dev \
    libmcrypt-dev \
    git \
    unzip \
    zip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p /app/bootstrap/cache && \
    mkdir -p /app/storage && \
    mkdir -p /app/storage/logs && \
    mkdir -p /app/storage/app && \
    mkdir -p /app/storage/app/public && \
    mkdir -p /app/storage/framework && \
    mkdir -p /app/storage/framework/cache && \
    mkdir -p /app/storage/framework/sessions && \
    mkdir -p /app/public/storage && \
    chmod -R 775 /app/bootstrap/cache && \
    chmod -R 775 /app/storage

# Install PHP dependencies
RUN composer install --ignore-platform-reqs --no-dev --optimize-autoloader

# Clear and optimize
RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan storage:link || true

# Expose port
EXPOSE 8000

# Start Laravel
CMD ["sh", "-c", "php artisan storage:link --force || true && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
