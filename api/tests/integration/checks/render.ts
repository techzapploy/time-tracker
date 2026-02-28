import type { CheckResult } from '../types.js';

export default async function checkRender(): Promise<CheckResult> {
  const service = 'render';
  const start = Date.now();

  const renderApiKey = process.env.RENDER_API_KEY;
  if (!renderApiKey) {
    return {
      service,
      status: 'skipped',
      message: 'RENDER_API_KEY env var not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.render.com/v1/owners?limit=1', {
      headers: {
        Authorization: `Bearer ${renderApiKey}`,
      },
    });

    if (!response.ok) {
      return {
        service,
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        duration_ms: Date.now() - start,
      };
    }

    return {
      service,
      status: 'pass',
      message: `Successfully reached Render API (HTTP ${response.status})`,
      duration_ms: Date.now() - start,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'fail',
      message,
      duration_ms: Date.now() - start,
    };
  }
}
