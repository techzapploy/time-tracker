import fs from 'fs';
import path from 'path';
import type { CheckResult } from './types.js';
import checkPostgres from './checks/postgres.js';
import checkRedis from './checks/redis.js';
import checkDiscord from './checks/discord.js';
import checkGithub from './checks/github.js';
import checkLinear from './checks/linear.js';
import checkRender from './checks/render.js';
import checkSentry from './checks/sentry.js';

async function runWithTimeout(
  checkFn: () => Promise<CheckResult>,
  timeoutMs: number,
): Promise<CheckResult> {
  const timeoutPromise = new Promise<CheckResult>((resolve) => {
    setTimeout(() => {
      resolve({
        service: 'unknown',
        status: 'fail',
        message: `Check timed out after ${timeoutMs}ms`,
        duration_ms: timeoutMs,
      });
    }, timeoutMs);
  });

  return Promise.race([checkFn(), timeoutPromise]);
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

const results: CheckResult[] = [];

for (const checkFn of checks) {
  try {
    const result = await runWithTimeout(checkFn, 30_000);
    results.push(result);

    const icon =
      result.status === 'pass' ? '[✓]' :
      result.status === 'fail' ? '[✗]' :
      '[-]';

    console.log(`${icon} ${result.service}: ${result.message} (${result.duration_ms}ms)`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const failResult: CheckResult = {
      service: 'unknown',
      status: 'fail',
      message,
      duration_ms: 0,
    };
    results.push(failResult);
    console.log(`[✗] unknown: ${message}`);
  }
}

const total = results.length;
const passed = results.filter((r) => r.status === 'pass').length;
const failed = results.filter((r) => r.status === 'fail').length;
const skipped = results.filter((r) => r.status === 'skipped').length;

console.log('');
console.log(`Summary: ${total} total, ${passed} passed, ${failed} failed, ${skipped} skipped`);

const now = new Date();
const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
const timestamp = now.toISOString();

const outputDir = path.resolve(process.cwd(), '../DailyIntegrationTestResult');
fs.mkdirSync(outputDir, { recursive: true });

const filename = `integration-test-${dateStr}-${Date.now()}.json`;
const outputPath = path.join(outputDir, filename);

const report = {
  date: dateStr,
  timestamp,
  summary: {
    total,
    passed,
    failed,
    skipped,
  },
  results,
};

fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
console.log(`Report written to: ${outputPath}`);

process.exit(failed > 0 ? 1 : 0);
