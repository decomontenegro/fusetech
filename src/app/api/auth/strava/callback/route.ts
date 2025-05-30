import { NextRequest, NextResponse } from 'next/server';
import { stravaService } from '@/lib/integrations/strava';

/**
 * Endpoint para receber o callback do Strava após autorização
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle authorization errors
    if (error) {
      console.error('Strava authorization error:', error);
      return NextResponse.redirect(
        new URL('/dashboard?error=strava_auth_failed', request.url)
      );
    }

    // Validate required parameters
    if (!code) {
      console.error('Missing authorization code from Strava');
      return NextResponse.redirect(
        new URL('/dashboard?error=missing_code', request.url)
      );
    }

    // Exchange code for tokens using the service
    const tokenData = await stravaService.exchangeCodeForTokens(code);

    // Here you would typically:
    // 1. Save tokens to database associated with user
    // 2. Save athlete profile information
    // 3. Trigger initial activity sync

    console.log('Strava integration successful for athlete:', tokenData.athlete.id);

    // For now, we'll just redirect with success
    // In a real implementation, you'd save this to the database
    const successUrl = new URL('/dashboard', request.url);
    successUrl.searchParams.set('strava_connected', 'true');
    successUrl.searchParams.set('athlete_id', tokenData.athlete.id.toString());

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Strava callback error:', error);

    return NextResponse.redirect(
      new URL('/dashboard?error=strava_callback_failed', request.url)
    );
  }
}

// Handle webhook events (POST request from Strava)
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-strava-signature') || '';

    // Verify webhook signature
    if (!stravaService.verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Process the webhook event
    await stravaService.processWebhookEvent(event);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Strava webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
