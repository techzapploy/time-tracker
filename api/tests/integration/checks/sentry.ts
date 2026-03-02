export type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip' | 'timeout';
  durationMs: number;
  error: string | null;
};

export async function check(): Promise<CheckResult> {
  const start = Date.now();

  const token = process.env.SENTRY_AUTH_TOKEN;
  if (!token) {
    return { service: 'sentry', status: 'skip', durationMs: 0, error: null };
  }

  try {
    const response = await fetch('https://sentry.io/api/0/projects/', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      return { service: 'sentry', status: 'pass', durationMs: Date.now() - start, error: null };
    }

    return {
      service: 'sentry',
      status: 'fail',
      durationMs: Date.now() - start,
      error: `HTTP ${response.status} ${response.statusText}`,
    };
  } catch (err) {
    return {
      service: 'sentry',
      status: 'fail',
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
