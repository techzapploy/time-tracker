import { config } from 'dotenv';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { CheckResult } from './checks/types.js';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkGithub } from './checks/github.js';
import { checkLinear } from './checks/linear.js';
import { checkRender } from './checks/render.js';
import { checkSentry } from './checks/sentry.js';

config();

const TIMEOUT_MS = 5000;

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  service: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Check timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function runCheck(
  name: string,
  checkFn: () => Promise<CheckResult>,
): Promise<CheckResult> {
  const start = Date.now();
  try {
    return await withTimeout(checkFn(), TIMEOUT_MS, name);
  } catch (err) {
    return {
      service: name,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration: Date.now() - start,
    };
  }
}

async function main(): Promise<void> {
  const checks: Array<[string, () => Promise<CheckResult>]> = [
    ['postgres', checkPostgres],
    ['redis', checkRedis],
    ['discord', checkDiscord],
    ['github', checkGithub],
    ['linear', checkLinear],
    ['render', checkRender],
    ['sentry', checkSentry],
  ];

  const settled = await Promise.allSettled(
    checks.map(([name, fn]) => runCheck(name, fn)),
  );

  const results: CheckResult[] = settled.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      service: checks[index]![0],
      status: 'fail' as const,
      message: result.reason instanceof Error ? result.reason.message : String(result.reason),
      duration: 0,
    };
  });

  // Log summary to console
  console.log('\n=== Integration Test Results ===\n');
  for (const result of results) {
    const icon = result.status === 'pass' ? 'PASS' : result.status === 'skip' ? 'SKIP' : 'FAIL';
    console.log(`[${icon}] ${result.service}: ${result.message} (${result.duration}ms)`);
  }

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skip').length;
  console.log(`\nSummary: ${passed} passed, ${failed} failed, ${skipped} skipped\n`);

  // Write results to DailyIntegrationTestResult/<YYYY-MM-DD>.json
  const date = new Date().toISOString().slice(0, 10);
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outputDir = join(__dirname, '..', '..', '..', 'DailyIntegrationTestResult');

  await mkdir(outputDir, { recursive: true });
  const outputPath = join(outputDir, `${date}.json`);
  await writeFile(outputPath, JSON.stringify({ date, results }, null, 2), 'utf-8');
  console.log(`Results written to ${outputPath}`);

  // Exit 1 if any check failed, 0 if all pass or skip
  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Runner failed:', err);
  process.exit(1);
});
