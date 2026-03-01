export interface ServiceCheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  timestamp: string;
}

export type ServiceCheck = () => Promise<ServiceCheckResult>;

export function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/\/\/[^:]+:[^@]+@/g, '//[REDACTED]@');
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
