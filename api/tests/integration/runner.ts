import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkGitHub } from './checks/github.js';
import { checkLinear } from './checks/linear.js';
import { checkRender } from './checks/render.js';
import { checkSentry } from './checks/sentry.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

interface RunReport {
  timestamp: string;
  overall: 'ok' | 'failed';
  results: CheckResult[];
  summary: { total: number; ok: number; failed: number; skipped: number };
}

async function withTimeout(fn: () => Promise<CheckResult>, timeoutMs: number): Promise<CheckResult> {
  return Promise.race([
    fn(),
    new Promise<CheckResult>((resolve) =>
      setTimeout(
        () => resolve({ name: 'unknown', status: 'failed', message: `Timed out after ${timeoutMs}ms` }),
        timeoutMs
      )
    ),
  ]);
}

async function main() {
  const checks: Array<() => Promise<CheckResult>> = [
    checkPostgres,
    checkRedis,
    checkDiscord,
    checkGitHub,
    checkLinear,
    checkRender,
    checkSentry,
  ];

  console.log('Running integration checks...\n');

  const results = await Promise.all(checks.map((fn) => withTimeout(fn, 30000)));

  // Print table
  const statusSymbol = (status: string) => {
    if (status === 'ok') return '✓';
    if (status === 'skipped') return '-';
    return '✗';
  };

  for (const result of results) {
    const symbol = statusSymbol(result.status);
    const duration = result.durationMs != null ? ` (${result.durationMs}ms)` : '';
    console.log(`${symbol} ${result.name.padEnd(12)} ${result.status.toUpperCase()}${duration} — ${result.message}`);
  }

  const summary = {
    total: results.length,
    ok: results.filter((r) => r.status === 'ok').length,
    failed: results.filter((r) => r.status === 'failed').length,
    skipped: results.filter((r) => r.status === 'skipped').length,
  };

  console.log(`\nSummary: ${summary.ok} ok, ${summary.failed} failed, ${summary.skipped} skipped`);

  const overall: 'ok' | 'failed' = summary.failed > 0 ? 'failed' : 'ok';

  const report: RunReport = {
    timestamp: new Date().toISOString(),
    overall,
    results,
    summary,
  };

  // Save JSON report
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const reportDir = join(__dirname, '..', '..', '..', 'DailyIntegrationTestResult');
  mkdirSync(reportDir, { recursive: true });

  const dateStr = new Date().toISOString().split('T')[0];
  const reportPath = join(reportDir, `${dateStr}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);

  process.exit(overall === 'failed' ? 1 : 0);
}

main().catch((err) => {
  console.error('Runner crashed:', err);
  process.exit(1);
});
