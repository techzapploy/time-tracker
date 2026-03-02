import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkGithub } from './checks/github.js';
import { checkLinear } from './checks/linear.js';
import { checkRender } from './checks/render.js';
import { checkSentry } from './checks/sentry.js';
import type { CheckResult } from './types.js';

const TIMEOUT_MS = 5000;

function runWithTimeout(
  fn: () => Promise<CheckResult>,
  timeoutMs: number,
): Promise<CheckResult> {
  const timeoutPromise: Promise<CheckResult> = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'unknown',
        status: 'fail',
        reason: `Timeout after ${timeoutMs}ms`,
        duration_ms: timeoutMs,
      });
    }, timeoutMs);
  });

  const checkPromise = fn().catch((err): CheckResult => ({
    name: 'unknown',
    status: 'fail',
    reason: err instanceof Error ? err.message : String(err),
    duration_ms: timeoutMs,
  }));

  return Promise.race([checkPromise, timeoutPromise]);
}

const checks: Array<() => Promise<CheckResult>> = [
  checkPostgres,
  checkRedis,
  checkDiscord,
  checkGithub,
  checkLinear,
  checkRender,
  checkSentry,
];

function printResults(results: CheckResult[]): void {
  console.log('\nIntegration Test Results');
  console.log('========================');
  for (const result of results) {
    const label =
      result.status === 'pass'
        ? '[PASS]'
        : result.status === 'fail'
          ? '[FAIL]'
          : '[SKIP]';
    const durationStr = `${result.duration_ms}ms`;
    const reasonStr = result.reason ? ` - ${result.reason}` : '';
    console.log(
      `${label} ${result.name.padEnd(12)} ${durationStr.padStart(6)}${reasonStr}`,
    );
  }
  console.log('');
}

function saveResults(results: CheckResult[]): void {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const reportDir = path.resolve(
    __dirname,
    '../../../DailyIntegrationTestResult',
  );
  fs.mkdirSync(reportDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = path.join(reportDir, `report-${timestamp}.json`);
  const report = {
    timestamp: new Date().toISOString(),
    results,
  };
  fs.writeFileSync(filename, JSON.stringify(report, null, 2));
  console.log(`Report saved to ${filename}`);
}

const results = await Promise.all(
  checks.map((fn) => runWithTimeout(fn, TIMEOUT_MS)),
);

printResults(results);
saveResults(results);

const anyFailed = results.some((r) => r.status === 'fail');
process.exit(anyFailed ? 1 : 0);
