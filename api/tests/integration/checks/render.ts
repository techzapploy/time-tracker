import https from 'node:https';

export type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs: number;
};

function httpsGet(url: string, headers: Record<string, string>): Promise<{ statusCode: number }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      res.resume();
      resolve({ statusCode: res.statusCode ?? 0 });
    });
    req.on('error', reject);
  });
}

export async function check(): Promise<CheckResult> {
  const apiKey = process.env.RENDER_API_KEY;
  if (!apiKey) {
    return { service: 'Render', status: 'skip', message: 'RENDER_API_KEY not set', durationMs: 0 };
  }
  const start = Date.now();
  try {
    const { statusCode } = await httpsGet('https://api.render.com/v1/services?limit=1', {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    });
    if (statusCode === 200) {
      return { service: 'Render', status: 'pass', message: 'Authentication successful', durationMs: Date.now() - start };
    }
    return { service: 'Render', status: 'fail', message: `HTTP ${statusCode}`, durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'Render', status: 'fail', message, durationMs: Date.now() - start };
  }
}
