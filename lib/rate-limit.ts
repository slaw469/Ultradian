import { NextRequest } from "next/server";

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

class RateLimiter {
  private cache = new Map<string, { count: number; resetTime: number }>();

  constructor(private config: RateLimitConfig) {}

  check(identifier: string): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;
    const record = this.cache.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      const resetTime = now + this.config.interval;
      this.cache.set(key, { count: 1, resetTime });
      return {
        success: true,
        remaining: this.config.uniqueTokenPerInterval - 1,
        resetTime,
      };
    }

    if (record.count >= this.config.uniqueTokenPerInterval) {
      return {
        success: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    record.count++;
    this.cache.set(key, record);

    return {
      success: true,
      remaining: this.config.uniqueTokenPerInterval - record.count,
      resetTime: record.resetTime,
    };
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.cache.entries()) {
      if (now > record.resetTime) {
        this.cache.delete(key);
      }
    }
  }
}

// Rate limiters for different endpoints
export const authRateLimit = new RateLimiter({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 5, // 5 attempts per 15 minutes
});

export const apiRateLimit = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 60, // 60 requests per minute
});

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || "unknown";
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  authRateLimit.cleanup();
  apiRateLimit.cleanup();
}, 5 * 60 * 1000); 