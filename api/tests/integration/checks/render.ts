interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkRender(): Promise<CheckResult> {
  const name = 'Render';
  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return { name, status: 'skipped', message: 'RENDER_API_KEY not set' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('https://api.render.com/v1/services?limit=1', {
      headers: { Authorization: `Bearer ${apiKey}` },
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
