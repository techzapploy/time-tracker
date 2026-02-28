import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkRender } from './checks/render.js';
import { checkLinear } from './checks/linear.js';
import { checkGitHub } from './checks/github.js';
import { checkSentry } from './checks/sentry.js';
import type { CheckResult } from './types.js';

interface Report {
  runAt: string;
  results: CheckResult[];
  overallPassed: boolean;
}

const CHECK_TIMEOUT_MS = 10000;

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  service: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${service} check timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

type CheckFunction = () => Promise<CheckResult>;

const checks: Array<{ name: string; fn: CheckFunction }> = [
  { name: 'PostgreSQL', fn: checkPostgres },
  { name: 'Redis', fn: checkRedis },
  { name: 'Discord', fn: checkDiscord },
  { name: 'Render', fn: checkRender },
  { name: 'Linear', fn: checkLinear },
  { name: 'GitHub', fn: checkGitHub },
  { name: 'Sentry', fn: checkSentry },
];

async function main(): Promise<void> {
  const runAt = new Date().toISOString();
  console.log(`\nIntegration Test Runner — ${runAt}\n`);
  console.log('='.repeat(60));

  const results: CheckResult[] = [];

  for (const check of checks) {
    let result: CheckResult;

    try {
      result = await withTimeout(check.fn(), CHECK_TIMEOUT_MS, check.name);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result = {
        service: check.name,
        passed: false,
        message,
      };
    }

    results.push(result);

    const statusLabel = result.skipped
      ? 'SKIP'
      : result.passed
        ? 'PASS'
        : 'FAIL';
    const statusSymbol = result.skipped ? '-' : result.passed ? '+' : 'x';

    console.log(`[${statusSymbol}] ${statusLabel} | ${result.service}: ${result.message}`);
  }

  console.log('='.repeat(60));

  const overallPassed = results.every((r) => r.skipped || r.passed);

  const report: Report = {
    runAt,
    results,
    overallPassed,
  };

  const reportDir = path.resolve(process.cwd(), '..', 'DailyIntegrationTestResult');
  fs.mkdirSync(reportDir, { recursive: true });

  const safeTimestamp = runAt.replace(/[:.]/g, '-');
  const reportFileName = `report-${safeTimestamp}.json`;
  const reportPath = path.join(reportDir, reportFileName);

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\nReport written to: ${reportPath}`);
  console.log(`\nOverall result: ${overallPassed ? 'PASSED' : 'FAILED'}`);

  process.exit(overallPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('Unexpected error in runner:', error);
  process.exit(1);
});
