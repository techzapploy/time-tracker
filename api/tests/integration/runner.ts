import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { check as checkPostgres } from './checks/postgres.js';
import { check as checkRedis } from './checks/redis.js';
import { check as checkDiscord } from './checks/discord.js';
import { check as checkGithub } from './checks/github.js';
import { check as checkLinear } from './checks/linear.js';
import { check as checkRender } from './checks/render.js';
import { check as checkSentry } from './checks/sentry.js';

interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs: number;
}

interface Report {
  runAt: string;
  results: CheckResult[];
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function padEnd(str: string, length: number): string {
  return str.length >= length ? str : str + ' '.repeat(length - str.length);
}

function printTable(results: CheckResult[]): void {
  const nameWidth = Math.max(4, ...results.map((r) => r.name.length)) + 2;
  const statusWidth = 9; // 'SKIPPED' is longest
  const messageWidth = Math.max(7, ...results.map((r) => r.message.length)) + 2;

  const separator = `+${'-'.repeat(nameWidth + 2)}+${'-'.repeat(statusWidth + 2)}+${'-'.repeat(messageWidth + 2)}+`;
  const header = `| ${padEnd('Name', nameWidth)} | ${padEnd('Status', statusWidth)} | ${padEnd('Message', messageWidth)} |`;

  console.log('');
  console.log('Integration Test Results');
  console.log(separator);
  console.log(header);
  console.log(separator);

  for (const result of results) {
    const statusLabel = result.status === 'ok' ? 'OK' : result.status === 'skipped' ? 'SKIPPED' : 'FAILED';
    const row = `| ${padEnd(result.name, nameWidth)} | ${padEnd(statusLabel, statusWidth)} | ${padEnd(result.message, messageWidth)} |`;
    console.log(row);
  }

  console.log(separator);
  console.log('');
}

async function main(): Promise<void> {
  const checkFunctions = [
    checkPostgres,
    checkRedis,
    checkDiscord,
    checkGithub,
    checkLinear,
    checkRender,
    checkSentry,
  ];

  const settled = await Promise.allSettled(
    checkFunctions.map((fn) => withTimeout(fn(), 10_000))
  );

  const results: CheckResult[] = settled.map((outcome, index) => {
    if (outcome.status === 'fulfilled') {
      return outcome.value;
    }
    const message = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
    // Attempt to infer name from the check function index (fallback)
    const names = ['PostgreSQL', 'Redis', 'Discord', 'GitHub', 'Linear', 'Render', 'Sentry'];
    return {
      name: names[index] ?? `Check ${index}`,
      status: 'failed' as const,
      message,
      durationMs: 10_000,
    };
  });

  printTable(results);

  const runAt = new Date().toISOString();
  const report: Report = { runAt, results };

  const outputDir = path.join(process.cwd(), '..', 'DailyIntegrationTestResult');
  fs.mkdirSync(outputDir, { recursive: true });

  const fileName = `report-${runAt.replace(/[:.]/g, '-')}.json`;
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  console.log(`Report saved to: ${filePath}`);

  const hasFailure = results.some((r) => r.status === 'failed');
  process.exit(hasFailure ? 1 : 0);
}

main().catch((err: unknown) => {
  console.error('Unexpected error in runner:', err);
  process.exit(1);
});
