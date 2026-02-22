import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFile, mkdir } from 'fs/promises';

import { checkDatabase } from './checks/database.ts';
import { checkRedis } from './checks/redis.ts';
import { checkDiscord } from './checks/discord.ts';
import { checkRender } from './checks/render.ts';
import { checkLinear } from './checks/linear.ts';
import { checkGitHub } from './checks/github.ts';
import { checkSentry } from './checks/sentry.ts';
import { generateReport, type ServiceResult } from './utils/report.ts';
import { sanitize } from './utils/sanitize.ts';

// Load .env from api/ directory
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../../api/.env') });

async function main() {
  console.log('Running integration checks...\n');

  const results = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkDiscord(),
    checkRender(),
    checkLinear(),
    checkGitHub(),
    checkSentry(),
  ]);

  const serviceResults: ServiceResult[] = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    const names = ['PostgreSQL', 'Redis', 'Discord', 'Render', 'Linear', 'GitHub', 'Sentry'];
    return { name: names[i], status: 'DOWN' as const, error: sanitize(String(r.reason)) };
  });

  // Print results to console
  for (const result of serviceResults) {
    const icon = result.status === 'UP' ? '✓' : result.status === 'SKIPPED' ? '-' : '✗';
    const latency = result.latency !== undefined ? ` (${result.latency}ms)` : '';
    const detail = result.error ?? result.details ?? '';
    console.log(`  ${icon} ${result.name}: ${result.status}${latency}${detail ? ' — ' + detail : ''}`);
  }

  // Generate and save report
  const now = new Date();
  const report = generateReport(serviceResults, now);
  const dateStr = now.toISOString().split('T')[0];
  const reportDir = join(__dirname, '../../DailyIntegrationTestResult');
  const reportPath = join(reportDir, `Integration-Status-${dateStr}.md`);

  await mkdir(reportDir, { recursive: true });
  await writeFile(reportPath, report, 'utf-8');
  console.log(`\nReport saved: ${reportPath}`);

  const hasFailures = serviceResults.some(r => r.status === 'DOWN');
  if (hasFailures) {
    console.error('\nOne or more services are DOWN.');
    process.exit(1);
  }
  console.log('\nAll configured services are UP or SKIPPED.');
}

main().catch(err => {
  console.error('Fatal error:', sanitize(String(err)));
  process.exit(1);
});
