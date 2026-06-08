# ============================================
# RSV360 Backend - Multi-stage Dockerfile
# ============================================

# --- Stage 1: Builder ---
FROM node:24-alpine AS builder
WORKDIR /app

# Copiar package files
COPY backend/package.json backend/package-lock.json ./backend/
COPY package.json package-lock.json ./

# Instalar dependências (incluindo dev para build)
RUN cd backend && npm ci --no-audit --no-fund

# --- Stage 2: Production ---
FROM node:24-alpine AS production
WORKDIR /app

# Segurança: usuário não-root
RUN addgroup -S rsv360 && adduser -S rsv360 -G rsv360

# Copiar package files e código fonte
COPY backend/package.json backend/package-lock.json ./backend/
COPY backend/ ./backend/
COPY server/ ./server/

# Instalar apenas dependências de produção
RUN cd backend && npm install --omit=dev --no-audit --no-fund

# Instalar tsx para executar TypeScript
RUN npm install -g tsx

# Instalar wget para health check
RUN apk add --no-cache wget

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/api/v1/health || exit 1

USER rsv360
EXPOSE 3002

ENV NODE_ENV=production
CMD ["npx", "tsx", "backend/server.ts"]