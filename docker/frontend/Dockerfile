# ============================================
# RSV360 Frontend - Next.js Standalone Dockerfile
# ============================================

# --- Stage 1: Dependencies ---
FROM node:22-alpine AS deps
WORKDIR /app

# Copiar apenas arquivos necessários para deps
COPY apps/site-publico/package.json ./apps/site-publico/
COPY package.json package-lock.json ./

# Instalar dependências
RUN cd apps/site-publico && npm install --no-audit --no-fund

# --- Stage 2: Builder ---
FROM node:22-alpine AS builder
WORKDIR /app

# Copiar dependências instaladas
COPY --from=deps /app/apps/site-publico/node_modules ./apps/site-publico/node_modules

# Copiar apenas arquivos necessários para build
COPY apps/site-publico/package.json ./apps/site-publico/
COPY apps/site-publico/next.config.js ./apps/site-publico/
COPY apps/site-publico/tsconfig.json ./apps/site-publico/
COPY apps/site-publico/src ./apps/site-publico/src
COPY apps/site-publico/public ./apps/site-publico/public

# Build Next.js com standalone output
RUN cd apps/site-publico && npm run build

# --- Stage 3: Production ---
FROM node:22-alpine AS production
WORKDIR /app

# Segurança: usuário não-root
RUN addgroup -S rsv360 && adduser -S rsv360 -G rsv360

# Copiar standalone build
COPY --from=builder /app/apps/site-publico/.next/standalone ./
COPY --from=builder /app/apps/site-publico/.next/static ./.next/static
COPY --from=builder /app/apps/site-publico/public ./public

# Instalar wget para health check
RUN apk add --no-cache wget

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

USER rsv360
EXPOSE 3000

ENV NODE_ENV=production
CMD ["node", "server.js"]