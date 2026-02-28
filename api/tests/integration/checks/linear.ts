import type { CheckResult } from '../types.js';

export default async function checkLinear(): Promise<CheckResult> {
  const service = 'linear';
  const start = Date.now();

  const linearApiKey = process.env.LINEAR_API_KEY;
  if (!linearApiKey) {
    return {
      service,
      status: 'skipped',
      message: 'LINEAR_API_KEY env var not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: linearApiKey,
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
    });

    if (!response.ok) {
      return {
        service,
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        duration_ms: Date.now() - start,
      };
    }

    const data = await response.json() as { data?: { viewer?: { id?: string } } };
    if (!data?.data?.viewer?.id) {
      return {
        service,
        status: 'fail',
        message: 'Response missing data.viewer.id',
        duration_ms: Date.now() - start,
      };
    }

    return {
      service,
      status: 'pass',
      message: `Authenticated, viewer id: ${data.data.viewer.id}`,
      duration_ms: Date.now() - start,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'fail',
      message,
      duration_ms: Date.now() - start,
    };
  }
}
