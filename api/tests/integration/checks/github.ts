interface CheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs?: number;
}

export default async function checkGitHub(): Promise<CheckResult> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return {
      service: 'github',
      status: 'skip',
      message: 'GITHUB_TOKEN is not set',
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
    });

    if (response.ok) {
      const data = (await response.json()) as { login?: string };
      return {
        service: 'github',
        status: 'pass',
        message: `Authenticated as ${data.login || 'unknown'}`,
        durationMs: Date.now() - start,
      };
    }

    return {
      service: 'github',
      status: 'fail',
      message: `GitHub API returned HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'github',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
