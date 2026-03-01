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
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    return { service: 'Discord', status: 'skip', message: 'DISCORD_TOKEN not set', durationMs: 0 };
  }
  const start = Date.now();
  try {
    const { statusCode } = await httpsGet('https://discord.com/api/v10/users/@me', {
      Authorization: `Bot ${token}`,
    });
    if (statusCode === 200) {
      return { service: 'Discord', status: 'pass', message: 'Authentication successful', durationMs: Date.now() - start };
    }
    return { service: 'Discord', status: 'fail', message: `HTTP ${statusCode}`, durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'Discord', status: 'fail', message, durationMs: Date.now() - start };
  }
}
