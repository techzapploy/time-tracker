import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import type { CheckResult } from './types.js';
import checkPostgres from './checks/postgres.js';
import checkRedis from './checks/redis.js';
import checkDiscord from './checks/discord.js';
import checkGitHub from './checks/github.js';
import checkLinear from './checks/linear.js';
import checkRender from './checks/render.js';
import checkSentry from './checks/sentry.js';

const TIMEOUT_MS = 5000;

async function runWithTimeout(
  fn: () => Promise<CheckResult>,
  timeoutMs: number,
): Promise<CheckResult> {
  return Promise.race([
    fn(),
    new Promise<CheckResult>((resolve) =>
      setTimeout(
        () =>
          resolve({
            name: 'unknown',
            status: 'fail',
            reason: `Timeout after ${timeoutMs}ms`,
            duration_ms: timeoutMs,
          }),
        timeoutMs,
      ),
    ),
  ]);
}

function printResults(results: CheckResult[]): void {
  console.log('\n=== Integration Test Results ===\n');

  const statusSymbols: Record<CheckResult['status'], string> = {
    pass: '[PASS]   ',
    fail: '[FAIL]   ',
    skip: '[SKIP]   ',
  };

  for (const result of results) {
    const symbol = statusSymbols[result.status];
    const detail = result.reason ? ` — ${result.reason}` : '';
    console.log(`${symbol} ${result.name} (${result.duration_ms}ms)${detail}`);
  }

  const total = results.length;
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skip').length;

  console.log('\n--- Summary ---');
  console.log(`Total:   ${total}`);
  console.log(`Passed:  ${passed}`);
  console.log(`Failed:  ${failed}`);
  console.log(`Skipped: ${skipped}`);
  console.log('');
}

function saveResults(results: CheckResult[]): void {
  const outputDir = path.resolve(import.meta.dirname, '../../../DailyIntegrationTestResult');

  fs.mkdirSync(outputDir, { recursive: true });

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}.json`;
  const filepath = path.join(outputDir, filename);

  const report = {
    timestamp: now.toISOString(),
    results,
    summary: {
      total: results.length,
      passed: results.filter((r) => r.status === 'pass').length,
      failed: results.filter((r) => r.status === 'fail').length,
      skipped: results.filter((r) => r.status === 'skip').length,
    },
  };

  fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Results saved to: ${filepath}`);
}

async function main(): Promise<void> {
  console.log('Starting integration tests...');
  console.log(`Timeout per check: ${TIMEOUT_MS}ms`);

  const checks: Array<() => Promise<CheckResult>> = [
    checkPostgres,
    checkRedis,
    checkDiscord,
    checkGitHub,
    checkLinear,
    checkRender,
    checkSentry,
  ];

  const results = await Promise.all(
    checks.map((fn) => runWithTimeout(fn, TIMEOUT_MS)),
  );

  printResults(results);
  saveResults(results);

  const anyFailed = results.some((r) => r.status === 'fail');
  process.exit(anyFailed ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error in runner:', err);
  process.exit(1);
});
