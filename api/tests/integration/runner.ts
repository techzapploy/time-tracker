import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { CheckResult, IntegrationReport } from './types.js';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkRender } from './checks/render.js';
import { checkLinear } from './checks/linear.js';
import { checkGitHub } from './checks/github.js';
import { checkSentry } from './checks/sentry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STATUS_ICONS: Record<string, string> = {
  pass: '✅',
  fail: '❌',
  skipped: '⏭️',
};

async function runChecks(): Promise<void> {
  console.log('\n=== Integration Test Suite ===\n');

  const checks: Array<() => Promise<CheckResult>> = [
    checkPostgres,
    checkRedis,
    checkDiscord,
    checkRender,
    checkLinear,
    checkGitHub,
    checkSentry,
  ];

  const results: CheckResult[] = [];

  for (const check of checks) {
    const result = await check();
    const icon = STATUS_ICONS[result.status] ?? '?';
    console.log(`${icon} ${result.name.padEnd(12)} [${result.status.toUpperCase()}] ${result.message} (${result.durationMs}ms)`);
    results.push(result);
  }

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  console.log('\n--- Summary ---');
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);

  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');

  const report: IntegrationReport = {
    timestamp: new Date().toISOString(),
    totalChecks: results.length,
    passed,
    failed,
    skipped,
    results,
  };

  const reportDir = join(__dirname, '../../DailyIntegrationTestResult');
  mkdirSync(reportDir, { recursive: true });
  const reportPath = join(reportDir, `${timestamp}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to: ${reportPath}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runChecks().catch((err) => {
  console.error('Runner crashed:', err);
  process.exit(1);
});
