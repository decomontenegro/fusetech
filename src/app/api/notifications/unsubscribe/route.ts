import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeFromTopic } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, tokens, topic } = body;

    // Validate required fields
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    if (!token && !tokens) {
      return NextResponse.json(
        { error: 'Either token or tokens array is required' },
        { status: 400 }
      );
    }

    // Prepare tokens array
    const tokenArray = tokens || [token];

    // Unsubscribe from topic
    const response = await unsubscribeFromTopic(tokenArray, topic);

    return NextResponse.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors: response.errors,
    });

  } catch (error: any) {
    console.error('Error unsubscribing from topic:', error);
    return NextResponse.json(
      { 
        error: 'Failed to unsubscribe from topic',
        details: error.message 
      },
      { status: 500 }
    );
  }
}