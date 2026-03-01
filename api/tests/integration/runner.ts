import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ServiceCheckResult } from './checks/types.js';
import { checkPostgres } from './checks/postgres.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkGitHub } from './checks/github.js';
import { checkLinear } from './checks/linear.js';
import { checkRender } from './checks/render.js';
import { checkSentry } from './checks/sentry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function formatResult(result: ServiceCheckResult): string {
  const statusLabel = result.status === 'pass' ? '[PASS]' : result.status === 'fail' ? '[FAIL]' : '[SKIP]';
  return `${statusLabel} ${result.service}: ${result.message}`;
}

async function main() {
  console.log('Running integration tests...\n');

  const results = await Promise.all([
    checkPostgres(),
    checkRedis(),
    checkDiscord(),
    checkGitHub(),
    checkLinear(),
    checkRender(),
    checkSentry(),
  ]);

  results.forEach(result => console.log(formatResult(result)));

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;

  console.log(`\nSummary: ${passed} passed, ${failed} failed, ${skipped} skipped`);

  // Save report
  const reportDir = path.resolve(__dirname, '../../../DailyIntegrationTestResult');
  fs.mkdirSync(reportDir, { recursive: true });
  const date = new Date().toISOString().split('T')[0];
  const reportPath = path.join(reportDir, `integration-results-${date}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({ date: new Date().toISOString(), results }, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
