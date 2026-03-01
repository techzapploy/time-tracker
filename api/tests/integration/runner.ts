import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkGitHub } from './checks/github.js';
import { checkLinear } from './checks/linear.js';
import { checkRender } from './checks/render.js';
import { checkSentry } from './checks/sentry.js';
import { type ServiceCheckResult } from './checks/types.js';

const REPORT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../DailyIntegrationTestResult',
);

function formatResult(result: ServiceCheckResult): string {
  const icon = result.status === 'pass' ? '[PASS]' : result.status === 'fail' ? '[FAIL]' : '[SKIP]';
  return `${icon} ${result.service.padEnd(12)} ${result.message}`;
}

async function main(): Promise<void> {
  console.log('Running infrastructure integration checks...\n');

  const results = await Promise.all([
    checkPostgres(),
    checkRedis(),
    checkDiscord(),
    checkGitHub(),
    checkLinear(),
    checkRender(),
    checkSentry(),
  ]);

  // Print results
  for (const result of results) {
    console.log(formatResult(result));
  }

  // Summary counts
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skip').length;

  console.log(`\nSummary: ${passed} passed, ${failed} failed, ${skipped} skipped`);

  // Save JSON report
  try {
    mkdirSync(REPORT_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(REPORT_DIR, `report-${timestamp}.json`);
    const report = {
      timestamp: new Date().toISOString(),
      summary: { passed, failed, skipped },
      results,
    };
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nReport saved to: ${reportPath}`);
  } catch (err) {
    console.error('Failed to save report:', err instanceof Error ? err.message : String(err));
  }

  // Exit with failure if any check failed
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error('Runner encountered an unexpected error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
