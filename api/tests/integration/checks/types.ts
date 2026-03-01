export interface ServiceCheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  timestamp: string;
}

export function sanitizeError(error: unknown): string {
  let message = error instanceof Error ? error.message : String(error);
  // Redact credentials
  message = message.replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]');
  message = message.replace(/token=[^\s&]+/gi, 'token=[REDACTED]');
  message = message.replace(/api_key=[^\s&]+/gi, 'api_key=[REDACTED]');
  message = message.replace(/password=[^\s&]+/gi, 'password=[REDACTED]');
  message = message.replace(/:([^@/]+)@/g, ':[REDACTED]@');
  return message;
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  ms: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
