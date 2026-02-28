import fs from 'fs';
import path from 'path';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkGitHub } from './checks/github.js';
import { checkDiscord } from './checks/discord.js';
import { checkLinear } from './checks/linear.js';
import { checkRender } from './checks/render.js';
import { checkSentry } from './checks/sentry.js';

interface CheckResult {
  service: string;
  passed: boolean;
  error?: string;
}

interface Report {
  timestamp: string;
  results: CheckResult[];
  passed: boolean;
}

function withTimeout(promise: Promise<CheckResult>, timeoutMs: number): Promise<CheckResult> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ service: 'unknown', passed: false, error: `Timed out after ${timeoutMs}ms` });
    }, timeoutMs);

    promise.then((result) => {
      clearTimeout(timer);
      resolve(result);
    }).catch((err) => {
      clearTimeout(timer);
      const message = err instanceof Error ? err.message : String(err);
      resolve({ service: 'unknown', passed: false, error: message });
    });
  });
}

async function runCheck(check: () => Promise<CheckResult>): Promise<CheckResult> {
  const TIMEOUT = 10000;
  const RETRY_DELAY = 2000;

  let result = await withTimeout(check(), TIMEOUT);

  if (!result.passed) {
    // Wait and retry once
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    result = await withTimeout(check(), TIMEOUT);
  }

  return result;
}

async function main() {
  const timestamp = new Date().toISOString();
  const checks = [
    checkPostgres,
    checkRedis,
    checkGitHub,
    checkDiscord,
    checkLinear,
    checkRender,
    checkSentry,
  ];

  const results: CheckResult[] = [];

  for (const check of checks) {
    const result = await runCheck(check);
    results.push(result);

    if (result.passed) {
      console.log(`[PASS] ${result.service}`);
    } else {
      console.log(`[FAIL] ${result.service}: ${result.error ?? 'unknown error'}`);
    }
  }

  const allPassed = results.every((r) => r.passed);

  const report: Report = {
    timestamp,
    results,
    passed: allPassed,
  };

  const reportDir = path.resolve('DailyIntegrationTestResult');
  fs.mkdirSync(reportDir, { recursive: true });

  const date = new Date().toISOString().split('T')[0];
  const reportPath = path.join(reportDir, `${date}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to ${reportPath}`);

  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
