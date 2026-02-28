export interface CheckResult {
  service: string;
  passed: boolean;
  error?: string;
}

export async function checkRender(): Promise<CheckResult> {
  const apiKey = process.env.RENDER_API_KEY;
  if (!apiKey) {
    return { service: 'render', passed: false, error: 'RENDER_API_KEY env var not set' };
  }

  try {
    const response = await fetch('https://api.render.com/v1/services?limit=1', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 200) {
      return { service: 'render', passed: true };
    }
    return { service: 'render', passed: false, error: `HTTP ${response.status}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'render', passed: false, error: message };
  }
}
