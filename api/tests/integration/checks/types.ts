export interface ServiceCheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  timestamp: string;
}

/**
 * Strips embedded credentials from error messages.
 * Removes patterns like //user:pass@host
 */
export function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/\/\/[^@\s]+:[^@\s]+@[^\s/]+/g, '//<redacted>@<redacted>');
}

/**
 * Fetch with automatic abort after timeoutMs milliseconds.
 */
export async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs = 10000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}
