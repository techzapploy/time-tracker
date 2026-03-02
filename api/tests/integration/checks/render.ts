export interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkRender(): Promise<CheckResult> {
  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return {
      name: 'Render',
      status: 'skipped',
      message: 'RENDER_API_KEY not set, skipping',
    };
  }

  const start = Date.now();

  try {
    const response = await fetch('https://api.render.com/v1/services?limit=1', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    const durationMs = Date.now() - start;

    if (response.ok) {
      return {
        name: 'Render',
        status: 'ok',
        message: `Render API reachable (HTTP ${response.status})`,
        durationMs,
      };
    } else {
      return {
        name: 'Render',
        status: 'failed',
        message: `Render API returned HTTP ${response.status}`,
        durationMs,
      };
    }
  } catch (err) {
    const durationMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      name: 'Render',
      status: 'failed',
      message: `Request failed: ${message}`,
      durationMs,
    };
  }
}
