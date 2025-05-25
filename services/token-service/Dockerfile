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

# Copiar código fonte do serviço
COPY services/token-service ./services/token-service

# Instalar dependências
RUN npm install

# Construir o serviço
RUN turbo run build --filter=@fuseapp/token-service...

# Imagem final para produção
FROM node:18-alpine AS runner
WORKDIR /app

# Copiar dependências e build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/token-service/package.json ./
COPY --from=builder /app/services/token-service/dist ./dist

# Definir variáveis de ambiente
ENV NODE_ENV production
ENV PORT 3003

# Expor porta
EXPOSE 3003

# Iniciar o serviço
CMD ["node", "dist/index.js"] 