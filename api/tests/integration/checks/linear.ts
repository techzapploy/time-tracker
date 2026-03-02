export interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkLinear(): Promise<CheckResult> {
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return {
      name: 'Linear',
      status: 'skipped',
      message: 'LINEAR_API_KEY not set, skipping',
    };
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
      signal: AbortSignal.timeout(10000),
    });

    const durationMs = Date.now() - start;

    if (response.ok) {
      return {
        name: 'Linear',
        status: 'ok',
        message: `Linear API reachable (HTTP ${response.status})`,
        durationMs,
      };
    } else {
      return {
        name: 'Linear',
        status: 'failed',
        message: `Linear API returned HTTP ${response.status}`,
        durationMs,
      };
    }
  } catch (err) {
    const durationMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      name: 'Linear',
      status: 'failed',
      message: `Request failed: ${message}`,
      durationMs,
    };
  }
}
