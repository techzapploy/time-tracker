#!/usr/bin/env tsx
/**
 * Integration Test Runner
 *
 * Runs all integration checks in parallel with strict 5-second timeouts.
 * Skips checks gracefully if required environment variables are missing.
 * Outputs results as JSON to DailyIntegrationTestResult/ directory.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type CheckStatus = 'passed' | 'failed' | 'skipped';

export interface CheckResult {
  name: string;
  status: CheckStatus;
  message: string;
  durationMs: number;
  error?: string;
}

export interface IntegrationTestReport {
  timestamp: string;
  date: string;
  totalChecks: number;
  passed: number;
  failed: number;
  skipped: number;
  results: CheckResult[];
}

const TIMEOUT_MS = 5000;

/**
 * Runs a single check with a timeout.
 */
async function runCheck(
  name: string,
  fn: () => Promise<CheckResult>,
): Promise<CheckResult> {
  const start = Date.now();

  const timeoutPromise = new Promise<CheckResult>((resolve) => {
    setTimeout(() => {
      resolve({
        name,
        status: 'failed',
        message: `Check timed out after ${TIMEOUT_MS}ms`,
        durationMs: TIMEOUT_MS,
        error: 'TIMEOUT',
      });
    }, TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([fn(), timeoutPromise]);
    return {
      ...result,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      status: 'failed',
      message: 'Check threw an unexpected error',
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Main runner: imports all checks and runs them in parallel.
 */
async function main() {
  console.log('Starting integration tests...\n');

  // Dynamically import all check modules
  const { checkPostgres } = await import('./checks/postgres.js');
  const { checkRedis } = await import('./checks/redis.js');
  const { checkDiscord } = await import('./checks/discord.js');
  const { checkGitHub } = await import('./checks/github.js');
  const { checkLinear } = await import('./checks/linear.js');
  const { checkRender } = await import('./checks/render.js');
  const { checkSentry } = await import('./checks/sentry.js');

  const checks = [
    { name: 'PostgreSQL', fn: checkPostgres },
    { name: 'Redis', fn: checkRedis },
    { name: 'Discord', fn: checkDiscord },
    { name: 'GitHub', fn: checkGitHub },
    { name: 'Linear', fn: checkLinear },
    { name: 'Render', fn: checkRender },
    { name: 'Sentry', fn: checkSentry },
  ];

  // Run all checks in parallel
  const results = await Promise.all(
    checks.map(({ name, fn }) => runCheck(name, fn)),
  );

  // Print results to console
  for (const result of results) {
    const icon =
      result.status === 'passed'
        ? 'PASS'
        : result.status === 'skipped'
          ? 'SKIP'
          : 'FAIL';
    console.log(`[${icon}] ${result.name}: ${result.message} (${result.durationMs}ms)`);
    if (result.error && result.status === 'failed') {
      console.log(`       Error: ${result.error}`);
    }
  }

  const passed = results.filter((r) => r.status === 'passed').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  console.log(
    `\nResults: ${passed} passed, ${failed} failed, ${skipped} skipped out of ${results.length} checks`,
  );

  // Generate report
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const report: IntegrationTestReport = {
    timestamp: now.toISOString(),
    date: dateStr,
    totalChecks: results.length,
    passed,
    failed,
    skipped,
    results,
  };

  // Write JSON report to DailyIntegrationTestResult/
  const reportDir = join(__dirname, '..', '..', '..', 'DailyIntegrationTestResult');
  mkdirSync(reportDir, { recursive: true });
  const reportPath = join(reportDir, `${dateStr}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to: ${reportPath}`);

  // Exit with non-zero if any checks failed
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Runner failed:', err);
  process.exit(1);
});
