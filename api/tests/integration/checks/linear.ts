import type { CheckResult } from '../types.js';

export async function checkLinear(): Promise<CheckResult> {
  const service = 'Linear';
  const start = Date.now();

  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return {
      service,
      status: 'skip',
      duration: Date.now() - start,
      message: 'LINEAR_API_KEY not set',
    };
  }

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ viewer { id name } }' }),
      signal: AbortSignal.timeout(10000),
    });

    const duration = Date.now() - start;

    if (response.status === 200) {
      const data = (await response.json()) as {
        data?: { viewer?: { name?: string } };
        errors?: unknown[];
      };

      if (data.errors && data.errors.length > 0) {
        return {
          service,
          status: 'fail',
          duration,
          message: 'GraphQL errors returned from Linear API',
        };
      }

      const name = data.data?.viewer?.name ?? 'unknown';
      return {
        service,
        status: 'pass',
        duration,
        message: `Connected as ${name}`,
      };
    }

    return {
      service,
      status: 'fail',
      duration,
      message: `Unexpected response: HTTP ${response.status}`,
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message =
      err instanceof Error ? err.message : 'Unknown error checking Linear API';
    return {
      service,
      status: 'fail',
      duration,
      message,
    };
  }
}
