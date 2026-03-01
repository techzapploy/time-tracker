import { writeFile, mkdir } from 'fs/promises';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

// Load dotenv from repo root when not in production
if (process.env['NODE_ENV'] !== 'production') {
  const { default: dotenv } = await import('dotenv');
  const __dirname = fileURLToPath(new URL('.', import.meta.url));
  const repoRoot = resolve(__dirname, '../../../../');
  dotenv.config({ path: join(repoRoot, '.env') });
}

import { checkDatabase } from './checks/database.js';
import type { CheckResult } from './checks/database.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkRender } from './checks/render.js';
import { checkLinear } from './checks/linear.js';
import { checkGitHub } from './checks/github.js';
import { checkSentry } from './checks/sentry.js';

const results: CheckResult[] = await Promise.all([
  checkDatabase(),
  checkRedis(),
  checkDiscord(),
  checkRender(),
  checkLinear(),
  checkGitHub(),
  checkSentry(),
]);

// Print aligned summary table
const nameWidth = Math.max(...results.map((r) => r.name.length), 10);
const statusWidth = 7;

const statusIcon = (status: CheckResult['status']): string => {
  switch (status) {
    case 'pass':
      return 'PASS';
    case 'fail':
      return 'FAIL';
    case 'skipped':
      return 'SKIP';
  }
};

console.log('');
console.log('Integration Test Results');
console.log('='.repeat(nameWidth + statusWidth + 30));
console.log(
  `${'Service'.padEnd(nameWidth)}  ${'Status'.padEnd(statusWidth)}  ${'Duration'.padEnd(10)}  Message`,
);
console.log('-'.repeat(nameWidth + statusWidth + 30));

for (const result of results) {
  const icon = statusIcon(result.status);
  const duration = `${result.durationMs}ms`;
  console.log(
    `${result.name.padEnd(nameWidth)}  ${icon.padEnd(statusWidth)}  ${duration.padEnd(10)}  ${result.message}`,
  );
}

console.log('='.repeat(nameWidth + statusWidth + 30));
console.log('');

// Write JSON report
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportDir = resolve('DailyIntegrationTestResult');
const reportPath = join(reportDir, `report-${timestamp}.json`);

await mkdir(reportDir, { recursive: true });
await writeFile(
  reportPath,
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      results,
    },
    null,
    2,
  ),
);

console.log(`Report written to: ${reportPath}`);

const hasFailed = results.some((r) => r.status === 'fail');

process.exit(hasFailed ? 1 : 0);
