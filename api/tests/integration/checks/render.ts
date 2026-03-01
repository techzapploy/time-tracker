import type { ServiceCheckResult } from './types.js';
import { fetchWithTimeout, sanitizeError } from './types.js';

export async function checkRender(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return { service: 'Render', status: 'skip', message: 'RENDER_API_KEY not configured', timestamp };
  }

  try {
    const response = await fetchWithTimeout('https://api.render.com/v1/services', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (response.ok) {
      return { service: 'Render', status: 'pass', message: 'API accessible', timestamp };
    }
    return { service: 'Render', status: 'fail', message: `API returned ${response.status}`, timestamp };
  } catch (error) {
    return { service: 'Render', status: 'fail', message: sanitizeError(error), timestamp };
  }
}
