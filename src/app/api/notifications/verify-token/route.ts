import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify token
    const isValid = await verifyToken(token);

    return NextResponse.json({
      success: true,
      valid: isValid,
      token,
    });

  } catch (error: any) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify token',
        details: error.message 
      },
      { status: 500 }
    );
  }
}