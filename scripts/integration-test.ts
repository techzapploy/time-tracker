#!/usr/bin/env tsx

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import postgres from 'postgres';

interface TestResult {
  service: string;
  success: boolean;
  error?: string;
}

// Sanitize sensitive data from strings
function sanitize(text: string): string {
  if (!text) return text;

  // Replace common token patterns with [REDACTED]
  return text
    .replace(/(?:token|key|password|secret|authorization|bearer)\s*[=:]\s*['"]?[\w\-._~+/]+=*['"]?/gi, '[REDACTED]')
    .replace(/ghp_[a-zA-Z0-9]{36}/g, '[REDACTED]')
    .replace(/gho_[a-zA-Z0-9]{36}/g, '[REDACTED]')
    .replace(/Bot\s+[\w\-._]+/gi, 'Bot [REDACTED]')
    .replace(/Bearer\s+[\w\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    .replace(/postgres:\/\/[^:]+:[^@]+@/g, 'postgres://[REDACTED]:[REDACTED]@');
}

// Test GitHub API connectivity
async function testGitHub(): Promise<TestResult> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return {
      service: 'GitHub',
      success: false,
      error: 'GITHUB_TOKEN environment variable not set'
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Integration-Test'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return { service: 'GitHub', success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service: 'GitHub',
      success: false,
      error: sanitize(errorMessage)
    };
  }
}

// Test Discord API connectivity
async function testDiscord(): Promise<TestResult> {
  const token = process.env.DISCORD_TOKEN;

  if (!token) {
    return {
      service: 'Discord',
      success: false,
      error: 'DISCORD_TOKEN environment variable not set'
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bot ${token}`,
        'User-Agent': 'Integration-Test'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return { service: 'Discord', success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service: 'Discord',
      success: false,
      error: sanitize(errorMessage)
    };
  }
}

// Test Render API connectivity
async function testRender(): Promise<TestResult> {
  const token = process.env.RENDER_TOKEN;

  if (!token) {
    return {
      service: 'Render',
      success: false,
      error: 'RENDER_TOKEN environment variable not set'
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.render.com/v1/owners', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Integration-Test'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return { service: 'Render', success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service: 'Render',
      success: false,
      error: sanitize(errorMessage)
    };
  }
}

// Test Linear API connectivity
async function testLinear(): Promise<TestResult> {
  const token = process.env.LINEAR_TOKEN;

  if (!token) {
    return {
      service: 'Linear',
      success: false,
      error: 'LINEAR_TOKEN environment variable not set'
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'User-Agent': 'Integration-Test'
      },
      body: JSON.stringify({
        query: '{ viewer { id } }'
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return { service: 'Linear', success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service: 'Linear',
      success: false,
      error: sanitize(errorMessage)
    };
  }
}

// Test NeonDB connectivity
async function testNeonDB(): Promise<TestResult> {
  const dbUrl = process.env.NEON_DB_URL;

  if (!dbUrl) {
    return {
      service: 'NeonDB',
      success: false,
      error: 'NEON_DB_URL environment variable not set'
    };
  }

  let sql: ReturnType<typeof postgres> | null = null;

  try {
    sql = postgres(dbUrl, {
      connect_timeout: 10,
      idle_timeout: 1,
      max_lifetime: 5
    });

    // Simple connectivity test
    await sql`SELECT 1`;

    return { service: 'NeonDB', success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service: 'NeonDB',
      success: false,
      error: sanitize(errorMessage)
    };
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

// Generate markdown report
function generateReport(results: TestResult[]): string {
  const timestamp = new Date().toISOString();
  const date = new Date().toISOString().split('T')[0];

  let report = `# Integration Test Report - ${date}\n\n`;
  report += `**Generated at**: ${timestamp}\n\n`;
  report += `## Service Status\n\n`;

  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    report += `### ${result.service}: ${status}\n\n`;

    if (result.error) {
      report += `**Error**: ${result.error}\n\n`;
    }
  }

  const passCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  report += `## Summary\n\n`;
  report += `- **Total Services**: ${totalCount}\n`;
  report += `- **Passed**: ${passCount}\n`;
  report += `- **Failed**: ${totalCount - passCount}\n`;

  return report;
}

// Main execution
async function main(): Promise<void> {
  console.log('Starting integration tests...\n');

  // Run all tests in parallel
  const results = await Promise.all([
    testGitHub(),
    testDiscord(),
    testRender(),
    testLinear(),
    testNeonDB()
  ]);

  // Display results
  console.log('Test Results:');
  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${result.service}: ${status}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  }

  // Generate and save report
  const report = generateReport(results);
  const date = new Date().toISOString().split('T')[0];
  const reportDir = join(process.cwd(), 'DailyIntegrationTestResult');
  const reportPath = join(reportDir, `Integration-Status-${date}.md`);

  try {
    await mkdir(reportDir, { recursive: true });
    await writeFile(reportPath, report, 'utf-8');
    console.log(`\nReport saved to: ${reportPath}`);
  } catch (error) {
    console.error('Failed to save report:', sanitize(String(error)));
    process.exit(1);
  }

  // Exit with appropriate code
  const allPassed = results.every(r => r.success);
  if (!allPassed) {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }

  console.log('\n✅ All tests passed');
  process.exit(0);
}

main().catch(error => {
  console.error('Unexpected error:', sanitize(String(error)));
  process.exit(1);
});
