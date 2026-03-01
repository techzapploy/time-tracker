import type { CheckResult } from './database.js';

export async function checkLinear(): Promise<CheckResult> {
  const name = 'Linear';
  const start = Date.now();

  const apiKey = process.env['LINEAR_API_KEY'];
  if (!apiKey) {
    return {
      name,
      status: 'skipped',
      message: 'LINEAR_API_KEY env var is not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 200) {
      const data = (await response.json()) as { data?: { viewer?: { id?: string } } };
      if (data?.data?.viewer?.id) {
        return {
          name,
          status: 'pass',
          message: 'Linear API reachable and key valid',
          durationMs: Date.now() - start,
        };
      }

      return {
        name,
        status: 'fail',
        message: 'Linear API responded 200 but viewer.id missing',
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: 'fail',
      message: `Unexpected HTTP status: ${response.status}`,
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
