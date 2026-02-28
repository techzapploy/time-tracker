import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { CheckResult } from './types.js';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkRender } from './checks/render.js';
import { checkLinear } from './checks/linear.js';
import { checkGitHub } from './checks/github.js';
import { checkSentry } from './checks/sentry.js';

const TIMEOUT_MS = 15_000;

function withTimeout(check: () => Promise<CheckResult>, service: string): Promise<CheckResult> {
  return Promise.race([
    check(),
    new Promise<CheckResult>((resolve) =>
      setTimeout(
        () =>
          resolve({
            service,
            status: 'fail',
            message: `Timed out after ${TIMEOUT_MS}ms`,
            duration_ms: TIMEOUT_MS,
          }),
        TIMEOUT_MS,
      ),
    ),
  ]);
}

async function main() {
  const checks: Array<{ name: string; fn: () => Promise<CheckResult> }> = [
    { name: 'postgres', fn: checkPostgres },
    { name: 'redis', fn: checkRedis },
    { name: 'discord', fn: checkDiscord },
    { name: 'render', fn: checkRender },
    { name: 'linear', fn: checkLinear },
    { name: 'github', fn: checkGitHub },
    { name: 'sentry', fn: checkSentry },
  ];

  const results: CheckResult[] = [];

  for (const { name, fn } of checks) {
    const result = await withTimeout(fn, name);
    results.push(result);
    const icon = result.status === 'pass' ? '✓' : result.status === 'skipped' ? '-' : '✗';
    console.log(`[${icon}] ${result.service}: ${result.status} — ${result.message} (${result.duration_ms}ms)`);
  }

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  console.log(`\nSummary: ${passed} passed, ${failed} failed, ${skipped} skipped`);

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const unixMs = now.getTime();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const reportDir = join(__dirname, '..', '..', '..', 'DailyIntegrationTestResult');

  mkdirSync(reportDir, { recursive: true });

  const reportPath = join(reportDir, `integration-test-${dateStr}-${unixMs}.json`);
  const report = {
    date: dateStr,
    timestamp: now.toISOString(),
    summary: { total: results.length, passed, failed, skipped },
    results,
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to: ${reportPath}`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Runner failed:', err);
  process.exit(1);
});
