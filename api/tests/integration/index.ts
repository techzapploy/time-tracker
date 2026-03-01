import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { CheckResult } from './types';
import { checkPostgres } from './checks/postgres';
import { checkRedis } from './checks/redis';
import { checkDiscord } from './checks/discord';
import { checkRender } from './checks/render';
import { checkLinear } from './checks/linear';
import { checkGithub } from './checks/github';
import { checkSentry } from './checks/sentry';

type CheckFn = () => Promise<CheckResult>;

async function runCheck(name: string, checkFn: CheckFn): Promise<CheckResult> {
  const start = Date.now();

  const timeoutPromise: Promise<CheckResult> = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name,
        status: 'fail',
        message: 'Check timed out after 10 seconds',
        durationMs: Date.now() - start,
      });
    }, 10000);
  });

  try {
    const result = await Promise.race([checkFn(), timeoutPromise]);
    return result;
  } catch (err) {
    return {
      name,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}

function formatResultsTable(results: CheckResult[]): void {
  const nameWidth = Math.max(10, ...results.map((r) => r.name.length));
  const statusWidth = 6;
  const durationWidth = 10;

  const separator = '-'.repeat(nameWidth + statusWidth + durationWidth + 20);
  const header = `| ${'Name'.padEnd(nameWidth)} | ${'Status'.padEnd(statusWidth)} | ${'Duration'.padEnd(durationWidth)} | Message`;

  console.log('\n' + separator);
  console.log(header);
  console.log(separator);

  for (const result of results) {
    const statusIcon = result.status === 'pass' ? 'PASS' : result.status === 'fail' ? 'FAIL' : 'SKIP';
    const line = `| ${result.name.padEnd(nameWidth)} | ${statusIcon.padEnd(statusWidth)} | ${`${result.durationMs}ms`.padEnd(durationWidth)} | ${result.message}`;
    console.log(line);
  }

  console.log(separator + '\n');
}

async function main(): Promise<void> {
  const runAt = new Date().toISOString();

  console.log(`Integration Test Run: ${runAt}`);
  console.log('Running checks...\n');

  const checks: Array<{ name: string; fn: CheckFn }> = [
    { name: 'postgres', fn: checkPostgres },
    { name: 'redis', fn: checkRedis },
    { name: 'discord', fn: checkDiscord },
    { name: 'render', fn: checkRender },
    { name: 'linear', fn: checkLinear },
    { name: 'github', fn: checkGithub },
    { name: 'sentry', fn: checkSentry },
  ];

  const results: CheckResult[] = [];

  for (const check of checks) {
    process.stdout.write(`  Running ${check.name}...`);
    const result = await runCheck(check.name, check.fn);
    results.push(result);
    const statusLabel = result.status === 'pass' ? 'PASS' : result.status === 'fail' ? 'FAIL' : 'SKIP';
    console.log(` ${statusLabel}`);
  }

  formatResultsTable(results);

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skip').length;
  const total = results.length;

  console.log(`Summary: ${total} total, ${passed} passed, ${failed} failed, ${skipped} skipped`);

  const report = {
    runAt,
    results,
    summary: {
      total,
      passed,
      failed,
      skipped,
    },
  };

  const reportDir = join(process.cwd(), '..', 'DailyIntegrationTestResult');
  mkdirSync(reportDir, { recursive: true });

  const timestamp = runAt
    .replace(/:/g, '-')
    .replace('T', '-')
    .replace(/\..+$/, '');
  const reportFileName = `${timestamp}.json`;
  const reportPath = join(reportDir, reportFileName);

  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to: ${reportPath}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
