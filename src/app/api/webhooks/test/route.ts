import { NextRequest, NextResponse } from 'next/server';
import { stravaWebhookManager } from '@/lib/webhooks/strava-webhook-manager';

/**
 * Test endpoint for webhook development
 * Only available in development mode
 */

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { type = 'activity', aspectType = 'create' } = body;

    // Generate test event and signature
    const { event, signature } = stravaWebhookManager.createTestEvent(type);
    
    // Override aspect type if provided
    if (aspectType) {
      event.aspect_type = aspectType;
    }

    // Make request to actual webhook endpoint
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/strava`;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature': signature,
      },
      body: JSON.stringify(event),
    });

    const result = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      event,
      signature,
      response: result,
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 404 }
    );
  }

  // Return test instructions
  return NextResponse.json({
    message: 'Webhook test endpoint',
    usage: {
      method: 'POST',
      body: {
        type: 'activity | athlete (optional, default: activity)',
        aspectType: 'create | update | delete (optional, default: create)',
      },
      example: {
        type: 'activity',
        aspectType: 'create',
      },
    },
    curl: `curl -X POST ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/test -H "Content-Type: application/json" -d '{"type":"activity","aspectType":"create"}'`,
  });
}