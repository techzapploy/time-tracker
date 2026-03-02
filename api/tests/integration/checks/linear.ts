interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkLinear(): Promise<CheckResult> {
  const name = 'Linear';
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return { name, status: 'skipped', message: 'LINEAR_API_KEY not set' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return { name, status: 'failed', message: `HTTP ${res.status}` };
    }

    return { name, status: 'ok', message: 'Connected successfully' };
  } catch (err) {
    return { name, status: 'failed', message: String(err) };
  } finally {
    clearTimeout(timeout);
  }
}
