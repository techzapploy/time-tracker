import { config } from 'dotenv';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { CheckResult } from './types.js';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkRender } from './checks/render.js';
import { checkLinear } from './checks/linear.js';
import { checkGitHub } from './checks/github.js';
import { checkSentry } from './checks/sentry.js';

config();

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  console.log('Running integration checks...\n');

  const results: CheckResult[] = await Promise.all([
    checkPostgres(),
    checkRedis(),
    checkDiscord(),
    checkRender(),
    checkLinear(),
    checkGitHub(),
    checkSentry(),
  ]);

  // Print formatted table
  const col1 = Math.max('Service'.length, ...results.map((r) => r.service.length));
  const col2 = Math.max('Status'.length, ...results.map((r) => r.status.length));
  const col3 = Math.max('Duration (ms)'.length, ...results.map((r) => String(r.durationMs).length));
  const col4 = Math.max('Message'.length, ...results.map((r) => r.message.length));

  const separator = `${'─'.repeat(col1 + 2)}-${'─'.repeat(col2 + 2)}-${'─'.repeat(col3 + 2)}-${'─'.repeat(col4 + 2)}`;

  const pad = (s: string, n: number): string => s.padEnd(n);

  console.log(separator);
  console.log(` ${pad('Service', col1)} | ${pad('Status', col2)} | ${pad('Duration (ms)', col3)} | ${pad('Message', col4)} `);
  console.log(separator);

  for (const r of results) {
    console.log(` ${pad(r.service, col1)} | ${pad(r.status, col2)} | ${pad(String(r.durationMs), col3)} | ${pad(r.message, col4)} `);
  }

  console.log(separator);
  console.log();

  // Write JSON report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = join(__dirname, '..', '..', '..', 'DailyIntegrationTestResult');

  mkdirSync(reportDir, { recursive: true });

  const reportPath = join(reportDir, `report-${timestamp}.json`);
  const report = {
    timestamp: new Date().toISOString(),
    results,
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report written to: ${reportPath}\n`);

  // Exit with code 1 if any check failed
  const hasFailed = results.some((r) => r.status === 'fail');
  process.exit(hasFailed ? 1 : 0);
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
