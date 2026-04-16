# RSV360 Let's Encrypt Setup
# Automated SSL certificate management

# Prerequisites:
# - Domain pointing to your server
# - Nginx running on port 80
# - Docker and docker-compose installed

# 1. Install Certbot
# docker run -it --rm --name certbot \
#   -v "rsv360_ssl_certs:/etc/letsencrypt" \
#   -v "rsv360_ssl_certs:/var/www/certbot" \
#   certbot/certbot certonly --webroot --webroot-path=/var/www/certbot \
#   -d yourdomain.com -d www.yourdomain.com

# 2. Update nginx.conf with real certificates
# ssl_certificate /etc/nginx/ssl/fullchain.pem;
# ssl_certificate_key /etc/nginx/ssl/privkey.pem;

# 3. Add to docker-compose.prod.yml volumes:
# - rsv360_ssl_certs:/etc/letsencrypt:ro
# - rsv360_ssl_certs:/var/www/certbot:ro

# 4. Renewal (run monthly via cron):
# docker run -it --rm --name certbot \
#   -v "rsv360_ssl_certs:/etc/letsencrypt" \
#   -v "rsv360_ssl_certs:/var/www/certbot" \
#   certbot/certbot renew

# 5. Reload nginx after renewal:
# docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Volume for SSL certificates
# volumes:
#   rsv360_ssl_certs:
#     driver: local
#     name: rsv360_ssl_certs