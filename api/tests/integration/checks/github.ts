import type { CheckResult } from '../types.js';

export default async function checkGithub(): Promise<CheckResult> {
  const service = 'github';
  const start = Date.now();

  const token = process.env.GITHUB_TOKEN ?? process.env.INTEGRATION_GITHUB_TOKEN;
  if (!token) {
    return {
      service,
      status: 'skipped',
      message: 'GITHUB_TOKEN / INTEGRATION_GITHUB_TOKEN env var not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      return {
        service,
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        duration_ms: Date.now() - start,
      };
    }

    const data = await response.json() as { login?: string };
    if (!data.login) {
      return {
        service,
        status: 'fail',
        message: 'Response missing login field',
        duration_ms: Date.now() - start,
      };
    }

    return {
      service,
      status: 'pass',
      message: `Authenticated as ${data.login}`,
      duration_ms: Date.now() - start,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'fail',
      message,
      duration_ms: Date.now() - start,
    };
  }
}
