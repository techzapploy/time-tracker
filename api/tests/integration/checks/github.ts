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
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { service: 'GitHub', status: 'skip', message: 'GITHUB_TOKEN not set', durationMs: 0 };
  }
  const start = Date.now();
  try {
    const { statusCode } = await httpsGet('https://api.github.com/user', {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'time-tracker-integration-test',
    });
    if (statusCode === 200) {
      return { service: 'GitHub', status: 'pass', message: 'Authentication successful', durationMs: Date.now() - start };
    }
    return { service: 'GitHub', status: 'fail', message: `HTTP ${statusCode}`, durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'GitHub', status: 'fail', message, durationMs: Date.now() - start };
  }
}
