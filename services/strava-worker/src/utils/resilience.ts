import { Redis } from 'ioredis';
import pRetry from 'p-retry';

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  fallbackFn?: () => Promise<any>;
}

export class CircuitBreaker {
  private failures: number = 0;
  private isOpen: boolean = false;
  private lastFailureTime: number = 0;
  private readonly redis: Redis;
  private readonly serviceName: string;
  private readonly options: CircuitBreakerOptions;

  constructor(
    redis: Redis,
    serviceName: string,
    options: Partial<CircuitBreakerOptions> = {}
  ) {
    this.redis = redis;
    this.serviceName = serviceName;
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 30000,
      fallbackFn: options.fallbackFn
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.updateState();
    
    if (this.isOpen) {
      if (this.options.fallbackFn) {
        return this.options.fallbackFn() as Promise<T>;
      }
      throw new Error(`Circuit is open for ${this.serviceName}`);
    }
    
    try {
      const result = await pRetry(fn, {
        retries: 3,
        onFailedAttempt: error => {
          console.error(`Attempt ${error.attemptNumber} failed. ${error.message}`);
        }
      });
      await this.recordSuccess();
      return result;
    } catch (error) {
      await this.recordFailure();
      throw error;
    }
  }

  // Additional methods for state management...
}