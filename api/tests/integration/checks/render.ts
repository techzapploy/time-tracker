import { type ServiceCheckResult, sanitizeError, fetchWithTimeout } from './types.js';

export async function checkRender(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'render';

  const renderApiKey = process.env['RENDER_API_KEY'];

  if (!renderApiKey) {
    return {
      service,
      status: 'skip',
      message: 'Skipped: RENDER_API_KEY is unset',
      timestamp,
    };
  }

  try {
    const response = await fetchWithTimeout('https://api.render.com/v1/services', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${renderApiKey}`,
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      return {
        service,
        status: 'pass',
        message: `Render API accessible (HTTP ${response.status})`,
        timestamp,
      };
    }

    return {
      service,
      status: 'fail',
      message: `Render API returned HTTP ${response.status}`,
      timestamp,
    };
  } catch (error) {
    return {
      service,
      status: 'fail',
      message: `Render API check failed: ${sanitizeError(error)}`,
      timestamp,
    };
  }
}
