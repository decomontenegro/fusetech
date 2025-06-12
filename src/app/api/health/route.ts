/**
 * Health Check API Endpoint
 * 
 * Provides application health status for:
 * - Docker health checks
 * - Load balancer health checks
 * - Monitoring systems
 * - Uptime monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: 'connected' | 'disconnected' | 'unknown';
    auth: 'operational' | 'degraded' | 'down';
    notifications: 'operational' | 'degraded' | 'down';
  };
  checks: {
    memory: {
      status: 'ok' | 'warning' | 'critical';
      usage: number;
      limit: number;
    };
    disk: {
      status: 'ok' | 'warning' | 'critical';
      usage: string;
    };
  };
}

// Track application start time
const startTime = Date.now();

async function checkDatabaseConnection(): Promise<'connected' | 'disconnected' | 'unknown'> {
  try {
    // In a real implementation, you would test the actual database connection
    // For now, we'll check if DATABASE_URL is configured
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl || databaseUrl.includes('postgresql://username:password@ep-xxx')) {
      return 'unknown';
    }
    
    // Here you would normally do:
    // const client = new Client({ connectionString: databaseUrl });
    // await client.connect();
    // await client.query('SELECT 1');
    // await client.end();
    
    return 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'disconnected';
  }
}

function checkMemoryUsage(): { status: 'ok' | 'warning' | 'critical'; usage: number; limit: number } {
  const memUsage = process.memoryUsage();
  const totalMemory = memUsage.heapTotal;
  const usedMemory = memUsage.heapUsed;
  const usagePercentage = (usedMemory / totalMemory) * 100;
  
  let status: 'ok' | 'warning' | 'critical' = 'ok';
  if (usagePercentage > 90) {
    status = 'critical';
  } else if (usagePercentage > 75) {
    status = 'warning';
  }
  
  return {
    status,
    usage: Math.round(usagePercentage),
    limit: Math.round(totalMemory / 1024 / 1024), // MB
  };
}

function checkAuthService(): 'operational' | 'degraded' | 'down' {
  try {
    // Check if auth environment variables are configured
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const hasProviders = !!(
      process.env.STRAVA_CLIENT_ID || 
      process.env.GOOGLE_CLIENT_ID || 
      process.env.APPLE_CLIENT_ID
    );
    
    if (hasNextAuthSecret && hasProviders) {
      return 'operational';
    } else if (hasNextAuthSecret) {
      return 'degraded';
    } else {
      return 'down';
    }
  } catch (error) {
    return 'down';
  }
}

function checkNotificationService(): 'operational' | 'degraded' | 'down' {
  try {
    // Check if Firebase/notification services are configured
    const hasFirebaseConfig = !!(
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    );
    
    if (hasFirebaseConfig) {
      return 'operational';
    } else {
      return 'degraded'; // Can work without notifications
    }
  } catch (error) {
    return 'down';
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const now = new Date();
    const uptime = Math.floor((Date.now() - startTime) / 1000); // seconds
    
    // Perform health checks
    const databaseStatus = await checkDatabaseConnection();
    const memoryCheck = checkMemoryUsage();
    const authStatus = checkAuthService();
    const notificationStatus = checkNotificationService();
    
    // Determine overall health status
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (databaseStatus === 'disconnected' || authStatus === 'down') {
      overallStatus = 'unhealthy';
    } else if (
      databaseStatus === 'unknown' || 
      authStatus === 'degraded' || 
      notificationStatus === 'degraded' ||
      memoryCheck.status === 'warning'
    ) {
      overallStatus = 'degraded';
    } else if (memoryCheck.status === 'critical') {
      overallStatus = 'unhealthy';
    }
    
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: now.toISOString(),
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: databaseStatus,
        auth: authStatus,
        notifications: notificationStatus,
      },
      checks: {
        memory: memoryCheck,
        disk: {
          status: 'ok', // Simplified for now
          usage: 'N/A',
        },
      },
    };
    
    // Return appropriate HTTP status code
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthStatus, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'unknown',
        auth: 'down',
        notifications: 'down',
      },
      checks: {
        memory: {
          status: 'critical',
          usage: 0,
          limit: 0,
        },
        disk: {
          status: 'critical',
          usage: 'N/A',
        },
      },
    };
    
    return NextResponse.json(errorStatus, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}

// Support HEAD requests for simple health checks
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    // Quick health check without detailed response
    const databaseStatus = await checkDatabaseConnection();
    const memoryCheck = checkMemoryUsage();
    
    const isHealthy = databaseStatus !== 'disconnected' && memoryCheck.status !== 'critical';
    
    return new NextResponse(null, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
