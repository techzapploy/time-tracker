import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load .env from api directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../../.env') });

import checkPostgres from './checks/postgres.js';
import checkRedis from './checks/redis.js';
import checkDiscord from './checks/discord.js';
import checkGitHub from './checks/github.js';
import checkLinear from './checks/linear.js';
import checkRender from './checks/render.js';
import checkSentry from './checks/sentry.js';

interface CheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs?: number;
}

const TIMEOUT_MS = 5000;

function withTimeout(
  promise: Promise<CheckResult>,
  service: string
): Promise<CheckResult> {
  const timeoutPromise: Promise<CheckResult> = new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          service,
          status: 'fail',
          message: `Timed out after ${TIMEOUT_MS}ms`,
          durationMs: TIMEOUT_MS,
        }),
      TIMEOUT_MS
    )
  );
  return Promise.race([promise, timeoutPromise]);
}

async function main() {
  console.log('Running integration checks...\n');

  const checks: Array<() => Promise<CheckResult>> = [
    checkPostgres,
    checkRedis,
    checkDiscord,
    checkGitHub,
    checkLinear,
    checkRender,
    checkSentry,
  ];

  const results = await Promise.all(
    checks.map((check) => withTimeout(check(), check.name || 'unknown'))
  );

  // Print summary
  console.log('Results:');
  for (const result of results) {
    const icon =
      result.status === 'pass' ? 'PASS' : result.status === 'skip' ? 'SKIP' : 'FAIL';
    const duration =
      result.durationMs !== undefined ? ` (${result.durationMs}ms)` : '';
    console.log(`  [${icon}] ${result.service}: ${result.message}${duration}`);
  }

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skip').length;

  console.log(`\nSummary: ${passed} passed, ${failed} failed, ${skipped} skipped`);

  // Write JSON report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = '/workspace/DailyIntegrationTestResult';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const reportPath = path.join(outputDir, `report-${timestamp}.json`);
  const report = {
    timestamp: new Date().toISOString(),
    summary: { passed, failed, skipped, total: results.length },
    results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to: ${reportPath}`);

  // Exit with code 1 if any non-skipped check failed
  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Runner failed:', err);
  process.exit(1);
});
