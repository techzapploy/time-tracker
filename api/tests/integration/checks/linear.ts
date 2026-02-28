export interface CheckResult {
  service: string;
  passed: boolean;
  error?: string;
}

export async function checkLinear(): Promise<CheckResult> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    return { service: 'linear', passed: false, error: 'LINEAR_API_KEY env var not set' };
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

    const data = await response.json() as { data?: { viewer?: { id?: string } } };
    if (data?.data?.viewer?.id) {
      return { service: 'linear', passed: true };
    }
    return { service: 'linear', passed: false, error: 'Response missing data.viewer.id' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'linear', passed: false, error: message };
  }
}
