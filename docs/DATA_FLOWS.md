# Fluxos de Dados do FuseLabs App

Este documento descreve os principais fluxos de dados no FuseLabs App, incluindo como os dados são processados, transformados e movidos entre os diferentes serviços.

## Fluxo Earn "Corrida"

Este fluxo descreve como os usuários ganham tokens FUSE ao realizar atividades físicas registradas no Strava.

### Diagrama de Sequência

```
┌─────────┐          ┌────────┐          ┌──────────────┐          ┌────────────────┐          ┌──────────────┐          ┌─────────────┐
│  Strava │          │  User  │          │ Strava Worker │          │ Fraud Detection │          │ Token Service │          │ Gamification │
└────┬────┘          └───┬────┘          └───────┬──────┘          └────────┬───────┘          └──────┬───────┘          └──────┬──────┘
     │                    │                       │                          │                          │                         │
     │                    │ Connect Strava        │                          │                          │                         │
     │                    │─────────────────────▶│                          │                          │                         │
     │                    │                       │                          │                          │                         │
     │                    │ OAuth Authorization   │                          │                          │                         │
     │◀───────────────────│                       │                          │                          │                         │
     │                    │                       │                          │                          │                         │
     │ OAuth Callback     │                       │                          │                          │                         │
     │────────────────────┼──────────────────────▶                          │                          │                         │
     │                    │                       │                          │                          │                         │
     │                    │ Connection Confirmed  │                          │                          │                         │
     │                    │◀─────────────────────│                          │                          │                         │
     │                    │                       │                          │                          │                         │
     │ Activity Completed │                       │                          │                          │                         │
     │────────────────────┼───────────────────────┼──────────────────────────┼──────────────────────────┼─────────────────────────┤
     │                    │                       │                          │                          │                         │
     │ Webhook Event      │                       │                          │                          │                         │
     │───────────────────────────────────────────▶                          │                          │                         │
     │                    │                       │                          │                          │                         │
     │                    │                       │ Fetch Activity Details   │                          │                         │
     │◀──────────────────────────────────────────│                          │                          │                         │
     │                    │                       │                          │                          │                         │
     │ Activity Data      │                       │                          │                          │                         │
     │───────────────────────────────────────────▶                          │                          │                         │
     │                    │                       │                          │                          │                         │
     │                    │                       │ Verify Activity          │                          │                         │
     │                    │                       │─────────────────────────▶                          │                         │
     │                    │                       │                          │                          │                         │
     │                    │                       │ Verification Result      │                          │                         │
     │                    │                       │◀─────────────────────────                          │                         │
     │                    │                       │                          │                          │                         │
     │                    │                       │ Calculate Points         │                          │                         │
     │                    │                       │─────────────────────────────────────────────────────┼─────────────────────────┤
     │                    │                       │                          │                          │                         │
     │                    │                       │ Mint Tokens              │                          │                         │
     │                    │                       │─────────────────────────────────────────────────────▶                         │
     │                    │                       │                          │                          │                         │
     │                    │                       │ Tokens Minted            │                          │                         │
     │                    │                       │◀─────────────────────────────────────────────────────                         │
     │                    │                       │                          │                          │                         │
     │                    │                       │ Update Challenges        │                          │                         │
     │                    │                       │───────────────────────────────────────────────────────────────────────────────▶
     │                    │                       │                          │                          │                         │
     │                    │                       │ Challenges Updated       │                          │                         │
     │                    │                       │◀──────────────────────────────────────────────────────────────────────────────│
     │                    │                       │                          │                          │                         │
     │                    │ Activity Processed    │                          │                          │                         │
     │                    │◀─────────────────────│                          │                          │                         │
     │                    │                       │                          │                          │                         │
```

### Detalhamento do Fluxo

1. **Conexão com o Strava**
   - Usuário autoriza o FuseLabs App a acessar seus dados do Strava
   - O Strava Worker armazena o token de acesso para uso futuro

2. **Atividade Completada**
   - Usuário completa uma atividade no Strava (corrida, caminhada, etc.)
   - Strava envia um webhook para o Strava Worker

3. **Processamento da Atividade**
   - Strava Worker recebe o webhook e busca os detalhes da atividade na API do Strava
   - Strava Worker armazena a atividade no banco de dados

4. **Verificação de Fraude**
   - Strava Worker envia a atividade para o serviço de Fraud Detection
   - Fraud Detection analisa a atividade em busca de sinais de fraude:
     - Velocidade implausível
     - Padrões anormais
     - Atividades duplicadas
   - Fraud Detection retorna um resultado de verificação

5. **Cálculo de Pontos**
   - Se a atividade for considerada válida, o Strava Worker calcula os pontos
   - Fórmula básica: `pontos = distância_km * 10 + duração_min / 5`
   - Ajustes são feitos com base no tipo de atividade e intensidade

6. **Mint de Tokens**
   - Strava Worker solicita ao Token Service para mintar tokens FUSE
   - Quantidade de tokens = pontos / 10
   - Token Service executa a transação na blockchain Base L2
   - Token Service retorna o resultado da transação

7. **Atualização de Gamificação**
   - Strava Worker notifica o serviço de Gamification sobre a atividade
   - Gamification atualiza o progresso em desafios ativos
   - Gamification verifica se novas conquistas foram desbloqueadas
   - Gamification atualiza o nível e posição no leaderboard do usuário

8. **Notificação ao Usuário**
   - Usuário recebe uma notificação sobre os tokens ganhos
   - Detalhes da atividade e tokens são exibidos no dashboard

## Fluxo Earn "Social"

Este fluxo descreve como os usuários ganham tokens FUSE ao compartilhar conteúdo relacionado a fitness nas redes sociais.

### Diagrama de Sequência

```
┌─────────────┐          ┌────────┐          ┌────────────────┐          ┌────────────────┐          ┌──────────────┐          ┌─────────────┐
│ Social Media │          │  User  │          │ Social Listener │          │ Fraud Detection │          │ Token Service │          │ Gamification │
└──────┬──────┘          └───┬────┘          └───────┬────────┘          └────────┬───────┘          └──────┬───────┘          └──────┬──────┘
       │                      │                       │                          │                          │                         │
       │                      │ Connect Social Media  │                          │                          │                         │
       │                      │─────────────────────▶│                          │                          │                         │
       │                      │                       │                          │                          │                         │
       │                      │ OAuth Authorization   │                          │                          │                         │
       │◀─────────────────────│                       │                          │                          │                         │
       │                      │                       │                          │                          │                         │
       │ OAuth Callback       │                       │                          │                          │                         │
       │──────────────────────┼──────────────────────▶                          │                          │                         │
       │                      │                       │                          │                          │                         │
       │                      │ Connection Confirmed  │                          │                          │                         │
       │                      │◀─────────────────────│                          │                          │                         │
       │                      │                       │                          │                          │                         │
       │ Post with #FuseLabs  │                       │                          │                          │                         │
       │──────────────────────┼───────────────────────┼──────────────────────────┼──────────────────────────┼─────────────────────────┤
       │                      │                       │                          │                          │                         │
       │                      │                       │ Poll for New Posts       │                          │                         │
       │◀──────────────────────────────────────────────                          │                          │                         │
       │                      │                       │                          │                          │                         │
       │ Post Data            │                       │                          │                          │                         │
       │───────────────────────────────────────────────▶                          │                          │                         │
       │                      │                       │                          │                          │                         │
       │                      │                       │ Verify Post              │                          │                         │
       │                      │                       │─────────────────────────▶                          │                         │
       │                      │                       │                          │                          │                         │
       │                      │                       │ Verification Result      │                          │                         │
       │                      │                       │◀─────────────────────────                          │                         │
       │                      │                       │                          │                          │                         │
       │                      │                       │ Calculate Points         │                          │                         │
       │                      │                       │─────────────────────────────────────────────────────┼─────────────────────────┤
       │                      │                       │                          │                          │                         │
       │                      │                       │ Mint Tokens              │                          │                         │
       │                      │                       │─────────────────────────────────────────────────────▶                         │
       │                      │                       │                          │                          │                         │
       │                      │                       │ Tokens Minted            │                          │                         │
       │                      │                       │◀─────────────────────────────────────────────────────                         │
       │                      │                       │                          │                          │                         │
       │                      │                       │ Update Challenges        │                          │                         │
       │                      │                       │───────────────────────────────────────────────────────────────────────────────▶
       │                      │                       │                          │                          │                         │
       │                      │                       │ Challenges Updated       │                          │                         │
       │                      │                       │◀──────────────────────────────────────────────────────────────────────────────│
       │                      │                       │                          │                          │                         │
       │                      │ Post Processed        │                          │                          │                         │
       │                      │◀─────────────────────│                          │                          │                         │
       │                      │                       │                          │                          │                         │
```

### Detalhamento do Fluxo

1. **Conexão com Rede Social**
   - Usuário autoriza o FuseLabs App a acessar seus dados do Instagram/TikTok
   - O Social Listener armazena o token de acesso para uso futuro

2. **Publicação de Post**
   - Usuário publica um post com a hashtag #FuseLabs
   - Social Listener detecta o post durante a verificação periódica

3. **Processamento do Post**
   - Social Listener busca os detalhes do post na API da rede social
   - Social Listener armazena o post no banco de dados

4. **Verificação de Fraude**
   - Social Listener envia o post para o serviço de Fraud Detection
   - Fraud Detection analisa o post em busca de sinais de fraude:
     - Conteúdo não relacionado a fitness
     - Posts duplicados
     - Frequência anormal de publicação
   - Fraud Detection retorna um resultado de verificação

5. **Cálculo de Pontos**
   - Se o post for considerado válido, o Social Listener calcula os pontos
   - Pontos baseados no tipo de conteúdo, engajamento e plataforma

6. **Mint de Tokens**
   - Social Listener solicita ao Token Service para mintar tokens FUSE
   - Quantidade de tokens = pontos / 10
   - Token Service executa a transação na blockchain Base L2
   - Token Service retorna o resultado da transação

7. **Atualização de Gamificação**
   - Social Listener notifica o serviço de Gamification sobre o post
   - Gamification atualiza o progresso em desafios ativos
   - Gamification verifica se novas conquistas foram desbloqueadas
   - Gamification atualiza o nível e posição no leaderboard do usuário

8. **Notificação ao Usuário**
   - Usuário recebe uma notificação sobre os tokens ganhos
   - Detalhes do post e tokens são exibidos no dashboard

## Fluxo Burn

Este fluxo descreve como os usuários resgatam (queimam) tokens FUSE em troca de recompensas.

### Diagrama de Sequência

```
┌────────┐          ┌─────┐          ┌──────────────┐          ┌─────────────┐
│ Web App │          │ User │          │ Token Service │          │ Gamification │
└────┬────┘          └──┬──┘          └──────┬───────┘          └──────┬──────┘
     │                   │                    │                         │
     │ Select Reward     │                    │                         │
     │◀──────────────────│                    │                         │
     │                   │                    │                         │
     │ Confirm Redemption│                    │                         │
     │◀──────────────────│                    │                         │
     │                   │                    │                         │
     │ Request Burn      │                    │                         │
     │────────────────────────────────────────▶                         │
     │                   │                    │                         │
     │ Burn Tokens       │                    │                         │
     │◀───────────────────────────────────────│                         │
     │                   │                    │                         │
     │ Tokens Burned     │                    │                         │
     │────────────────────────────────────────▶                         │
     │                   │                    │                         │
     │ Update Challenges │                    │                         │
     │──────────────────────────────────────────────────────────────────▶
     │                   │                    │                         │
     │ Challenges Updated│                    │                         │
     │◀─────────────────────────────────────────────────────────────────│
     │                   │                    │                         │
     │ Redemption Complete                    │                         │
     │───────────────────▶                    │                         │
     │                   │                    │                         │
```

### Detalhamento do Fluxo

1. **Seleção de Recompensa**
   - Usuário navega para a seção de recompensas no aplicativo
   - Usuário seleciona uma recompensa para resgatar
   - Aplicativo verifica se o usuário tem tokens suficientes

2. **Confirmação de Resgate**
   - Usuário confirma o resgate da recompensa
   - Aplicativo envia solicitação para o Token Service

3. **Burn de Tokens**
   - Token Service verifica o saldo do usuário
   - Token Service executa a transação de burn na blockchain Base L2
   - Token Service registra a transação no banco de dados

4. **Atualização de Gamificação**
   - Token Service notifica o serviço de Gamification sobre o resgate
   - Gamification atualiza o progresso em desafios relacionados
   - Gamification verifica se novas conquistas foram desbloqueadas

5. **Entrega da Recompensa**
   - Dependendo do tipo de recompensa:
     - Código de desconto é gerado e exibido para o usuário
     - Produto físico é registrado para envio
     - Recurso digital é desbloqueado na plataforma

6. **Notificação ao Usuário**
   - Usuário recebe uma confirmação do resgate
   - Detalhes da recompensa são exibidos no dashboard
