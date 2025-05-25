# Data Flows

## Activity Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant Strava
    participant StravaWorker
    participant FraudDetection
    participant TokenService
    participant Blockchain

    User->>Strava: Complete activity
    Strava->>StravaWorker: Webhook notification
    StravaWorker->>Strava: Fetch activity details
    StravaWorker->>FraudDetection: Validate activity
    FraudDetection-->>StravaWorker: Validation result
    
    alt Activity is valid
        StravaWorker->>TokenService: Request token minting
        TokenService->>Blockchain: Execute transaction
        Blockchain-->>TokenService: Transaction receipt
        TokenService-->>StravaWorker: Confirmation
        StravaWorker-->>User: Notification
    else Activity is invalid
        StravaWorker-->>User: Rejection notification
    end
```

## Resilience Strategies

1. **Circuit Breakers**
   - Implemented on external API calls (Strava, Blockchain)
   - Fallback to cached data when possible

2. **Retry Mechanisms**
   - Exponential backoff for failed API calls
   - Dead letter queues for failed processing

3. **Rate Limiting**
   - Protect APIs from abuse
   - Respect third-party API limits