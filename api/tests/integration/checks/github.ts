export type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip' | 'timeout';
  durationMs: number;
  error: string | null;
};

export async function check(): Promise<CheckResult> {
  const start = Date.now();

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { service: 'github', status: 'skip', durationMs: 0, error: null };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'integration-check',
      },
    });

    if (response.ok) {
      return { service: 'github', status: 'pass', durationMs: Date.now() - start, error: null };
    }

    return {
      service: 'github',
      status: 'fail',
      durationMs: Date.now() - start,
      error: `HTTP ${response.status} ${response.statusText}`,
    };
  } catch (err) {
    return {
      service: 'github',
      status: 'fail',
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
