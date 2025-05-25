# Serviço de Gamificação - FuseLabs App

Este serviço gerencia a lógica de gamificação do FuseLabs App, incluindo desafios, conquistas e leaderboards.

## Funcionalidades

- Gerenciamento de desafios (criação, atualização, listagem)
- Gerenciamento de conquistas (criação, listagem, atribuição)
- Leaderboards (global, por amigos, por região)
- Processamento assíncrono de eventos para atualização de progresso

## Tecnologias

- Node.js
- Fastify
- Redis
- PostgreSQL (via Supabase)
- TypeScript

## Estrutura do Projeto

```
services/gamification/
├── src/
│   ├── routes/           # Rotas HTTP da API
│   │   ├── challenges.ts # Endpoints para desafios
│   │   ├── achievements.ts # Endpoints para conquistas
│   │   └── leaderboard.ts # Endpoints para leaderboards
│   ├── workers/          # Processadores assíncronos
│   │   ├── challengeProcessor.ts # Processador de desafios
│   │   └── achievementProcessor.ts # Processador de conquistas
│   └── index.ts          # Ponto de entrada
├── package.json
└── tsconfig.json
```

## Instalação

```bash
pnpm install
```

## Desenvolvimento

```bash
pnpm dev
```

## Testes

```bash
pnpm test
```

## Produção

```bash
pnpm build
pnpm start
```

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta do servidor | `3005` |
| `REDIS_URL` | URL do Redis | `redis://localhost:6379` |
| `DATABASE_URL` | URL do PostgreSQL | - |
| `LOG_LEVEL` | Nível de log | `info` |

## API

### Desafios

#### Listar Desafios

```
GET /api/challenges
```

**Parâmetros de Query:**
- `limit` (opcional): Número máximo de resultados (padrão: 10)
- `offset` (opcional): Offset para paginação (padrão: 0)
- `status` (opcional): Filtrar por status (`active`, `completed`, `upcoming`)

**Resposta:**
```json
{
  "data": [
    {
      "id": "1",
      "title": "Corredor Iniciante",
      "description": "Complete 50km de corrida em 30 dias",
      "type": "distance",
      "target": 50000,
      "reward": 500,
      "startDate": "2023-08-01T00:00:00Z",
      "endDate": "2023-08-31T23:59:59Z",
      "isActive": true,
      "requiredLevel": 0
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

#### Obter Desafio por ID

```
GET /api/challenges/:id
```

**Resposta:**
```json
{
  "data": {
    "id": "1",
    "title": "Corredor Iniciante",
    "description": "Complete 50km de corrida em 30 dias",
    "type": "distance",
    "target": 50000,
    "reward": 500,
    "startDate": "2023-08-01T00:00:00Z",
    "endDate": "2023-08-31T23:59:59Z",
    "isActive": true,
    "requiredLevel": 0
  }
}
```

#### Criar Desafio

```
POST /api/challenges
```

**Corpo:**
```json
{
  "title": "Corredor Iniciante",
  "description": "Complete 50km de corrida em 30 dias",
  "type": "distance",
  "target": 50000,
  "reward": 500,
  "startDate": "2023-08-01T00:00:00Z",
  "endDate": "2023-08-31T23:59:59Z",
  "isActive": true,
  "requiredLevel": 0
}
```

**Resposta:**
```json
{
  "data": {
    "id": "1",
    "title": "Corredor Iniciante",
    "description": "Complete 50km de corrida em 30 dias",
    "type": "distance",
    "target": 50000,
    "reward": 500,
    "startDate": "2023-08-01T00:00:00Z",
    "endDate": "2023-08-31T23:59:59Z",
    "isActive": true,
    "requiredLevel": 0
  }
}
```

### Conquistas

#### Listar Conquistas

```
GET /api/achievements
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "1",
      "title": "Primeiro Passo",
      "description": "Complete sua primeira atividade física",
      "type": "activity_count",
      "threshold": 1,
      "reward": 100,
      "icon": "trophy",
      "isSecret": false
    }
  ]
}
```

#### Listar Conquistas do Usuário

```
GET /api/users/:userId/achievements
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "1",
      "achievementId": "1",
      "userId": "user123",
      "unlockedAt": "2023-08-15T10:30:00Z",
      "rewardClaimed": true
    }
  ]
}
```

### Leaderboard

#### Obter Leaderboard Global

```
GET /api/leaderboard
```

**Parâmetros de Query:**
- `limit` (opcional): Número máximo de resultados (padrão: 10)
- `offset` (opcional): Offset para paginação (padrão: 0)

**Resposta:**
```json
{
  "data": [
    {
      "userId": "1",
      "name": "João Silva",
      "points": 1250,
      "rank": "silver",
      "level": 5
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

#### Obter Posição do Usuário

```
GET /api/leaderboard/users/:userId
```

**Resposta:**
```json
{
  "data": {
    "userId": "1",
    "name": "João Silva",
    "points": 1250,
    "rank": "silver",
    "level": 5,
    "position": 3,
    "totalUsers": 10
  }
}
```
