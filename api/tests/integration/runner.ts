import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { check as checkPostgres } from './checks/postgres.js';
import { check as checkRedis } from './checks/redis.js';
import { check as checkDiscord } from './checks/discord.js';
import { check as checkGitHub } from './checks/github.js';
import { check as checkLinear } from './checks/linear.js';
import { check as checkRender } from './checks/render.js';
import { check as checkSentry } from './checks/sentry.js';

type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs: number;
};

const TIMEOUT_MS = 10_000;

function withTimeout(promise: Promise<CheckResult>, ms: number, service: string): Promise<CheckResult> {
  const start = Date.now();
  const timeout = new Promise<CheckResult>((resolve) =>
    setTimeout(
      () => resolve({ service, status: 'fail', message: `Timed out after ${ms}ms`, durationMs: Date.now() - start }),
      ms,
    ),
  );
  return Promise.race([promise, timeout]);
}

const checks: Array<{ service: string; fn: () => Promise<CheckResult> }> = [
  { service: 'PostgreSQL', fn: checkPostgres },
  { service: 'Redis', fn: checkRedis },
  { service: 'Discord', fn: checkDiscord },
  { service: 'GitHub', fn: checkGitHub },
  { service: 'Linear', fn: checkLinear },
  { service: 'Render', fn: checkRender },
  { service: 'Sentry', fn: checkSentry },
];

function pad(str: string, len: number): string {
  return str.padEnd(len, ' ');
}

function printTable(results: CheckResult[]): void {
  const cols = { service: 14, status: 6, message: 44, duration: 10 };
  const divider = `${'-'.repeat(cols.service)}-+-${'-'.repeat(cols.status)}-+-${'-'.repeat(cols.message)}-+-${'-'.repeat(cols.duration)}`;
  console.log(`\n${pad('SERVICE', cols.service)} | ${pad('STATUS', cols.status)} | ${pad('MESSAGE', cols.message)} | DURATION`);
  console.log(divider);
  for (const r of results) {
    const statusLabel = r.status.toUpperCase();
    const duration = `${r.durationMs}ms`;
    console.log(`${pad(r.service, cols.service)} | ${pad(statusLabel, cols.status)} | ${pad(r.message, cols.message)} | ${duration}`);
  }
  console.log('');
}

async function run(): Promise<void> {
  console.log('Running integration checks...\n');
  const results = await Promise.all(
    checks.map(({ service, fn }) => withTimeout(fn(), TIMEOUT_MS, service)),
  );

  printTable(results);

  // Write JSON report
  const __dirname = dirname(fileURLToPath(import.meta.url));
  // runner is at api/tests/integration/runner.ts — go up 3 levels to repo root
  const repoRoot = join(__dirname, '..', '..', '..');
  const reportDir = join(repoRoot, 'DailyIntegrationTestResult');
  await mkdir(reportDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const reportPath = join(reportDir, `${date}.json`);
  const report = { date: new Date().toISOString(), results };
  await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Report saved to: ${reportPath}`);

  const hasFailure = results.some((r) => r.status === 'fail');
  if (hasFailure) {
    console.error('One or more checks failed.');
    process.exit(1);
  }
  console.log('All checks passed or skipped.');
}

run().catch((err) => {
  console.error('Runner error:', err);
  process.exit(1);
});
