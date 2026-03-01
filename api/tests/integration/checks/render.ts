import { ServiceCheckResult, sanitizeError, fetchWithTimeout } from './types.js';

export async function checkRender(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return { service: 'Render', status: 'skip', message: 'RENDER_API_KEY not set', timestamp };
  }

  try {
    const res = await fetchWithTimeout('https://api.render.com/v1/services', {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      return { service: 'Render', status: 'pass', message: 'API accessible', timestamp };
    }
    return { service: 'Render', status: 'fail', message: `Render API returned HTTP ${res.status}`, timestamp };
  } catch (error) {
    return { service: 'Render', status: 'fail', message: sanitizeError(error), timestamp };
  }
}
