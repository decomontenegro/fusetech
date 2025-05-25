FROM node:18-alpine AS base

# Instalação de dependências globais comuns
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo

# Setup do workspace geral
FROM base AS builder
WORKDIR /app

# Copiar configurações de root
COPY package.json package-lock.json* turbo.json ./
COPY tsconfig.json ./

# Copiar pacotes compartilhados
COPY packages ./packages

# Copiar código fonte da aplicação web
COPY apps/web ./apps/web

# Instalar dependências
RUN npm install

# Construir a aplicação web
RUN turbo run build --filter=web...

# Imagem de produção
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Instalar ferramentas necessárias
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copiar arquivos necessários
COPY --from=builder /app/apps/web/next.config.js ./
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

# Definir usuário para não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Configurar health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD curl -f http://localhost:3000/api/health || exit 1

# Iniciar a aplicação
ENV PORT 3000
CMD ["node", "server.js"] 