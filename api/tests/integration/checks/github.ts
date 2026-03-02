export interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkGitHub(): Promise<CheckResult> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return {
      name: 'GitHub',
      status: 'skipped',
      message: 'GITHUB_TOKEN not set, skipping',
    };
  }

  const start = Date.now();

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(10000),
    });

    const durationMs = Date.now() - start;

    if (response.ok) {
      return {
        name: 'GitHub',
        status: 'ok',
        message: `GitHub API reachable (HTTP ${response.status})`,
        durationMs,
      };
    } else {
      return {
        name: 'GitHub',
        status: 'failed',
        message: `GitHub API returned HTTP ${response.status}`,
        durationMs,
      };
    }
  } catch (err) {
    const durationMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      name: 'GitHub',
      status: 'failed',
      message: `Request failed: ${message}`,
      durationMs,
    };
  }
}
