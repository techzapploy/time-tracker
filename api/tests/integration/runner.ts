import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env unless in production
if (process.env['NODE_ENV'] !== 'production') {
  const { config } = await import('dotenv');
  config({ path: new URL('../../.env', import.meta.url).pathname });
}

import { checkDatabase } from './checks/database.js';
import { checkRedis } from './checks/redis.js';
import { checkDiscord } from './checks/discord.js';
import { checkRender } from './checks/render.js';
import { checkLinear } from './checks/linear.js';
import { checkGitHub } from './checks/github.js';
import { checkSentry } from './checks/sentry.js';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'skipped';
  message: string;
  durationMs: number;
}

interface Report {
  timestamp: string;
  results: CheckResult[];
  allPassed: boolean;
}

function statusIcon(status: CheckResult['status']): string {
  switch (status) {
    case 'pass': return '✓';
    case 'fail': return '✗';
    case 'skipped': return '–';
  }
}

function printSummary(results: CheckResult[]): void {
  console.log('\n=== Integration Test Results ===\n');
  for (const r of results) {
    const icon = statusIcon(r.status);
    const padded = r.name.padEnd(12);
    console.log(`  ${icon} ${padded} [${r.status.toUpperCase()}] ${r.message} (${r.durationMs}ms)`);
  }
  console.log('');
}

async function run(): Promise<void> {
  console.log('Running integration checks...\n');

  const results: CheckResult[] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkDiscord(),
    checkRender(),
    checkLinear(),
    checkGitHub(),
    checkSentry(),
  ]);

  printSummary(results);

  const allPassed = results.every(r => r.status !== 'fail');

  const report: Report = {
    timestamp: new Date().toISOString(),
    results,
    allPassed,
  };

  // Write report to DailyIntegrationTestResult/ at repo root
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const repoRoot = join(__dirname, '..', '..', '..');
  const outputDir = join(repoRoot, 'DailyIntegrationTestResult');

  try {
    mkdirSync(outputDir, { recursive: true });
    const reportPath = join(outputDir, `report-${report.timestamp.replace(/[:.]/g, '-')}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`Report written to: ${reportPath}`);
  } catch (err) {
    console.error('Warning: failed to write report:', err instanceof Error ? err.message : String(err));
  }

  if (allPassed) {
    console.log('\nAll checks passed (or skipped).\n');
    process.exit(0);
  } else {
    const failed = results.filter(r => r.status === 'fail').map(r => r.name).join(', ');
    console.log(`\nFailed checks: ${failed}\n`);
    process.exit(1);
  }
}

await run();
