import { sanitize } from '../utils/sanitize.ts';
import type { ServiceResult } from '../utils/report.ts';

export async function checkLinear(): Promise<ServiceResult> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) return { name: 'Linear', status: 'SKIPPED', details: 'LINEAR_API_KEY not set' };

  const start = Date.now();
  try {
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json() as Record<string, unknown>;
    const hasViewer = res.ok && (data as any).data?.viewer != null;
    return {
      name: 'Linear',
      status: hasViewer ? 'UP' : 'DOWN',
      latency: Date.now() - start,
      details: `HTTP ${res.status}`,
    };
  } catch (err) {
    return { name: 'Linear', status: 'DOWN', error: sanitize(String(err)) };
  }
}
