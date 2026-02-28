import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { CheckResult } from './types.js';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkRender } from './checks/render.js';
import { checkLinear } from './checks/linear.js';
import { checkGithub } from './checks/github.js';
import { checkSentry } from './checks/sentry.js';

function timeoutPromise(ms: number): Promise<CheckResult> {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        service: 'timeout',
        status: 'fail',
        message: `Check timed out after ${ms / 1000}s`,
        duration_ms: ms,
      });
    }, ms)
  );
}

function formatStatus(result: CheckResult): string {
  const icon =
    result.status === 'pass' ? '✓' : result.status === 'skipped' ? '⊘' : '✗';
  return `${icon} ${result.service}: ${result.message} (${result.duration_ms}ms)`;
}

async function main(): Promise<void> {
  const checks: Array<() => Promise<CheckResult>> = [
    checkPostgres,
    checkRedis,
    checkDiscord,
    checkRender,
    checkLinear,
    checkGithub,
    checkSentry,
  ];

  const results: CheckResult[] = [];

  for (const check of checks) {
    const result = await Promise.race([check(), timeoutPromise(15000)]);
    results.push(result);
    console.log(formatStatus(result));
  }

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  console.log('');
  console.log(`Summary: ${passed} passed, ${failed} failed, ${skipped} skipped`);

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const timestamp = now.toISOString();

  const report = {
    date,
    timestamp,
    summary: {
      total: results.length,
      passed,
      failed,
      skipped,
    },
    results,
  };

  const outputDir = join(process.cwd(), '..', 'DailyIntegrationTestResult');
  mkdirSync(outputDir, { recursive: true });

  const filename = `integration-test-${date}-${now.getTime()}.json`;
  const outputPath = join(outputDir, filename);
  writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to: ${outputPath}`);

  process.exit(results.some((r) => r.status === 'fail') ? 1 : 0);
}

main().catch((err) => {
  console.error('Runner failed:', err);
  process.exit(1);
});
