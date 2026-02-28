export interface CheckResult {
  service: string;
  passed: boolean;
  error?: string;
}

export async function checkGitHub(): Promise<CheckResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { service: 'github', passed: false, error: 'GITHUB_TOKEN env var not set' };
  }

  try {
    const response = await fetch('https://api.github.com/rate_limit', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'integration-test',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 200) {
      return { service: 'github', passed: true };
    }
    return { service: 'github', passed: false, error: `HTTP ${response.status}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'github', passed: false, error: message };
  }
}
