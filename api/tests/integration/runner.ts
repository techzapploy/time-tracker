import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env for local development
if (process.env.NODE_ENV !== 'production') {
  const dotenvPath = join(__dirname, '..', '..', '..', '.env');
  try {
    const { config } = await import('dotenv');
    config({ path: dotenvPath });
  } catch {
    // dotenv not available or .env not found — continue with existing env
  }
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

// Print summary table
console.log('\n=== Integration Test Results ===\n');
for (const r of results) {
  const icon = r.status === 'pass' ? '✓' : r.status === 'skipped' ? '–' : '✗';
  console.log(`  ${icon} ${r.name.padEnd(12)} [${r.status.toUpperCase().padEnd(7)}] ${r.message} (${r.durationMs}ms)`);
}
console.log('');

// Write JSON report
const allPassed = results.every(r => r.status !== 'fail');
const report = {
  timestamp: new Date().toISOString(),
  results,
  allPassed,
};

const repoRoot = join(__dirname, '..', '..', '..');
const reportDir = join(repoRoot, 'DailyIntegrationTestResult');
try {
  mkdirSync(reportDir, { recursive: true });
  const filename = `report-${report.timestamp.replace(/[:.]/g, '-')}.json`;
  writeFileSync(join(reportDir, filename), JSON.stringify(report, null, 2));
  console.log(`Report written to DailyIntegrationTestResult/${filename}`);
} catch (err) {
  console.warn('Warning: could not write report file:', err instanceof Error ? err.message : String(err));
}

process.exit(allPassed ? 0 : 1);
