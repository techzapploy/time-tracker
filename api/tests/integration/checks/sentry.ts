import https from 'node:https';

export type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs: number;
};

function httpsHead(hostname: string): Promise<{ statusCode: number }> {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, method: 'HEAD', path: '/' }, (res) => {
      res.resume();
      resolve({ statusCode: res.statusCode ?? 0 });
    });
    req.on('error', reject);
    req.end();
  });
}

export async function check(): Promise<CheckResult> {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return { service: 'Sentry', status: 'skip', message: 'SENTRY_DSN not set', durationMs: 0 };
  }
  const start = Date.now();
  let hostname: string;
  try {
    const url = new URL(dsn);
    hostname = url.hostname;
  } catch {
    return { service: 'Sentry', status: 'fail', message: 'Invalid SENTRY_DSN format', durationMs: Date.now() - start };
  }
  try {
    await httpsHead(hostname);
    return { service: 'Sentry', status: 'pass', message: `Host ${hostname} reachable`, durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'Sentry', status: 'fail', message, durationMs: Date.now() - start };
  }
}
