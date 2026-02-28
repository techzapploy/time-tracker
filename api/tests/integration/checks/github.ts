import type { CheckResult } from '../types.js';

export async function checkGithub(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'github';

  const token = process.env['GITHUB_TOKEN'];
  if (!token) {
    return {
      service,
      status: 'skipped',
      message: 'GITHUB_TOKEN not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'clockify-integration-test',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 200) {
      const json = await response.json() as { login?: string };
      return {
        service,
        status: 'pass',
        message: `Authenticated as ${json.login ?? 'unknown'}`,
        duration_ms: Date.now() - start,
      };
    } else {
      return {
        service,
        status: 'fail',
        message: `HTTP ${response.status}`,
        duration_ms: Date.now() - start,
      };
    }
  } catch (err) {
    return {
      service,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
