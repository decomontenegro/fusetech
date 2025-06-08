# Webhook Security Implementation

## Overview

This document describes the HMAC-based security implementation for Strava webhooks in the FUSEtech application.

## Security Features

### 1. HMAC Signature Verification

All incoming webhooks are verified using HMAC-SHA256 signatures:

- **Algorithm**: SHA256
- **Secret**: Stored in `STRAVA_WEBHOOK_VERIFY_TOKEN` environment variable
- **Header**: `x-hub-signature`
- **Timing-safe comparison**: Prevents timing attacks

### 2. Rate Limiting

Webhooks are rate-limited to prevent abuse:

- **Default limit**: 100 requests per minute per IP
- **Configurable**: Can be adjusted in `WebhookRateLimiter` constructor
- **IP-based**: Uses `x-forwarded-for` header for client identification

### 3. Secure Webhook Handler

The `createSecureWebhookHandler` utility provides:

- Automatic signature verification
- Request body parsing and validation
- Error handling and logging
- Consistent response format

## Configuration

### Required Environment Variables

```bash
# Strava OAuth credentials
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret

# Webhook verification token (generate a secure random string)
STRAVA_WEBHOOK_VERIFY_TOKEN=your_secure_webhook_token

# Application URL (used for callback URL)
NEXT_PUBLIC_APP_URL=https://your-app.com
```

### Generating a Secure Webhook Token

```bash
# Generate a 32-byte random token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Webhook Endpoints

### 1. Main Webhook Endpoint

**URL**: `/api/webhooks/strava`

**Methods**:
- `GET`: Webhook subscription validation
- `POST`: Event processing

### 2. Test Endpoint (Development Only)

**URL**: `/api/webhooks/test`

**Purpose**: Test webhook functionality in development

## Webhook Management

### List Current Subscriptions

```bash
npm run webhooks:list
```

### Create New Subscription

```bash
npm run webhooks:create
```

### Delete Subscription

```bash
npm run webhooks:delete
```

### Test Webhook

```bash
npm run webhooks:test
```

## Event Processing

### Supported Event Types

1. **Activity Events**
   - `create`: New activity created
   - `update`: Activity updated
   - `delete`: Activity deleted

2. **Athlete Events**
   - `update`: Athlete profile updated
   - `delete`: Athlete deauthorized app

### Asynchronous Processing

Events are processed asynchronously to ensure quick webhook responses:

```typescript
processWebhookAsync(body).catch(error => {
  console.error('Error processing webhook:', error);
});
```

## Security Best Practices

1. **Never expose webhook secrets**: Keep `STRAVA_WEBHOOK_VERIFY_TOKEN` secure
2. **Use HTTPS**: Always use HTTPS for webhook endpoints in production
3. **Monitor webhook activity**: Log all webhook events for auditing
4. **Handle failures gracefully**: Return 2xx status even if processing fails
5. **Validate event data**: Always validate webhook payload structure

## Testing Webhooks

### Local Development

1. Use ngrok or similar to expose local server:
   ```bash
   ngrok http 3000
   ```

2. Update `NEXT_PUBLIC_APP_URL` with ngrok URL

3. Create webhook subscription:
   ```bash
   npm run webhooks:create
   ```

### Manual Testing

Test with curl:

```bash
# Get test event and signature
npm run webhooks:test

# Send test request
curl -X POST http://localhost:3000/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"type":"activity","aspectType":"create"}'
```

## Troubleshooting

### Common Issues

1. **Invalid signature error**
   - Check `STRAVA_WEBHOOK_VERIFY_TOKEN` matches subscription
   - Ensure raw body is used for signature calculation
   - Verify signature header format

2. **Rate limit errors**
   - Check client IP detection
   - Adjust rate limit if needed
   - Consider IP whitelist for Strava

3. **Webhook not receiving events**
   - Verify subscription is active (`npm run webhooks:list`)
   - Check callback URL is accessible
   - Ensure HTTPS in production

### Debug Mode

Enable debug logging:

```typescript
console.log('Webhook debug:', {
  signature: request.headers.get('x-hub-signature'),
  body: await request.text(),
  calculatedSignature: stravaService.verifyWebhookSignature(body, signature)
});
```

## Future Enhancements

1. **Webhook retry mechanism**: Handle failed event processing
2. **Event deduplication**: Prevent duplicate event processing
3. **Webhook metrics**: Track success/failure rates
4. **IP whitelist**: Allow only Strava IPs in production
5. **Event queue**: Use message queue for reliable processing