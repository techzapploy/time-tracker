#!/usr/bin/env tsx
/**
 * Integration Test Suite for External Service Connectivity
 *
 * This script verifies that the deployment environment can successfully
 * connect to all required external services:
 * - Discord (webhook/bot)
 * - Render (API)
 * - Linear (API)
 * - NeonDB (PostgreSQL)
 * - GitHub (API)
 *
 * Security: All credentials are sanitized in logs and reports
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  service: string;
  status: 'pass' | 'fail';
  timestamp: string;
  error?: string;
}

/**
 * Sanitizes sensitive credentials from text to prevent leakage
 * Redacts: API keys, tokens, passwords, connection strings
 */
export function sanitizeCredentials(text: string): string {
  return text
    // Render API keys (rnd_...)
    .replace(/rnd_[a-zA-Z0-9_-]+/g, '***REDACTED***')
    // Linear API keys (lin_api_...)
    .replace(/lin_api_[a-zA-Z0-9]+/g, '***REDACTED***')
    // GitHub personal access tokens (ghp_...)
    .replace(/ghp_[a-zA-Z0-9_-]+/g, '***REDACTED***')
    // Discord bot tokens
    .replace(/Bot [a-zA-Z0-9._-]+/g, 'Bot ***REDACTED***')
    // Bearer tokens in general
    .replace(/Bearer [a-zA-Z0-9._-]+/g, 'Bearer ***REDACTED***')
    // PostgreSQL passwords in connection strings
    .replace(/password=[^&\s]+/gi, 'password=***REDACTED***')
    // Credentials in URL format (user:pass@host)
    .replace(/\/\/[^:]+:[^@]+@/g, '//***REDACTED***@')
    // Discord webhook tokens
    .replace(/(webhooks\/\d+\/)([a-zA-Z0-9_-]+)/g, '$1***REDACTED***')
    // Generic API keys and tokens
    .replace(/['\"]?api[_-]?key['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9_-]+['\"]?/gi, 'api_key: ***REDACTED***')
    .replace(/['\"]?token['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9._-]+['\"]?/gi, 'token: ***REDACTED***');
}

/**
 * Creates a fetch request with timeout using AbortController
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Test Discord API connectivity
 * Tests webhook URL by sending a test message
 */
export async function testDiscordAPI(): Promise<TestResult> {
  const result: TestResult = {
    service: 'Discord',
    status: 'fail',
    timestamp: new Date().toISOString(),
  };

  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      result.error = 'DISCORD_WEBHOOK_URL not configured';
      return result;
    }

    const response = await fetchWithTimeout(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '[Integration Test] Discord connectivity check',
        username: 'Integration Test Bot',
      }),
    });

    if (response.ok || response.status === 204) {
      result.status = 'pass';
    } else {
      const errorText = await response.text().catch(() => 'Unable to read response');
      result.error = sanitizeCredentials(
        `HTTP ${response.status}: ${response.statusText} - ${errorText}`
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.error = sanitizeCredentials(`Connection failed: ${errorMessage}`);
  }

  return result;
}

/**
 * Test Render API connectivity
 * Verifies API key by fetching services list
 */
export async function testRenderAPI(): Promise<TestResult> {
  const result: TestResult = {
    service: 'Render',
    status: 'fail',
    timestamp: new Date().toISOString(),
  };

  try {
    const apiKey = process.env.RENDER_API_KEY;

    if (!apiKey) {
      result.error = 'RENDER_API_KEY not configured';
      return result;
    }

    const response = await fetchWithTimeout('https://api.render.com/v1/services', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      result.status = 'pass';
    } else {
      const errorText = await response.text().catch(() => 'Unable to read response');
      result.error = sanitizeCredentials(
        `HTTP ${response.status}: ${response.statusText} - ${errorText}`
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.error = sanitizeCredentials(`Connection failed: ${errorMessage}`);
  }

  return result;
}

/**
 * Test Linear API connectivity
 * Verifies API key by fetching viewer information
 */
export async function testLinearAPI(): Promise<TestResult> {
  const result: TestResult = {
    service: 'Linear',
    status: 'fail',
    timestamp: new Date().toISOString(),
  };

  try {
    const apiKey = process.env.LINEAR_API_KEY;

    if (!apiKey) {
      result.error = 'LINEAR_API_KEY not configured';
      return result;
    }

    const response = await fetchWithTimeout('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ viewer { id name } }',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.viewer) {
        result.status = 'pass';
      } else if (data.errors) {
        result.error = sanitizeCredentials(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      } else {
        result.error = 'Unexpected response format';
      }
    } else {
      const errorText = await response.text().catch(() => 'Unable to read response');
      result.error = sanitizeCredentials(
        `HTTP ${response.status}: ${response.statusText} - ${errorText}`
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.error = sanitizeCredentials(`Connection failed: ${errorMessage}`);
  }

  return result;
}

/**
 * Test NeonDB (PostgreSQL) connectivity
 * Verifies database connection string by executing a simple query
 */
export async function testNeonDB(): Promise<TestResult> {
  const result: TestResult = {
    service: 'NeonDB',
    status: 'fail',
    timestamp: new Date().toISOString(),
  };

  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      result.error = 'DATABASE_URL not configured';
      return result;
    }

    // Dynamic import of postgres to avoid loading if not needed
    const postgres = await import('postgres').catch(() => null);

    if (!postgres) {
      result.error = 'postgres package not available';
      return result;
    }

    const sql = postgres.default(databaseUrl, {
      max: 1,
      idle_timeout: 10,
      connect_timeout: 10,
    });

    try {
      // Execute a simple query to verify connectivity
      const testResult = await sql`SELECT 1 as test`;

      if (testResult && testResult.length > 0 && testResult[0].test === 1) {
        result.status = 'pass';
      } else {
        result.error = 'Query executed but returned unexpected result';
      }
    } finally {
      await sql.end({ timeout: 5 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.error = sanitizeCredentials(`Connection failed: ${errorMessage}`);
  }

  return result;
}

/**
 * Test GitHub API connectivity
 * Verifies personal access token by fetching authenticated user info
 */
export async function testGitHubAPI(): Promise<TestResult> {
  const result: TestResult = {
    service: 'GitHub',
    status: 'fail',
    timestamp: new Date().toISOString(),
  };

  try {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      result.error = 'GITHUB_TOKEN not configured';
      return result;
    }

    const response = await fetchWithTimeout('https://api.github.com/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (response.ok) {
      result.status = 'pass';
    } else {
      const errorText = await response.text().catch(() => 'Unable to read response');
      result.error = sanitizeCredentials(
        `HTTP ${response.status}: ${response.statusText} - ${errorText}`
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.error = sanitizeCredentials(`Connection failed: ${errorMessage}`);
  }

  return result;
}

/**
 * Generates a markdown report from test results
 */
function generateMarkdownReport(results: TestResult[]): string {
  const date = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  let markdown = `# Integration Test Report - ${date}\n\n`;
  markdown += `**Generated:** ${timestamp}\n\n`;
  markdown += `## Service Connectivity Status\n\n`;
  markdown += `| Service | Status | Timestamp | Error |\n`;
  markdown += `|---------|--------|-----------|-------|\n`;

  for (const result of results) {
    const statusIcon = result.status === 'pass' ? '✅ Pass' : '❌ Fail';
    const error = result.error ? sanitizeCredentials(result.error) : '-';
    markdown += `| ${result.service} | ${statusIcon} | ${result.timestamp} | ${error} |\n`;
  }

  const passCount = results.filter(r => r.status === 'pass').length;
  const totalCount = results.length;
  const failCount = totalCount - passCount;

  markdown += `\n## Summary\n\n`;
  markdown += `- **Total Services:** ${totalCount}\n`;
  markdown += `- **Passed:** ${passCount}\n`;
  markdown += `- **Failed:** ${failCount}\n`;

  if (failCount > 0) {
    markdown += `\n⚠️ **Action Required:** ${failCount} service(s) failed connectivity test.\n`;
  } else {
    markdown += `\n✅ **All services are operational.**\n`;
  }

  return markdown;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Integration Tests...\n');

  // Run all tests
  const results: TestResult[] = [];

  console.log('Testing Discord API...');
  results.push(await testDiscordAPI());

  console.log('Testing Render API...');
  results.push(await testRenderAPI());

  console.log('Testing Linear API...');
  results.push(await testLinearAPI());

  console.log('Testing NeonDB...');
  results.push(await testNeonDB());

  console.log('Testing GitHub API...');
  results.push(await testGitHubAPI());

  console.log('\n📊 Test Results:');
  console.log('================\n');

  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${result.service}: ${result.status.toUpperCase()}`);
    if (result.error) {
      console.log(`   Error: ${sanitizeCredentials(result.error)}`);
    }
  }

  // Generate report
  const date = new Date().toISOString().split('T')[0];
  // Always use workspace root for consistency, regardless of where script is run from
  const workspaceRoot = process.cwd().includes('/api')
    ? path.join(process.cwd(), '..')
    : process.cwd();
  const reportDir = path.join(workspaceRoot, 'DailyIntegrationTestResult');
  const reportPath = path.join(reportDir, `Integration-Status-${date}.md`);

  // Ensure directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const markdown = generateMarkdownReport(results);
  fs.writeFileSync(reportPath, markdown, 'utf-8');

  console.log(`\n📝 Report generated: ${reportPath}\n`);

  // Determine exit code
  const failedTests = results.filter(r => r.status === 'fail');
  if (failedTests.length > 0) {
    console.log(`❌ ${failedTests.length} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
    process.exit(0);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', sanitizeCredentials(error.message));
    process.exit(1);
  });
}
