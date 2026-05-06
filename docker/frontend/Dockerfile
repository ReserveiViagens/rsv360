# RSV360 PMS/CRM — Reservei Viagens
# Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
# Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
# @author Douglas P. Figueiredo
# @license UNLICENSED

FROM node:22-alpine AS deps
ARG APP_DIR
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG INTERNAL_API_URL
WORKDIR /workspace

COPY . .
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV INTERNAL_API_URL=${INTERNAL_API_URL}
RUN cd "${APP_DIR}" && npm install --no-audit --no-fund \
  && mkdir -p /workspace/node_modules \
  && if [ -d "/workspace/${APP_DIR}/node_modules" ]; then cp -R "/workspace/${APP_DIR}/node_modules/." /workspace/node_modules/; fi \
  && test -d /workspace/node_modules/react \
  && test -d /workspace/node_modules/react-dom

FROM node:22-alpine AS builder
ARG APP_DIR
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG INTERNAL_API_URL
WORKDIR /workspace

COPY --from=deps /workspace /workspace
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV INTERNAL_API_URL=${INTERNAL_API_URL}
RUN cd "${APP_DIR}" && npm run build
RUN mkdir -p /workspace/.deploy \
  && cp -R "${APP_DIR}/.next" /workspace/.deploy/.next \
  && cp "${APP_DIR}/package.json" /workspace/.deploy/package.json \
  && cp -R /workspace/node_modules /workspace/.deploy/node_modules \
  && mkdir -p /workspace/.deploy/public \
  && if [ -d "${APP_DIR}/public" ]; then cp -R "${APP_DIR}/public/." /workspace/.deploy/public/; fi

FROM node:22-alpine AS runtime
ARG APP_DIR
ARG APP_PORT=3000
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG INTERNAL_API_URL
WORKDIR /workspace

RUN apk add --no-cache wget
RUN addgroup -S rsv360 && adduser -S rsv360 -G rsv360

COPY --from=builder /workspace/.deploy/.next ./.next
COPY --from=builder /workspace/.deploy/public ./public
COPY --from=builder /workspace/.deploy/package.json ./package.json
COPY --from=builder /workspace/.deploy/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=${APP_PORT}
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV INTERNAL_API_URL=${INTERNAL_API_URL}

HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${APP_PORT} || exit 1

USER rsv360
EXPOSE ${APP_PORT}

CMD ["npm", "run", "start"]
