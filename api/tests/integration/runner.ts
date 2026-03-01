import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkGitHub } from './checks/github.js';
import { checkLinear } from './checks/linear.js';
import { checkRender } from './checks/render.js';
import { checkSentry } from './checks/sentry.js';
import type { ServiceCheckResult } from './checks/types.js';

async function main() {
  const results: ServiceCheckResult[] = await Promise.all([
    checkPostgres(),
    checkRedis(),
    checkDiscord(),
    checkGitHub(),
    checkLinear(),
    checkRender(),
    checkSentry(),
  ]);

  let failCount = 0;
  for (const result of results) {
    const prefix = result.status === 'pass' ? '[PASS]' : result.status === 'fail' ? '[FAIL]' : '[SKIP]';
    console.log(`${prefix} ${result.service}: ${result.message}`);
    if (result.status === 'fail') failCount++;
  }

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;

  const date = new Date().toISOString().split('T')[0];
  const report = {
    date,
    summary: { total: results.length, passed, failed, skipped },
    results,
  };

  const reportDir = join(process.cwd(), '..', 'DailyIntegrationTestResult');
  mkdirSync(reportDir, { recursive: true });
  const reportPath = join(reportDir, `integration-results-${date}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);
  console.log(`Summary: ${passed} passed, ${failed} failed, ${skipped} skipped`);

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Runner crashed:', err);
  process.exit(1);
});
