import type { CheckResult } from '../types.js';

export async function checkRender(): Promise<CheckResult> {
  const service = 'Render';
  const apiKey = process.env['RENDER_API_KEY'];

  if (!apiKey) {
    return {
      service,
      passed: true,
      skipped: true,
      message: 'RENDER_API_KEY is not set — skipping Render check',
    };
  }

  try {
    const response = await fetch('https://api.render.com/v1/services', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      return {
        service,
        passed: true,
        message: `Render API responded with status ${response.status}`,
      };
    } else {
      const body = await response.text();
      return {
        service,
        passed: false,
        message: `Render API returned status ${response.status}: ${body}`,
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      service,
      passed: false,
      message: `Render API request failed: ${message}`,
    };
  }
}
