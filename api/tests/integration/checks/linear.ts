import type { CheckResult } from '../types.js';

const name = 'Linear';

export default async function checkLinear(): Promise<CheckResult> {
  const start = Date.now();
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return { name, status: 'skip', reason: 'LINEAR_API_KEY not set', duration_ms: Date.now() - start };
  }

  try {
    const query = JSON.stringify({ query: '{ viewer { id name email } }' });
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: query,
    });

    const duration_ms = Date.now() - start;

    if (response.ok) {
      const data = (await response.json()) as {
        data?: { viewer?: { name?: string; email?: string } };
        errors?: unknown[];
      };

      if (data.errors && data.errors.length > 0) {
        return {
          name,
          status: 'fail',
          reason: `GraphQL errors: ${JSON.stringify(data.errors)}`,
          duration_ms,
        };
      }

      const viewer = data.data?.viewer;
      return {
        name,
        status: 'pass',
        reason: `Authenticated as ${viewer?.name || viewer?.email || 'unknown'}`,
        duration_ms,
      };
    } else {
      const body = await response.text();
      return {
        name,
        status: 'fail',
        reason: `HTTP ${response.status}: ${body}`,
        duration_ms,
      };
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: 'fail',
      reason: `Request failed: ${reason}`,
      duration_ms: Date.now() - start,
    };
  }
}
