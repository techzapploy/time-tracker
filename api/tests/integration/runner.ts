import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkGitHub } from './checks/github.js';
import { checkLinear } from './checks/linear.js';
import { checkRender } from './checks/render.js';
import { checkSentry } from './checks/sentry.js';

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
  summary: {
    total: number;
    ok: number;
    failed: number;
    skipped: number;
  };
}

const TIMEOUT_MS = 30000;

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  name: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Check timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    if (timer) clearTimeout(timer);
    return result;
  } catch (err) {
    if (timer) clearTimeout(timer);
    throw err;
  }
}

async function runCheck(
  checkFn: () => Promise<CheckResult>
): Promise<CheckResult> {
  try {
    return await withTimeout(checkFn(), TIMEOUT_MS, checkFn.name);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name: checkFn.name,
      status: 'failed',
      message: `Unexpected error: ${message}`,
    };
  }
}

function printResult(result: CheckResult): void {
  const statusSymbol =
    result.status === 'ok' ? '✓' : result.status === 'skipped' ? '-' : '✗';
  const durationStr =
    result.durationMs !== undefined ? ` (${result.durationMs}ms)` : '';
  console.log(
    `  [${statusSymbol}] ${result.name}: ${result.message}${durationStr}`
  );
}

async function main(): Promise<void> {
  console.log('');
  console.log('=== Integration Test Runner ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('');

  const checks = [
    checkPostgres,
    checkRedis,
    checkDiscord,
    checkGitHub,
    checkLinear,
    checkRender,
    checkSentry,
  ];

  console.log('Running checks...');
  console.log('');

  const results: CheckResult[] = [];

  for (const check of checks) {
    const result = await runCheck(check);
    results.push(result);
    printResult(result);
  }

  console.log('');

  const summary = {
    total: results.length,
    ok: results.filter((r) => r.status === 'ok').length,
    failed: results.filter((r) => r.status === 'failed').length,
    skipped: results.filter((r) => r.status === 'skipped').length,
  };

  const overall: 'ok' | 'failed' = summary.failed > 0 ? 'failed' : 'ok';

  console.log('=== Summary ===');
  console.log(`  Total:   ${summary.total}`);
  console.log(`  OK:      ${summary.ok}`);
  console.log(`  Failed:  ${summary.failed}`);
  console.log(`  Skipped: ${summary.skipped}`);
  console.log(`  Overall: ${overall.toUpperCase()}`);
  console.log('');

  const report: RunReport = {
    timestamp: new Date().toISOString(),
    overall,
    results,
    summary,
  };

  // Save report to DailyIntegrationTestResult/
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const reportDir = join(__dirname, '..', '..', '..', 'DailyIntegrationTestResult');

  try {
    mkdirSync(reportDir, { recursive: true });
    const dateStr = new Date().toISOString().slice(0, 10);
    const reportPath = join(reportDir, `${dateStr}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`Report saved to: ${reportPath}`);
  } catch (err) {
    console.warn(`Warning: Could not save report: ${err}`);
  }

  // Exit with appropriate code
  process.exit(summary.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
