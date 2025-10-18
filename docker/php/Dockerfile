FROM docker.m.daocloud.io/php:8.4-fpm-bullseye

# 或者使用清华源
RUN sed -i 's/deb.debian.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apt/sources.list && \
    sed -i 's/security.debian.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apt/sources.list

RUN apt-get update && apt-get install -y \
    gcc g++ make autoconf libc-dev pkg-config \
    libz-dev \
    libpq-dev \
    libssl-dev \
    libmcrypt-dev \
    libzip-dev \
    unzip \
    git \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libxml2-dev \
    libonig-dev \
    zip \
    curl \
    libmemcached-dev \
    libsasl2-dev \
    && rm -fr /var/lib/apt/lists/*

# 安装 Redis 扩展（使用 PECL）
RUN pecl install redis && docker-php-ext-enable redis
# 安装Memcache扩展
RUN pecl install memcached && docker-php-ext-enable memcached
RUN pecl install mongodb-1.15.0 && docker-php-ext-enable mongodb

# 安装 PHP 扩展
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
    pdo_mysql \
    mysqli \
    pdo_pgsql \
    pgsql \
    gd \
    zip \
    mbstring \
    exif \
    pcntl \
    bcmath \
    opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
# 复制 PHP 配置文件
COPY php.ini /usr/local/etc/php/conf.d/custom.ini


# 创建日志目录
RUN mkdir -p /var/log/php && chmod 777 /var/log/php
# 设置权限
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html
EXPOSE 9000

CMD ["php-fpm"]
