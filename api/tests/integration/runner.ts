import fs from 'fs';
import path from 'path';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkGithub } from './checks/github.js';
import { checkLinear } from './checks/linear.js';
import { checkRender } from './checks/render.js';
import { checkSentry } from './checks/sentry.js';
import type { CheckResult } from './types.js';

const TIMEOUT_MS = 5000;

async function withTimeout(promise: Promise<CheckResult>, name: string): Promise<CheckResult> {
  const start = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<CheckResult>((resolve) => {
    timer = setTimeout(() => {
      resolve({
        name,
        status: 'fail',
        message: `Timed out after ${TIMEOUT_MS}ms`,
        durationMs: Date.now() - start,
      });
    }, TIMEOUT_MS);
  });

  const result = await Promise.race([promise, timeoutPromise]);
  clearTimeout(timer);
  return result;
}

async function run(): Promise<void> {
  const checks: Array<() => Promise<CheckResult>> = [
    () => withTimeout(checkPostgres(), 'postgres'),
    () => withTimeout(checkRedis(), 'redis'),
    () => withTimeout(checkDiscord(), 'discord'),
    () => withTimeout(checkGithub(), 'github'),
    () => withTimeout(checkLinear(), 'linear'),
    () => withTimeout(checkRender(), 'render'),
    () => withTimeout(checkSentry(), 'sentry'),
  ];

  const results = await Promise.all(checks.map((check) => check()));

  for (const result of results) {
    const icon = result.status === 'pass' ? 'PASS' : result.status === 'skip' ? 'SKIP' : 'FAIL';
    console.log(`[${icon}] ${result.name} (${result.durationMs}ms): ${result.message}`);
  }

  const date = new Date().toISOString().slice(0, 10);
  const outputDir = path.resolve('..', 'DailyIntegrationTestResult');
  const outputFile = path.join(outputDir, `${date}.json`);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\nResults written to ${outputFile}`);

  const failed = results.filter((r) => r.status === 'fail');
  if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed.`);
    process.exit(1);
  }
}

run().catch((err: unknown) => {
  console.error('Unexpected error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
