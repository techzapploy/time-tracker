export interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs: number;
}

export async function check(): Promise<CheckResult> {
  const name = 'Render';
  const apiKey = process.env['RENDER_API_KEY'];

  if (!apiKey || apiKey.trim() === '') {
    return { name, status: 'skipped', message: 'RENDER_API_KEY not set', durationMs: 0 };
  }

  const start = Date.now();

  try {
    const response = await fetch('https://api.render.com/v1/services?limit=1', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { name, status: 'ok', message: 'Authentication successful', durationMs: Date.now() - start };
    }

    return {
      name,
      status: 'failed',
      message: `HTTP ${response.status}: ${response.statusText}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { name, status: 'failed', message, durationMs: Date.now() - start };
  }
}
