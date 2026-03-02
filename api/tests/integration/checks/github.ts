interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkGitHub(): Promise<CheckResult> {
  const name = 'GitHub';
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return { name, status: 'skipped', message: 'GITHUB_TOKEN not set' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      return { name, status: 'failed', message: `HTTP ${res.status}` };
    }

    return { name, status: 'ok', message: 'Connected successfully' };
  } catch (err) {
    return { name, status: 'failed', message: String(err) };
  } finally {
    clearTimeout(timeout);
  }
}
