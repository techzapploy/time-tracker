import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { CheckResult } from './types.js';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkGitHub } from './checks/github.js';
import { checkLinear } from './checks/linear.js';
import { checkRender } from './checks/render.js';
import { checkSentry } from './checks/sentry.js';

const TIMEOUT_MS = 5000;

async function withTimeout(
  fn: () => Promise<CheckResult>,
  name: string,
): Promise<CheckResult> {
  const start = Date.now();
  return Promise.race([
    fn(),
    new Promise<CheckResult>((resolve) =>
      setTimeout(() => {
        resolve({
          name,
          status: 'fail',
          message: `Check timed out after ${TIMEOUT_MS}ms`,
          durationMs: Date.now() - start,
        });
      }, TIMEOUT_MS),
    ),
  ]);
}

const checks: Array<{ name: string; fn: () => Promise<CheckResult> }> = [
  { name: 'postgres', fn: checkPostgres },
  { name: 'redis', fn: checkRedis },
  { name: 'discord', fn: checkDiscord },
  { name: 'github', fn: checkGitHub },
  { name: 'linear', fn: checkLinear },
  { name: 'render', fn: checkRender },
  { name: 'sentry', fn: checkSentry },
];

async function main(): Promise<void> {
  const runAt = new Date().toISOString();

  console.log(`Running integration checks at ${runAt}`);

  const results = await Promise.all(
    checks.map(({ name, fn }) => withTimeout(fn, name)),
  );

  for (const result of results) {
    const icon =
      result.status === 'ok'
        ? 'PASS'
        : result.status === 'skip'
          ? 'SKIP'
          : 'FAIL';
    console.log(
      `[${icon}] ${result.name} (${result.durationMs}ms): ${result.message}`,
    );
  }

  const hasFail = results.some((r) => r.status === 'fail');
  const overall = hasFail ? 'fail' : 'ok';

  const report = {
    runAt,
    overall,
    results,
  };

  const reportDir = join(process.cwd(), 'DailyIntegrationTestResult');
  await mkdir(reportDir, { recursive: true });

  const filename = `${runAt.replace(/[:.]/g, '-')}.json`;
  const reportPath = join(reportDir, filename);
  await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`\nReport written to ${reportPath}`);
  console.log(`Overall: ${overall.toUpperCase()}`);

  process.exit(hasFail ? 1 : 0);
}

main().catch((err) => {
  console.error('Runner error:', err);
  process.exit(1);
});
