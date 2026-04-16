# RSV360 SSL Certificates
# Self-signed certificates for development/testing

# ⚠️  WARNING: These are self-signed certificates for development only!
# Do not use in production. Replace with proper SSL certificates from a CA.

# To generate certificates:
# 1. Install OpenSSL (see generate-ssl.bat for instructions)
# 2. Run: ./generate-ssl.bat

# For production, obtain certificates from:
# - Let's Encrypt (free): https://letsencrypt.org/
# - DigiCert, GlobalSign, or other CAs

# Certificate files expected:
# - cert.pem: Full certificate chain
# - key.pem: Private key

# Place certificates in: docker/nginx/ssl/