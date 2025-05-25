# 📡 FUSEtech API Documentation

## Overview

This document outlines the planned API structure for FUSEtech. Currently, the application uses mock data, but this API specification will guide future backend implementation.

## Current Status

**Phase 1**: Mock data implementation (no real API)
**Phase 2**: Backend integration with Supabase (planned)
**Phase 3**: Fitness API integrations (planned)
**Phase 4**: Blockchain API integration (planned)

## Base URL

```
# Future production URL
https://api.fusetech.com/v1

# Future staging URL
https://api-staging.fusetech.com/v1
```

## Authentication

### JWT Token Authentication
```http
Authorization: Bearer <jwt-token>
```

### API Key Authentication (for external integrations)
```http
X-API-Key: <api-key>
```

## Core API Endpoints (Planned)

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh-token-here"
}
```

### User Management

#### Get User Profile
```http
GET /users/me
Authorization: Bearer <token>
```

Response:
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "location": "São Paulo, Brazil",
  "bio": "Fitness enthusiast",
  "joinDate": "2024-01-15",
  "stats": {
    "totalActivities": 45,
    "totalDistance": 234.5,
    "totalTokens": 1250,
    "currentStreak": 7
  },
  "achievements": [
    {
      "id": "first-run",
      "name": "First Steps",
      "description": "Complete your first run",
      "earnedAt": "2024-01-16"
    }
  ]
}
```

#### Update User Profile
```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "bio": "Marathon runner",
  "location": "Rio de Janeiro, Brazil"
}
```

### Activity Management

#### List User Activities
```http
GET /activities?limit=20&offset=0&type=running
Authorization: Bearer <token>
```

Query Parameters:
- `limit`: Number of activities (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)
- `type`: Filter by activity type (running, cycling, walking)
- `date_from`: Start date filter (ISO 8601)
- `date_to`: End date filter (ISO 8601)

Response:
```json
{
  "activities": [
    {
      "id": "activity-456",
      "type": "running",
      "name": "Morning Run",
      "distance": 5.2,
      "duration": "00:28:45",
      "pace": "5:32",
      "calories": 420,
      "tokens": 26,
      "date": "2024-01-20",
      "time": "07:30",
      "location": "Central Park",
      "source": "strava",
      "verified": true
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Create Manual Activity
```http
POST /activities
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "running",
  "name": "Evening Jog",
  "distance": 3.5,
  "duration": "00:22:30",
  "date": "2024-01-20",
  "time": "18:00",
  "location": "Local Park"
}
```

#### Get Activity Details
```http
GET /activities/{activity_id}
Authorization: Bearer <token>
```

## APIs de Tokens

### Obter Informações do Token

```
GET /api/token/info
```

**Resposta:**
```json
{
  "data": {
    "name": "FUSEtech Token",
    "symbol": "FUSE",
    "decimals": 18,
    "totalSupply": "1000000.0",
    "contractAddress": "0x1234567890abcdef1234567890abcdef12345678"
  }
}
```

### Obter Saldo de Tokens

```
GET /api/token/balance/:address
```

**Resposta:**
```json
{
  "data": {
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "balance": "125.5"
  }
}
```

### Obter Histórico de Transações

```
GET /api/token/transactions
```

**Parâmetros de Query:**
- `limit` (opcional): Número máximo de resultados (padrão: 10)
- `offset` (opcional): Offset para paginação (padrão: 0)
- `type` (opcional): Filtrar por tipo (earn, burn)

**Resposta:**
```json
{
  "data": [
    {
      "id": "tx_123",
      "userId": "123",
      "amount": 10.0,
      "type": "earn",
      "status": "confirmed",
      "source": "strava",
      "sourceId": "act_123",
      "txHash": "0xabcdef...",
      "createdAt": "2023-01-01T08:35:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

## APIs de Gamificação

### Listar Desafios

```
GET /api/challenges
```

**Parâmetros de Query:**
- `limit` (opcional): Número máximo de resultados (padrão: 10)
- `offset` (opcional): Offset para paginação (padrão: 0)
- `status` (opcional): Filtrar por status (active, completed, upcoming)

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
    "total": 5,
    "limit": 10,
    "offset": 0
  }
}
```

### Listar Conquistas

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

### Obter Leaderboard

```
GET /api/leaderboard
```

**Parâmetros de Query:**
- `limit` (opcional): Número máximo de resultados (padrão: 10)
- `offset` (opcional): Offset para paginação (padrão: 0)
- `type` (opcional): Tipo de leaderboard (global, friends, city, country)

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
    "total": 100,
    "limit": 10,
    "offset": 0
  }
}
```

## APIs de Integração

### Conectar Conta do Strava

```
POST /api/integrations/strava/connect
```

**Corpo da Requisição:**
```json
{
  "code": "authorization_code_from_strava"
}
```

**Resposta:**
```json
{
  "data": {
    "connected": true,
    "athleteId": "strava_athlete_id",
    "username": "strava_username"
  }
}
```

### Conectar Conta do Instagram

```
POST /api/integrations/instagram/connect
```

**Corpo da Requisição:**
```json
{
  "code": "authorization_code_from_instagram"
}
```

**Resposta:**
```json
{
  "data": {
    "connected": true,
    "userId": "instagram_user_id",
    "username": "instagram_username"
  }
}
```

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Acesso proibido |
| 404 | Recurso não encontrado |
| 409 | Conflito |
| 422 | Entidade não processável |
| 429 | Muitas requisições |
| 500 | Erro interno do servidor |

## Webhooks

### Webhook do Strava

```
POST /webhooks/strava
```

**Corpo da Requisição:**
```json
{
  "aspect_type": "create",
  "event_time": 1516126040,
  "object_id": 1234567890,
  "object_type": "activity",
  "owner_id": 9876543210,
  "subscription_id": 1234
}
```

**Resposta:**
```json
{
  "status": "received"
}
```
