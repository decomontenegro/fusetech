# FuseLabs App - Documentação Técnica

## Visão Geral

O FuseLabs App é uma plataforma que permite aos usuários ganhar tokens digitais (FUSE) através de atividades físicas e compartilhamento em redes sociais. A plataforma integra-se com serviços como Strava para rastrear atividades físicas, implementa um sistema de gamificação através de desafios, e oferece um marketplace para resgate de recompensas.

## Arquitetura

O projeto segue uma arquitetura de monorepo usando Turborepo, com os seguintes componentes principais:

### Estrutura de Diretórios

```
fuseapp/
├── apps/
│   └── web/                 # Aplicação web Next.js
├── packages/
│   ├── api/                 # Cliente API compartilhado
│   ├── auth/                # Serviço de autenticação
│   ├── types/               # Tipos TypeScript compartilhados
│   ├── ui/                  # Biblioteca de componentes UI
│   └── utils/               # Utilitários compartilhados
├── services/
│   ├── fraud-detection/     # Serviço de detecção de fraude
│   ├── social-listener/     # Serviço para monitorar redes sociais
│   ├── strava-worker/       # Serviço para processar atividades do Strava
│   └── token-service/       # Serviço para gerenciar tokens FUSE
└── docs/                    # Documentação
```

### Stack Tecnológica

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Fastify
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Blockchain**: Base L2 (Ethereum)
- **Filas e Cache**: Redis
- **Testes**: Vitest, Testing Library

## Componentes Principais

### Aplicação Web (apps/web)

A aplicação web é construída com Next.js e implementa as seguintes funcionalidades:

- **Autenticação**: Login, registro e gerenciamento de sessão
- **Dashboard**: Visão geral das atividades e tokens do usuário
- **Atividades**: Visualização e gerenciamento de atividades físicas
- **Desafios**: Participação em desafios para ganhar recompensas
- **Carteira**: Visualização de saldo e histórico de transações
- **Marketplace**: Resgate de recompensas com tokens FUSE

#### Estrutura de Diretórios da Aplicação Web

```
apps/web/
├── public/                  # Arquivos estáticos
├── src/
│   ├── app/                 # Rotas da aplicação (Next.js App Router)
│   ├── components/          # Componentes React
│   ├── context/             # Contextos React (AuthContext, etc.)
│   ├── hooks/               # Hooks personalizados
│   ├── lib/                 # Bibliotecas e utilitários
│   ├── styles/              # Estilos globais
│   └── tests/               # Testes unitários
```

### Serviços

#### Serviço de Strava (services/strava-worker)

Responsável por:
- Processar webhooks do Strava
- Sincronizar atividades físicas
- Calcular pontos baseados em distância e duração
- Atualizar tokens de acesso automaticamente

#### Serviço de Tokens (services/token-service)

Responsável por:
- Gerenciar o contrato ERC-20 do token FUSE
- Processar transações de mint e burn
- Manter histórico de transações
- Implementar lógica de recompensas

#### Serviço de Detecção de Fraude (services/fraud-detection)

Responsável por:
- Verificar atividades suspeitas
- Implementar regras de detecção de fraude
- Flagear atividades para revisão manual
- Calcular pontuação de risco

#### Serviço de Monitoramento Social (services/social-listener)

Responsável por:
- Monitorar posts em redes sociais
- Verificar menções e hashtags
- Calcular engajamento
- Atribuir pontos baseados em alcance

## Fluxos Principais

### Fluxo de Autenticação

1. Usuário acessa a página de login/registro
2. Após autenticação bem-sucedida, o token JWT é armazenado
3. O middleware verifica o token em rotas protegidas
4. O AuthContext gerencia o estado de autenticação no frontend

### Fluxo de Integração com Strava

1. Usuário conecta sua conta do Strava
2. O callback OAuth processa o código de autorização
3. Tokens de acesso e refresh são armazenados
4. Atividades são sincronizadas periodicamente
5. Novas atividades são processadas via webhook

### Fluxo de Tokenização

1. Atividade é verificada pelo serviço de detecção de fraude
2. Se aprovada, pontos são calculados
3. Pontos são convertidos em tokens FUSE
4. Tokens são mintados na carteira do usuário
5. Transação é registrada no histórico

### Fluxo de Resgate de Recompensas

1. Usuário seleciona uma recompensa no marketplace
2. Confirma o resgate, autorizando a queima de tokens
3. Tokens são queimados da carteira do usuário
4. Recompensa é entregue (código, cupom, etc.)
5. Transação é registrada no histórico

## Modelos de Dados

### Usuário

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  walletAddress?: string;
  user_metadata?: Record<string, any>;
}
```

### Atividade Física

```typescript
interface PhysicalActivity {
  id: string;
  userId: string;
  type: ActivityType;
  distance: number;
  duration: number;
  points: number;
  status: ActivityStatus;
  tokenized: boolean;
  source: string;
  stravaId?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}
```

### Transação de Token

```typescript
interface TokenTransaction {
  id: string;
  userId: string;
  address: string;
  amount: number;
  type: 'mint' | 'burn' | 'transfer';
  reason: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  txHash?: string;
  metadata?: Record<string, any>;
}
```

### Desafio

```typescript
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'group' | 'community';
  category: 'running' | 'cycling' | 'walking' | 'mixed';
  startDate: Date;
  endDate: Date;
  goal: {
    type: 'distance' | 'duration' | 'frequency';
    value: number;
    unit: string;
  };
  reward: {
    tokens: number;
    xp: number;
    badge?: string;
  };
  participants: {
    total: number;
    friends?: number;
  };
  status: 'active' | 'upcoming' | 'completed' | 'failed';
}
```

## Segurança

### Autenticação e Autorização

- Autenticação baseada em JWT via Supabase Auth
- Middleware para proteção de rotas no frontend e backend
- Verificação de roles para acesso a funcionalidades administrativas

### Proteção contra Fraude

- Verificação de velocidade e padrões de atividade
- Sistema de pontuação de risco
- Revisão manual para atividades suspeitas
- Limites de pontos por dia/semana

### Segurança de Tokens

- Implementação de padrão ERC-20 seguro
- Funções de mint restritas a endereços autorizados
- Validação de transações antes de execução
- Monitoramento de atividades suspeitas

## Testes

### Testes Unitários

- Testes de componentes React com Testing Library
- Testes de hooks e contextos
- Testes de utilitários e funções auxiliares

### Testes de Integração

- Testes de fluxos completos (autenticação, atividades, etc.)
- Testes de API e serviços

### Testes End-to-End

- Testes de fluxos de usuário completos
- Simulação de interações reais

## Implantação

### Ambientes

- **Desenvolvimento**: Ambiente local para desenvolvimento
- **Staging**: Ambiente para testes antes de produção
- **Produção**: Ambiente de produção

### CI/CD

- GitHub Actions para integração contínua
- Testes automatizados em pull requests
- Deploy automático para staging após merge
- Deploy manual para produção

## Monitoramento e Logging

- Logs estruturados em todos os serviços
- Monitoramento de performance e erros
- Alertas para comportamentos anômalos
- Dashboard de métricas de negócio

## Próximos Passos

- Implementação de mais integrações (Fitbit, Apple Health, etc.)
- Expansão do marketplace de recompensas
- Implementação de recursos sociais (amigos, competições)
- Melhorias no sistema de gamificação
- Otimizações de performance e escalabilidade
