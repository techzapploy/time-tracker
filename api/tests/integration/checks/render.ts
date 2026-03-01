import type { CheckResult } from '../types.js';

export async function checkRender(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return { service: 'Render', status: 'skip', message: 'RENDER_API_KEY not set', timestamp };
  }

  try {
    const res = await fetch('https://api.render.com/v1/services?limit=1', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      return { service: 'Render', status: 'pass', message: 'API key valid', timestamp };
    }
    return { service: 'Render', status: 'fail', message: `HTTP ${res.status} from Render API`, timestamp };
  } catch (err) {
    return { service: 'Render', status: 'fail', message: err instanceof Error ? err.message : String(err), timestamp };
  }
}
