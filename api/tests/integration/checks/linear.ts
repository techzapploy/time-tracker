export interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs: number;
}

interface LinearResponse {
  errors?: Array<{ message: string }>;
}

export async function check(): Promise<CheckResult> {
  const name = 'Linear';
  const apiKey = process.env['LINEAR_API_KEY'];

  if (!apiKey || apiKey.trim() === '') {
    return { name, status: 'skipped', message: 'LINEAR_API_KEY not set', durationMs: 0 };
  }

  const start = Date.now();

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
    });

    if (!response.ok) {
      return {
        name,
        status: 'failed',
        message: `HTTP ${response.status}: ${response.statusText}`,
        durationMs: Date.now() - start,
      };
    }

    const data = (await response.json()) as LinearResponse;

    if (data.errors && data.errors.length > 0) {
      return {
        name,
        status: 'failed',
        message: data.errors[0]?.message ?? 'GraphQL errors in response',
        durationMs: Date.now() - start,
      };
    }

    return { name, status: 'ok', message: 'Authentication successful', durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { name, status: 'failed', message, durationMs: Date.now() - start };
  }
}
