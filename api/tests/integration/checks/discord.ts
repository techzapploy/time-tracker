export type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip' | 'timeout';
  durationMs: number;
  error: string | null;
};

export async function check(): Promise<CheckResult> {
  const start = Date.now();

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return { service: 'discord', status: 'skip', durationMs: 0, error: null };
  }

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bot ${token}` },
    });

    if (response.ok) {
      return { service: 'discord', status: 'pass', durationMs: Date.now() - start, error: null };
    }

    return {
      service: 'discord',
      status: 'fail',
      durationMs: Date.now() - start,
      error: `HTTP ${response.status} ${response.statusText}`,
    };
  } catch (err) {
    return {
      service: 'discord',
      status: 'fail',
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
