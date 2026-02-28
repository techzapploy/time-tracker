import type { CheckResult } from '../types.js';

export async function checkGitHub(): Promise<CheckResult> {
  const service = 'GitHub';
  const token = process.env['GITHUB_TOKEN'];

  if (!token) {
    return {
      service,
      passed: true,
      skipped: true,
      message: 'GITHUB_TOKEN is not set — skipping GitHub check',
    };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'daily-integration-test-runner/1.0',
        Accept: 'application/vnd.github.v3+json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      return {
        service,
        passed: true,
        message: `GitHub API responded with status ${response.status}`,
      };
    } else {
      const body = await response.text();
      return {
        service,
        passed: false,
        message: `GitHub API returned status ${response.status}: ${body}`,
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      service,
      passed: false,
      message: `GitHub API request failed: ${message}`,
    };
  }
}
