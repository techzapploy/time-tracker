import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { CheckResult, CheckFn } from './types.js';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkGithub } from './checks/github.js';
import { checkLinear } from './checks/linear.js';
import { checkRender } from './checks/render.js';
import { checkSentry } from './checks/sentry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const checks: CheckFn[] = [
  checkPostgres,
  checkRedis,
  checkDiscord,
  checkGithub,
  checkLinear,
  checkRender,
  checkSentry,
];

function printAsciiTable(results: CheckResult[]): void {
  const colWidths = {
    service: Math.max(7, ...results.map((r) => r.service.length)),
    status: Math.max(6, ...results.map((r) => r.status.length)),
    duration: Math.max(8, ...results.map((r) => `${r.duration}ms`.length)),
    message: Math.max(7, ...results.map((r) => r.message.length)),
  };

  const sep = (w: number): string => '-'.repeat(w + 2);
  const border = `+${sep(colWidths.service)}+${sep(colWidths.status)}+${sep(colWidths.duration)}+${sep(colWidths.message)}+`;

  const cell = (value: string, width: number): string =>
    ` ${value.padEnd(width)} `;

  console.log(border);
  console.log(
    `|${cell('Service', colWidths.service)}|${cell('Status', colWidths.status)}|${cell('Duration', colWidths.duration)}|${cell('Message', colWidths.message)}|`,
  );
  console.log(border);

  for (const r of results) {
    console.log(
      `|${cell(r.service, colWidths.service)}|${cell(r.status, colWidths.status)}|${cell(`${r.duration}ms`, colWidths.duration)}|${cell(r.message, colWidths.message)}|`,
    );
  }

  console.log(border);
}

function writeReport(results: CheckResult[]): void {
  const reportDir = join(__dirname, '../../../DailyIntegrationTestResult');
  mkdirSync(reportDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = join(reportDir, `report-${timestamp}.json`);

  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      pass: results.filter((r) => r.status === 'pass').length,
      fail: results.filter((r) => r.status === 'fail').length,
      skip: results.filter((r) => r.status === 'skip').length,
    },
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nReport written to: ${reportPath}`);
}

async function run(): Promise<void> {
  console.log('Running integration checks...\n');

  const results = await Promise.all(checks.map((check) => check()));

  printAsciiTable(results);

  writeReport(results);

  const hasFailures = results.some((r) => r.status === 'fail');
  if (hasFailures) {
    console.error('\nOne or more checks failed.');
    process.exit(1);
  }

  console.log('\nAll checks passed or were skipped.');
  process.exit(0);
}

run().catch((err: unknown) => {
  console.error('Unexpected error running integration checks:', err);
  process.exit(1);
});
