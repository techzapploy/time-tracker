import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { CheckResult } from './types.js';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkGitHub } from './checks/github.js';
import { checkLinear } from './checks/linear.js';
import { checkRender } from './checks/render.js';
import { checkSentry } from './checks/sentry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function withTimeout(fn: () => Promise<CheckResult>, ms: number): Promise<CheckResult> {
  return Promise.race([
    fn(),
    new Promise<CheckResult>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function main(): Promise<void> {
  const checks: Array<() => Promise<CheckResult>> = [
    () => withTimeout(checkPostgres, 5000),
    () => withTimeout(checkRedis, 5000),
    () => withTimeout(checkDiscord, 5000),
    () => withTimeout(checkGitHub, 5000),
    () => withTimeout(checkLinear, 5000),
    () => withTimeout(checkRender, 5000),
    () => withTimeout(checkSentry, 5000),
  ];

  const settled = await Promise.allSettled(checks.map((fn) => fn()));

  const results: CheckResult[] = settled.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    const serviceNames = ['postgres', 'redis', 'discord', 'github', 'linear', 'render', 'sentry'];
    const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
    return {
      service: serviceNames[index] ?? `check-${index}`,
      status: 'failed' as const,
      message,
      durationMs: 0,
    };
  });

  // Print formatted table
  const header = `${'Service'.padEnd(12)} ${'Status'.padEnd(8)} ${'DurationMs'.padEnd(12)} Message`;
  console.log(header);
  console.log('-'.repeat(header.length));
  for (const r of results) {
    const line = `${r.service.padEnd(12)} ${r.status.padEnd(8)} ${String(r.durationMs).padEnd(12)} ${r.message ?? ''}`;
    console.log(line);
  }

  // Write results to file
  const outputDir = path.resolve(__dirname, '../../DailyIntegrationTestResult');
  await fs.mkdir(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportPath = path.join(outputDir, `report-${timestamp}.json`);
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nReport written to ${reportPath}`);

  // Exit with code 1 if any non-skipped check failed
  const hasFailed = results.some((r) => r.status === 'failed');
  process.exit(hasFailed ? 1 : 0);
}

main().catch((err) => {
  console.error('Runner failed:', err);
  process.exit(1);
});
