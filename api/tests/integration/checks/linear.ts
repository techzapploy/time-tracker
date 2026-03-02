export type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip' | 'timeout';
  durationMs: number;
  error: string | null;
};

export async function check(): Promise<CheckResult> {
  const start = Date.now();

  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    return { service: 'linear', status: 'skip', durationMs: 0, error: null };
  }

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
        service: 'linear',
        status: 'fail',
        durationMs: Date.now() - start,
        error: `HTTP ${response.status} ${response.statusText}`,
      };
    }

    const data = (await response.json()) as { errors?: unknown[] };
    if (data.errors) {
      return {
        service: 'linear',
        status: 'fail',
        durationMs: Date.now() - start,
        error: `GraphQL errors: ${JSON.stringify(data.errors)}`,
      };
    }

    return { service: 'linear', status: 'pass', durationMs: Date.now() - start, error: null };
  } catch (err) {
    return {
      service: 'linear',
      status: 'fail',
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
