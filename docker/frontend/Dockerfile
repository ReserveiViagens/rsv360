# RSV360 PMS/CRM — Reservei Viagens
# Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
# Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
# @author Douglas P. Figueiredo
# @license UNLICENSED

FROM node:24-alpine AS deps
ARG APP_DIR
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG INTERNAL_API_URL
WORKDIR /workspace
RUN corepack enable && corepack prepare npm@10.9.7 --activate

# Monorepo workspace install — resolve @rsv360/shared localmente (não está no npm registry).
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json ./
COPY packages/shared/src ./packages/shared/src/
COPY ${APP_DIR}/package.json ${APP_DIR}/

RUN npm ci --workspace=${APP_DIR} --include-workspace-root=false --ignore-scripts \
  && if grep -q '"@rsv360/shared"' "${APP_DIR}/package.json"; then npm run build --workspace=@rsv360/shared; fi \
  && test -d node_modules/next -o -d ${APP_DIR}/node_modules/next \
  && test -d node_modules/react -o -d ${APP_DIR}/node_modules/react

FROM node:24-alpine AS builder
ARG APP_DIR
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG INTERNAL_API_URL
WORKDIR /workspace
RUN corepack enable && corepack prepare npm@10.9.7 --activate

COPY . .
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/packages/shared/dist ./packages/shared/dist
COPY --from=deps /workspace/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /workspace/${APP_DIR}/node_modules ./${APP_DIR}/node_modules
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV INTERNAL_API_URL=${INTERNAL_API_URL}
ENV PATH="/workspace/${APP_DIR}/node_modules/.bin:${PATH}"
RUN cd "${APP_DIR}" && npm run build
RUN mkdir -p /workspace/.deploy \
  && cp -R "${APP_DIR}/.next" /workspace/.deploy/.next \
  && cp "${APP_DIR}/package.json" /workspace/.deploy/package.json \
  && cp -R "/workspace/${APP_DIR}/node_modules" /workspace/.deploy/node_modules \
  && mkdir -p /workspace/.deploy/public \
  && if [ -d "${APP_DIR}/public" ]; then cp -R "${APP_DIR}/public/." /workspace/.deploy/public/; fi

FROM node:24-alpine AS runtime
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

# HEALTHCHECK não expande ARG/ENV na instrução CMD — porta fixada no build via script
RUN printf '%s\n' '#!/bin/sh' "exec wget --no-verbose --tries=1 -O /dev/null http://127.0.0.1:${APP_PORT}/" > /healthcheck.sh \
  && chmod +x /healthcheck.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD /healthcheck.sh

USER rsv360
EXPOSE ${APP_PORT}

CMD ["npm", "run", "start"]
