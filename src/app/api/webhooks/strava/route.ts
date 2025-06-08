import { NextRequest, NextResponse } from 'next/server';
import { stravaService } from '@/lib/integrations/strava';
import { createSecureWebhookHandler, WebhookRateLimiter } from '@/lib/webhooks/security';

/**
 * Strava Webhook endpoint
 * Handles both subscription validation and event processing
 */

// Rate limiter instance
const rateLimiter = new WebhookRateLimiter(100, 60000); // 100 requests per minute

// GET request - Subscription validation
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (!mode || !token || !challenge) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate subscription
    const validation = stravaService.validateWebhookSubscription(mode, token, challenge);

    if (validation.valid) {
      console.log('Strava webhook subscription validated');
      return NextResponse.json({ 'hub.challenge': validation.challenge });
    }

    return NextResponse.json(
      { error: 'Invalid verification token' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Webhook subscription validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST request - Event processing with HMAC security
export const POST = createSecureWebhookHandler(
  {
    secret: process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || '',
    headerName: 'x-hub-signature',
    algorithm: 'sha256'
  },
  async (body: any, request: NextRequest) => {
    // Check rate limit
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter.isAllowed(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Log the event
    console.log('Received Strava webhook event:', {
      object_type: body.object_type,
      aspect_type: body.aspect_type,
      object_id: body.object_id,
      owner_id: body.owner_id,
      event_time: body.event_time
    });

    // Process the webhook event asynchronously
    // Don't await to avoid timeout issues
    processWebhookAsync(body).catch(error => {
      console.error('Error processing webhook:', error);
    });

    // Return success immediately
    return NextResponse.json({ success: true });
  }
);

/**
 * Process webhook events asynchronously
 */
async function processWebhookAsync(event: any) {
  const { object_type, aspect_type, object_id, owner_id, updates } = event;

  try {
    // Handle different event types
    switch (object_type) {
      case 'activity':
        await handleActivityEvent(aspect_type, object_id, owner_id, updates);
        break;
      
      case 'athlete':
        await handleAthleteEvent(aspect_type, owner_id, updates);
        break;
      
      default:
        console.log(`Unhandled object type: ${object_type}`);
    }
  } catch (error) {
    console.error(`Error processing ${object_type} ${aspect_type} event:`, error);
  }
}

/**
 * Handle activity-related events
 */
async function handleActivityEvent(
  aspectType: string,
  activityId: number,
  athleteId: number,
  updates?: any
) {
  switch (aspectType) {
    case 'create':
      console.log(`New activity created: ${activityId} for athlete ${athleteId}`);
      // TODO: Fetch activity details and award tokens
      break;
    
    case 'update':
      console.log(`Activity updated: ${activityId}`, updates);
      // TODO: Update activity in database
      break;
    
    case 'delete':
      console.log(`Activity deleted: ${activityId}`);
      // TODO: Remove activity and adjust tokens if needed
      break;
  }
}

/**
 * Handle athlete-related events
 */
async function handleAthleteEvent(
  aspectType: string,
  athleteId: number,
  updates?: any
) {
  switch (aspectType) {
    case 'update':
      console.log(`Athlete updated: ${athleteId}`, updates);
      // TODO: Update athlete profile
      break;
    
    case 'delete':
      console.log(`Athlete deauthorized: ${athleteId}`);
      // TODO: Handle deauthorization
      break;
  }
}