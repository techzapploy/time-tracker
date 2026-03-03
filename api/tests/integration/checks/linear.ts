interface CheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs?: number;
}

export default async function checkLinear(): Promise<CheckResult> {
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return {
      service: 'linear',
      status: 'skip',
      message: 'LINEAR_API_KEY is not set',
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
      body: JSON.stringify({ query: '{ viewer { id name } }' }),
    });

    if (response.ok) {
      const data = (await response.json()) as { data?: { viewer?: { name?: string } } };
      const name = data?.data?.viewer?.name || 'unknown';
      return {
        service: 'linear',
        status: 'pass',
        message: `Authenticated as ${name}`,
        durationMs: Date.now() - start,
      };
    }

    return {
      service: 'linear',
      status: 'fail',
      message: `Linear API returned HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'linear',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
