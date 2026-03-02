import fs from 'fs';
import path from 'path';
import type { CheckResult, CheckFn } from './types.js';
import { check as checkPostgres } from './checks/postgres.js';
import { check as checkRedis } from './checks/redis.js';
import { check as checkDiscord } from './checks/discord.js';
import { check as checkGitHub } from './checks/github.js';
import { check as checkLinear } from './checks/linear.js';
import { check as checkRender } from './checks/render.js';
import { check as checkSentry } from './checks/sentry.js';

function withTimeout(check: CheckFn, ms: number): Promise<CheckResult> {
  const timeoutPromise: Promise<CheckResult> = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        service: 'unknown',
        status: 'fail',
        message: `Timed out after ${ms / 1000}s`,
        timestamp: new Date().toISOString(),
      });
    }, ms);
  });
  return Promise.race([check(), timeoutPromise]);
}

const checks: CheckFn[] = [
  checkPostgres,
  checkRedis,
  checkDiscord,
  checkGitHub,
  checkLinear,
  checkRender,
  checkSentry,
];

const races = checks.map((check) => withTimeout(check, 5000));

const settled = await Promise.allSettled(races);

const results: CheckResult[] = settled.map((result) => {
  if (result.status === 'fulfilled') {
    return result.value;
  }
  return {
    service: 'unknown',
    status: 'fail',
    message: result.reason instanceof Error ? result.reason.message : 'Unexpected error',
    timestamp: new Date().toISOString(),
  };
});

// Print summary table
console.log('\nIntegration Test Results');
console.log('========================');
console.log(`${'Service'.padEnd(16)} ${'Status'.padEnd(8)} Message`);
console.log('-'.repeat(70));
for (const r of results) {
  console.log(`${r.service.padEnd(16)} ${r.status.padEnd(8)} ${r.message}`);
}
console.log('');

// Write JSON report
const date = new Date().toISOString().slice(0, 10);
const reportDir = path.resolve(process.cwd(), '../DailyIntegrationTestResult');
fs.mkdirSync(reportDir, { recursive: true });
const reportPath = path.join(reportDir, `Integration-Status-${date}.json`);
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`Report written to: ${reportPath}`);

const anyFailed = results.some((r) => r.status === 'fail');
process.exit(anyFailed ? 1 : 0);
