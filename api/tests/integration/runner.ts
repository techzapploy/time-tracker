import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { check as checkPostgres } from './checks/postgres.js';
import { check as checkRedis } from './checks/redis.js';
import { check as checkDiscord } from './checks/discord.js';
import { check as checkGitHub } from './checks/github.js';
import { check as checkLinear } from './checks/linear.js';
import { check as checkRender } from './checks/render.js';
import { check as checkSentry } from './checks/sentry.js';

type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip' | 'timeout';
  durationMs: number;
  error: string | null;
};

const TIMEOUT_MS = 5000;

function timeout(ms: number, service: string): Promise<CheckResult> {
  return new Promise((resolve) =>
    setTimeout(
      () => resolve({ service, status: 'timeout', durationMs: ms, error: 'Timed out' }),
      ms,
    ),
  );
}

async function runCheck(
  name: string,
  checkFn: () => Promise<CheckResult>,
): Promise<CheckResult> {
  try {
    return await Promise.race([checkFn(), timeout(TIMEOUT_MS, name)]);
  } catch (err) {
    return {
      service: name,
      status: 'fail',
      durationMs: TIMEOUT_MS,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

const checks: Array<[string, () => Promise<CheckResult>]> = [
  ['postgres', checkPostgres],
  ['redis', checkRedis],
  ['discord', checkDiscord],
  ['github', checkGitHub],
  ['linear', checkLinear],
  ['render', checkRender],
  ['sentry', checkSentry],
];

const settled = await Promise.allSettled(
  checks.map(([name, fn]) => runCheck(name, fn)),
);

const results: CheckResult[] = settled.map((s) => {
  if (s.status === 'fulfilled') return s.value;
  return {
    service: 'unknown',
    status: 'fail' as const,
    durationMs: 0,
    error: s.reason instanceof Error ? s.reason.message : String(s.reason),
  };
});

// Print summary table
console.log('\nIntegration Test Results\n' + '='.repeat(60));
const statusIcon: Record<string, string> = {
  pass: 'PASS',
  fail: 'FAIL',
  skip: 'SKIP',
  timeout: 'TIMEOUT',
};
for (const result of results) {
  const icon = statusIcon[result.status] ?? result.status.toUpperCase();
  const errorInfo = result.error ? ` (${result.error})` : '';
  console.log(`  [${icon}] ${result.service.padEnd(12)} ${result.durationMs}ms${errorInfo}`);
}
console.log('='.repeat(60) + '\n');

// Write JSON results to DailyIntegrationTestResult at repo root (one level above api/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// runner.ts lives at api/tests/integration/runner.ts → repo root is 3 levels up
const repoRoot = join(__dirname, '..', '..', '..');
const outputDir = join(repoRoot, 'DailyIntegrationTestResult');

try {
  mkdirSync(outputDir, { recursive: true });
  const isoDate = new Date().toISOString().slice(0, 10);
  const outputPath = join(outputDir, `${isoDate}.json`);
  writeFileSync(
    outputPath,
    JSON.stringify({ date: new Date().toISOString(), results }, null, 2),
    'utf8',
  );
  console.log(`Results written to ${outputPath}`);
} catch (err) {
  console.error('Failed to write results file:', err instanceof Error ? err.message : String(err));
}

// Exit with code 1 if any result is fail or timeout
const hasFailure = results.some((r) => r.status === 'fail' || r.status === 'timeout');
process.exit(hasFailure ? 1 : 0);
