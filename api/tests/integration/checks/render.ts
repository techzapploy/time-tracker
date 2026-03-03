interface CheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs?: number;
}

export default async function checkRender(): Promise<CheckResult> {
  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return {
      service: 'render',
      status: 'skip',
      message: 'RENDER_API_KEY is not set',
    };
  }

  const start = Date.now();
  try {
    const response = await fetch('https://api.render.com/v1/owners?limit=1', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      return {
        service: 'render',
        status: 'pass',
        message: `Render API reachable (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      service: 'render',
      status: 'fail',
      message: `Render API returned HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'render',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
