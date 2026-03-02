import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgresCheck from './checks/postgres.js';
import redisCheck from './checks/redis.js';
import discordCheck from './checks/discord.js';
import githubCheck from './checks/github.js';
import linearCheck from './checks/linear.js';
import renderCheck from './checks/render.js';
import sentryCheck from './checks/sentry.js';

export interface CheckResult {
  service: string;
  status: 'passed' | 'failed' | 'skipped';
  message: string;
}

const TIMEOUT_MS = 10000;

async function runWithTimeout(checkFn: () => Promise<CheckResult>): Promise<CheckResult> {
  const timeoutPromise = new Promise<CheckResult>((resolve) =>
    setTimeout(() => resolve({ service: 'unknown', status: 'failed', message: `Timed out after ${TIMEOUT_MS}ms` }), TIMEOUT_MS)
  );
  return Promise.race([checkFn(), timeoutPromise]);
}

async function main() {
  const checks = [
    postgresCheck,
    redisCheck,
    discordCheck,
    githubCheck,
    linearCheck,
    renderCheck,
    sentryCheck,
  ];

  const results: CheckResult[] = [];
  for (const check of checks) {
    const result = await runWithTimeout(check);
    results.push(result);
  }

  // Print results table
  console.log('\nIntegration Test Results');
  console.log('========================');
  console.log('Service'.padEnd(20) + 'Status'.padEnd(12) + 'Message');
  console.log('-'.repeat(70));
  for (const r of results) {
    console.log(r.service.padEnd(20) + r.status.padEnd(12) + r.message);
  }
  console.log('');

  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;

  console.log(`Summary: ${passed} passed, ${failed} failed, ${skipped} skipped`);

  const report = {
    timestamp: new Date().toISOString(),
    passed,
    failed,
    skipped,
    results,
  };

  // Write JSON report
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const reportDir = path.resolve(__dirname, '../../DailyIntegrationTestResult');
  fs.mkdirSync(reportDir, { recursive: true });
  const dateStr = new Date().toISOString().split('T')[0];
  const reportPath = path.join(reportDir, `${dateStr}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to: ${reportPath}`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Runner failed:', err);
  process.exit(1);
});
