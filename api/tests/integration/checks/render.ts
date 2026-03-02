export type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip' | 'timeout';
  durationMs: number;
  error: string | null;
};

export async function check(): Promise<CheckResult> {
  const start = Date.now();

  const apiKey = process.env.RENDER_API_KEY;
  if (!apiKey) {
    return { service: 'render', status: 'skip', durationMs: 0, error: null };
  }

  try {
    const response = await fetch('https://api.render.com/v1/owners?limit=1', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (response.ok) {
      return { service: 'render', status: 'pass', durationMs: Date.now() - start, error: null };
    }

    return {
      service: 'render',
      status: 'fail',
      durationMs: Date.now() - start,
      error: `HTTP ${response.status} ${response.statusText}`,
    };
  } catch (err) {
    return {
      service: 'render',
      status: 'fail',
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
