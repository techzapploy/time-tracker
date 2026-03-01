import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkGitHub } from './checks/github.js';
import { checkLinear } from './checks/linear.js';
import { checkRender } from './checks/render.js';
import { checkSentry } from './checks/sentry.js';
import type { CheckResult } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function main() {
  console.log('Running integration checks...\n');

  const checks = [
    () => withTimeout(() => checkPostgres(), 10_000),
    () => withTimeout(() => checkRedis(), 10_000),
    () => withTimeout(() => checkDiscord(), 10_000),
    () => withTimeout(() => checkGitHub(), 10_000),
    () => withTimeout(() => checkLinear(), 10_000),
    () => withTimeout(() => checkRender(), 10_000),
    () => withTimeout(() => checkSentry(), 10_000),
  ];

  const settled = await Promise.allSettled(checks.map(fn => fn()));

  const results: CheckResult[] = settled.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    const services = ['PostgreSQL', 'Redis', 'Discord', 'GitHub', 'Linear', 'Render', 'Sentry'];
    return {
      service: services[i],
      status: 'fail' as const,
      message: result.reason instanceof Error ? result.reason.message : String(result.reason),
      timestamp: new Date().toISOString(),
    };
  });

  // Print results
  for (const r of results) {
    const icon = r.status === 'pass' ? '✓' : r.status === 'skip' ? '~' : '✗';
    console.log(`[${icon}] ${r.service.padEnd(12)} ${r.status.toUpperCase().padEnd(6)} ${r.message}`);
  }

  // Save JSON report
  const reportsDir = path.resolve(__dirname, '..', '..', '..', 'DailyIntegrationTestResult');
  fs.mkdirSync(reportsDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const reportPath = path.join(reportsDir, `${date}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);

  const anyFailed = results.some(r => r.status === 'fail');
  process.exit(anyFailed ? 1 : 0);
}

main().catch(err => {
  console.error('Runner error:', err);
  process.exit(1);
});
