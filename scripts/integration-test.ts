import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import postgres from 'postgres';

interface ServiceCheck {
  name: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  expectedStatus?: number;
  body?: string;
}

interface ServiceResult {
  name: string;
  success: boolean;
  error?: string;
  duration?: number;
}

/**
 * Sanitize credentials from text to prevent leaking secrets
 */
function sanitizeCredentials(text: string): string {
  let sanitized = text;

  // Redact Bearer tokens
  sanitized = sanitized.replace(/(Bearer\s+)[^\s]+/gi, '$1[REDACTED]');

  // Redact query string tokens
  sanitized = sanitized.replace(/([?&]token=)[^&\s]+/gi, '$1[REDACTED]');

  // Redact postgres connection strings
  sanitized = sanitized.replace(/(postgres:\/\/[^:]+:)[^@]+/gi, '$1[REDACTED]');

  // Redact Authorization headers
  sanitized = sanitized.replace(/(Authorization:\s*)[^\s,}]+/gi, '$1[REDACTED]');

  // Redact webhook URLs with tokens
  sanitized = sanitized.replace(/(https:\/\/discord\.com\/api\/webhooks\/\d+\/)[^\s"']+/gi, '$1[REDACTED]');

  return sanitized;
}

/**
 * Check a service with timeout
 */
async function checkService(config: ServiceCheck): Promise<ServiceResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    const expectedStatus = config.expectedStatus ?? 200;
    const success = response.status === expectedStatus || (response.status >= 200 && response.status < 300);

    if (!success) {
      return {
        name: config.name,
        success: false,
        error: `Unexpected status code: ${response.status}`,
        duration,
      };
    }

    return {
      name: config.name,
      success: true,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    let errorMessage = 'Unknown error';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout (>10s)';
      } else {
        errorMessage = sanitizeCredentials(error.message);
      }
    }

    return {
      name: config.name,
      success: false,
      error: errorMessage,
      duration,
    };
  }
}

/**
 * Check NeonDB connection
 */
async function checkNeonDB(): Promise<ServiceResult> {
  const startTime = Date.now();

  if (!process.env.DATABASE_URL) {
    return {
      name: 'NeonDB',
      success: false,
      error: 'DATABASE_URL not configured',
    };
  }

  let sql: postgres.Sql | null = null;

  try {
    sql = postgres(process.env.DATABASE_URL, {
      max: 1,
      idle_timeout: 10,
      connect_timeout: 10,
    });

    await sql`SELECT 1`;
    const duration = Date.now() - startTime;

    return {
      name: 'NeonDB',
      success: true,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    let errorMessage = 'Unknown error';

    if (error instanceof Error) {
      errorMessage = sanitizeCredentials(error.message);
    }

    return {
      name: 'NeonDB',
      success: false,
      error: errorMessage,
      duration,
    };
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

/**
 * Generate markdown report from results
 */
function generateMarkdownReport(results: ServiceResult[], timestamp: string): string {
  const lines: string[] = [];

  lines.push(`# Integration Test Report`);
  lines.push(`**Date:** ${timestamp}`);
  lines.push('');
  lines.push('## Service Status');
  lines.push('');

  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    const duration = result.duration !== undefined ? ` (${result.duration}ms)` : '';
    lines.push(`### ${status} ${result.name}${duration}`);

    if (result.error) {
      lines.push(`**Error:** ${result.error}`);
    }

    lines.push('');
  }

  const totalServices = results.length;
  const successfulServices = results.filter(r => r.success).length;
  const failedServices = totalServices - successfulServices;

  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Total Services:** ${totalServices}`);
  lines.push(`- **Successful:** ${successfulServices}`);
  lines.push(`- **Failed:** ${failedServices}`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Save report to file
 */
async function saveReport(content: string): Promise<void> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const dirPath = path.join(process.cwd(), 'DailyIntegrationTestResult');
  const filePath = path.join(dirPath, `Integration-Status-${dateStr}.md`);

  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');

  console.log(`Report saved to: ${filePath}`);
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('Starting integration tests...\n');

  const results: ServiceResult[] = [];
  const timestamp = new Date().toISOString();

  // Discord check
  if (process.env.DISCORD_WEBHOOK_URL) {
    console.log('Testing Discord (webhook)...');
    const result = await checkService({
      name: 'Discord',
      url: process.env.DISCORD_WEBHOOK_URL,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Integration test from time tracker app' }),
      expectedStatus: 204,
    });
    results.push(result);
    console.log(`Discord: ${result.success ? 'OK' : 'FAILED'}\n`);
  } else if (process.env.DISCORD_TOKEN) {
    console.log('Testing Discord (API)...');
    const result = await checkService({
      name: 'Discord',
      url: 'https://discord.com/api/v10/users/@me',
      method: 'GET',
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
    });
    results.push(result);
    console.log(`Discord: ${result.success ? 'OK' : 'FAILED'}\n`);
  } else {
    console.log('Discord: SKIPPED (no credentials)\n');
    results.push({
      name: 'Discord',
      success: false,
      error: 'No DISCORD_WEBHOOK_URL or DISCORD_TOKEN configured',
    });
  }

  // Render check
  if (process.env.RENDER_API_KEY) {
    console.log('Testing Render...');
    const result = await checkService({
      name: 'Render',
      url: 'https://api.render.com/v1/services',
      method: 'GET',
      headers: { Authorization: `Bearer ${process.env.RENDER_API_KEY}` },
    });
    results.push(result);
    console.log(`Render: ${result.success ? 'OK' : 'FAILED'}\n`);
  } else {
    console.log('Render: SKIPPED (no credentials)\n');
    results.push({
      name: 'Render',
      success: false,
      error: 'RENDER_API_KEY not configured',
    });
  }

  // Linear check
  if (process.env.LINEAR_API_KEY) {
    console.log('Testing Linear...');
    const result = await checkService({
      name: 'Linear',
      url: 'https://api.linear.app/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.LINEAR_API_KEY,
      },
      body: JSON.stringify({ query: '{ viewer { id name } }' }),
    });
    results.push(result);
    console.log(`Linear: ${result.success ? 'OK' : 'FAILED'}\n`);
  } else {
    console.log('Linear: SKIPPED (no credentials)\n');
    results.push({
      name: 'Linear',
      success: false,
      error: 'LINEAR_API_KEY not configured',
    });
  }

  // NeonDB check
  console.log('Testing NeonDB...');
  const neonResult = await checkNeonDB();
  results.push(neonResult);
  console.log(`NeonDB: ${neonResult.success ? 'OK' : 'FAILED'}\n`);

  // GitHub check
  if (process.env.GITHUB_TOKEN) {
    console.log('Testing GitHub...');
    const result = await checkService({
      name: 'GitHub',
      url: 'https://api.github.com/user',
      method: 'GET',
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
    });
    results.push(result);
    console.log(`GitHub: ${result.success ? 'OK' : 'FAILED'}\n`);
  } else {
    console.log('GitHub: SKIPPED (no credentials)\n');
    results.push({
      name: 'GitHub',
      success: false,
      error: 'GITHUB_TOKEN not configured',
    });
  }

  // Generate and save report
  const report = generateMarkdownReport(results, timestamp);
  await saveReport(report);

  // Print summary
  const failedCount = results.filter(r => !r.success).length;
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total: ${results.length}, Success: ${results.length - failedCount}, Failed: ${failedCount}`);

  // Exit with appropriate code
  if (failedCount > 0) {
    console.log('\n⚠️  Some integration tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All integration tests passed');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', sanitizeCredentials(error.message));
  process.exit(1);
});
