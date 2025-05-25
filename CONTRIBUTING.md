# Guia de Contribuição - FUSEtech App

Este documento fornece diretrizes para contribuir com o projeto FUSEtech App. Por favor, leia-o com atenção antes de fazer qualquer contribuição.

## Fluxo de Trabalho

1. Crie um fork do repositório
2. Clone o seu fork para desenvolvimento local
3. Crie uma branch para sua feature ou correção: `git checkout -b feature/nome-da-feature`
4. Faça suas alterações seguindo as convenções de código
5. Teste suas alterações
6. Faça commit das alterações: `git commit -m "feat: descrição da sua alteração"`
7. Envie para o seu fork: `git push origin feature/nome-da-feature`
8. Crie um Pull Request para a branch `develop` do repositório principal

## Estrutura do Projeto

O FUSEtech App segue uma estrutura de monorepo usando Turborepo:

```
apps/           # Aplicações finais
  ├── web/      # Aplicação web (Next.js)
packages/       # Pacotes compartilhados
  ├── ui/       # Componentes de UI
  ├── types/    # Tipos compartilhados
  ├── utils/    # Utilitários
  ├── api/      # Cliente API
  └── auth/     # Autenticação
services/       # Microserviços
  ├── strava-worker/      # Integração com Strava
  ├── social-listener/    # Integração com redes sociais
  ├── token-service/      # Serviço de tokens na blockchain
  └── fraud-detection/    # Sistema antifraude
infrastructure/ # Configurações de infraestrutura
  └── nginx/    # Configuração do NGINX
scripts/        # Scripts úteis
  ├── dev.sh             # Inicia ambiente de desenvolvimento
  ├── dev-selective.sh   # Inicia serviços selecionados
  ├── stop.sh            # Para ambiente de desenvolvimento
  └── docker-preview.sh  # Inicia preview com Docker
```

## Ambiente de Desenvolvimento

### Requisitos

- Node.js 18 ou superior
- pnpm 8 ou superior
- Redis (local ou via Docker)
- Docker (opcional, para preview de produção)

### Instalação de Dependências

```bash
pnpm install
```

### Iniciando o Ambiente de Desenvolvimento

Para iniciar todos os serviços:

```bash
./scripts/dev.sh
```

Para iniciar apenas serviços específicos:

```bash
./scripts/dev-selective.sh -s web,token-service
# ou interativamente
./scripts/dev-selective.sh
```

### Parar o Ambiente de Desenvolvimento

```bash
./scripts/stop.sh
```

### Preview de Produção com Docker

```bash
./scripts/docker-preview.sh
```

## Convenções de Código

### Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Formatação, ponto e vírgula, etc; sem alteração de código
- `refactor`: Refatoração de código
- `test`: Adição/correção de testes
- `chore`: Alterações no processo de build, configurações, etc

### Estilo de Código

- Use TypeScript sempre que possível
- Siga os padrões do ESLint configurados no projeto
- Prefira funções e componentes stateless quando apropriado
- Nomeie componentes e funções de forma clara e descritiva
- Adicione comentários apenas quando necessário para explicar lógica complexa

## Testes

Antes de submeter um PR, execute todos os testes:

```bash
pnpm run test
```

## Documentação

- Atualize a documentação quando fizer alterações significativas
- Adicione comentários JSDoc para APIs públicas
- Inclua exemplos de uso quando relevante

## Revisão de Código

- Cada PR deve ser revisado por pelo menos um membro da equipe
- PRs que quebram testes não serão aceitos
- Feedback construtivo é sempre bem-vindo

## Licença

Ao contribuir para o FUSEtech App, você concorda que suas contribuições serão licenciadas sob a mesma licença que o projeto.

---

Obrigado por contribuir para o FUSEtech App!