import type { CheckResult } from '../types.js';

export async function checkLinear(): Promise<CheckResult> {
  const name = 'Linear';
  const start = Date.now();

  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    return { name, status: 'skipped', message: 'LINEAR_API_KEY not set', durationMs: 0 };
  }

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ viewer { id name } }' }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        name,
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        durationMs: Date.now() - start,
      };
    }

    const body = await response.json() as { data?: { viewer?: { id: string; name: string } }; errors?: unknown[] };

    if (body.errors && body.errors.length > 0) {
      return {
        name,
        status: 'fail',
        message: `GraphQL errors: ${JSON.stringify(body.errors)}`,
        durationMs: Date.now() - start,
      };
    }

    const viewer = body.data?.viewer;
    return {
      name,
      status: 'pass',
      message: `Connected as ${viewer?.name ?? 'unknown'} (id: ${viewer?.id ?? 'unknown'})`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
