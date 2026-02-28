import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkRender } from './checks/render.js';
import { checkLinear } from './checks/linear.js';
import { checkGitHub } from './checks/github.js';
import { checkSentry } from './checks/sentry.js';
import type { CheckResult } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = path.resolve(__dirname, '../../../DailyIntegrationTestResult');

async function main(): Promise<void> {
  const settled = await Promise.allSettled([
    checkPostgres(),
    checkRedis(),
    checkDiscord(),
    checkRender(),
    checkLinear(),
    checkGitHub(),
    checkSentry(),
  ]);

  const results: CheckResult[] = settled.map((r) => {
    if (r.status === 'fulfilled') return r.value;
    return { service: 'Unknown', status: 'fail', message: String(r.reason), durationMs: 0 };
  });

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const timestamp = new Date().toISOString();
  const dateStr = timestamp.slice(0, 10);

  // Print summary table
  console.log('\nIntegration Test Results');
  console.log('========================');
  const colWidths = [12, 6, 50, 12];
  console.log(
    'Service'.padEnd(colWidths[0]) +
    'Status'.padEnd(colWidths[1]) +
    'Message'.padEnd(colWidths[2]) +
    'Duration(ms)'
  );
  console.log('-'.repeat(colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]));
  for (const r of results) {
    console.log(
      r.service.padEnd(colWidths[0]) +
      r.status.padEnd(colWidths[1]) +
      r.message.slice(0, 49).padEnd(colWidths[2]) +
      String(r.durationMs)
    );
  }
  console.log('-'.repeat(colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]));
  console.log(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  // Write JSON report
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, `${dateStr}.json`);
  const report = { results, summary: { total: results.length, passed, failed, timestamp } };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to: ${reportPath}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
