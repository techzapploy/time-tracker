import https from 'node:https';

export type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs: number;
};

function httpsPost(url: string, body: string, headers: Record<string, string>): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode ?? 0, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

export async function check(): Promise<CheckResult> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    return { service: 'Linear', status: 'skip', message: 'LINEAR_API_KEY not set', durationMs: 0 };
  }
  const start = Date.now();
  try {
    const body = JSON.stringify({ query: '{ viewer { id } }' });
    const { statusCode, body: responseBody } = await httpsPost(
      'https://api.linear.app/graphql',
      body,
      {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    );
    if (statusCode === 200) {
      const parsed = JSON.parse(responseBody) as { errors?: unknown[] };
      if (parsed.errors && parsed.errors.length > 0) {
        return { service: 'Linear', status: 'fail', message: 'GraphQL errors returned', durationMs: Date.now() - start };
      }
      return { service: 'Linear', status: 'pass', message: 'Authentication successful', durationMs: Date.now() - start };
    }
    return { service: 'Linear', status: 'fail', message: `HTTP ${statusCode}`, durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'Linear', status: 'fail', message, durationMs: Date.now() - start };
  }
}
