#!/usr/bin/env tsx

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * Integration Test Result Interface
 */
interface IntegrationTestResult {
  service: string;
  status: 'pass' | 'fail';
  responseTime: number;
  error?: string;
}

/**
 * Sanitize credentials from strings
 * Replaces tokens, keys, and passwords with [REDACTED]
 */
function sanitizeCredentials(text: string): string {
  if (!text) return text;

  const env = process.env;
  const sensitiveValues = [
    env.GITHUB_TOKEN,
    env.DISCORD_WEBHOOK_URL,
    env.RENDER_API_KEY,
    env.LINEAR_API_KEY,
    env.DATABASE_URL,
  ].filter(Boolean);

  let sanitized = text;
  for (const value of sensitiveValues) {
    if (value) {
      // Replace the actual value with [REDACTED]
      sanitized = sanitized.split(value).join('[REDACTED]');
    }
  }

  // Also sanitize common patterns
  sanitized = sanitized.replace(
    /Bearer\s+[A-Za-z0-9_-]+/gi,
    'Bearer [REDACTED]'
  );
  sanitized = sanitized.replace(
    /postgresql:\/\/[^@]+@[^/]+\/[^\s"')]+/gi,
    'postgresql://[REDACTED]'
  );
  sanitized = sanitized.replace(
    /https:\/\/discord\.com\/api\/webhooks\/[^\s"')]+/gi,
    'https://discord.com/api/webhooks/[REDACTED]'
  );

  return sanitized;
}

/**
 * Test GitHub API connectivity
 */
async function testGitHub(): Promise<IntegrationTestResult> {
  const startTime = Date.now();
  const service = 'GitHub';

  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return {
        service,
        status: 'fail',
        responseTime: Date.now() - startTime,
        error: 'GITHUB_TOKEN not configured',
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Integration-Test-Script',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        service,
        status: 'fail',
        responseTime: Date.now() - startTime,
        error: sanitizeCredentials(`HTTP ${response.status}: ${response.statusText}`),
      };
    }

    return {
      service,
      status: 'pass',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'fail',
      responseTime: Date.now() - startTime,
      error: sanitizeCredentials(errorMessage),
    };
  }
}

/**
 * Test Discord webhook connectivity
 */
async function testDiscord(): Promise<IntegrationTestResult> {
  const startTime = Date.now();
  const service = 'Discord';

  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return {
        service,
        status: 'fail',
        responseTime: Date.now() - startTime,
        error: 'DISCORD_WEBHOOK_URL not configured',
      };
    }

    // Validate URL format
    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      return {
        service,
        status: 'fail',
        responseTime: Date.now() - startTime,
        error: 'Invalid Discord webhook URL format',
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Test with a simple GET request to validate webhook exists
    const response = await fetch(webhookUrl, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Discord returns 200 OK for valid webhooks on GET
    if (!response.ok && response.status !== 200) {
      return {
        service,
        status: 'fail',
        responseTime: Date.now() - startTime,
        error: sanitizeCredentials(`HTTP ${response.status}: ${response.statusText}`),
      };
    }

    return {
      service,
      status: 'pass',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'fail',
      responseTime: Date.now() - startTime,
      error: sanitizeCredentials(errorMessage),
    };
  }
}

/**
 * Test Render API connectivity
 */
async function testRender(): Promise<IntegrationTestResult> {
  const startTime = Date.now();
  const service = 'Render';

  try {
    const apiKey = process.env.RENDER_API_KEY;
    if (!apiKey) {
      return {
        service,
        status: 'fail',
        responseTime: Date.now() - startTime,
        error: 'RENDER_API_KEY not configured',
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.render.com/v1/services', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        service,
        status: 'fail',
        responseTime: Date.now() - startTime,
        error: sanitizeCredentials(`HTTP ${response.status}: ${response.statusText}`),
      };
    }

    return {
      service,
      status: 'pass',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'fail',
      responseTime: Date.now() - startTime,
      error: sanitizeCredentials(errorMessage),
    };
  }
}

/**
 * Test Linear API connectivity
 */
async function testLinear(): Promise<IntegrationTestResult> {
  const startTime = Date.now();
  const service = 'Linear';

  try {
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      return {
        service,
        status: 'fail',
        responseTime: Date.now() - startTime,
        error: 'LINEAR_API_KEY not configured',
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Simple GraphQL query to test connectivity
    const query = {
      query: '{ viewer { id name } }',
    };

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        service,
        status: 'fail',
        responseTime: Date.now() - startTime,
        error: sanitizeCredentials(`HTTP ${response.status}: ${response.statusText}`),
      };
    }

    const data = await response.json();

    // Check for GraphQL errors
    if (data.errors) {
      return {
        service,
        status: 'fail',
        responseTime: Date.now() - startTime,
        error: sanitizeCredentials(JSON.stringify(data.errors)),
      };
    }

    return {
      service,
      status: 'pass',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'fail',
      responseTime: Date.now() - startTime,
      error: sanitizeCredentials(errorMessage),
    };
  }
}

/**
 * Test NeonDB connectivity
 */
async function testNeonDB(): Promise<IntegrationTestResult> {
  const startTime = Date.now();
  const service = 'NeonDB';

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return {
        service,
        status: 'fail',
        responseTime: Date.now() - startTime,
        error: 'DATABASE_URL not configured',
      };
    }

    // Use postgres driver for connection test
    const { default: postgres } = await import('postgres');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const sql = postgres(databaseUrl, {
      max: 1,
      idle_timeout: 10,
      connect_timeout: 10,
    });

    try {
      // Simple query to test connectivity
      await sql`SELECT 1 as test`;

      clearTimeout(timeoutId);
      await sql.end();

      return {
        service,
        status: 'pass',
        responseTime: Date.now() - startTime,
      };
    } catch (dbError) {
      clearTimeout(timeoutId);
      await sql.end({ timeout: 1 });

      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      return {
        service,
        status: 'fail',
        responseTime: Date.now() - startTime,
        error: sanitizeCredentials(errorMessage),
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'fail',
      responseTime: Date.now() - startTime,
      error: sanitizeCredentials(errorMessage),
    };
  }
}

/**
 * Generate markdown report from test results
 */
function generateMarkdownReport(results: IntegrationTestResult[], date: string): string {
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;

  let markdown = `# Integration Status Report\n\n`;
  markdown += `## Date: ${date}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- Total: ${results.length}\n`;
  markdown += `- Passed: ${passed}\n`;
  markdown += `- Failed: ${failed}\n\n`;
  markdown += `## Individual Results\n\n`;

  for (const result of results) {
    markdown += `### ${result.service}\n\n`;
    markdown += `- Status: ${result.status === 'pass' ? '✅ Pass' : '❌ Fail'}\n`;
    markdown += `- Response Time: ${result.responseTime}ms\n`;

    if (result.error) {
      markdown += `- Error: ${result.error}\n`;
    }

    markdown += `\n`;
  }

  return markdown;
}

/**
 * Main orchestrator function
 */
async function main() {
  console.log('Starting integration tests...\n');

  // Run all tests sequentially
  const results: IntegrationTestResult[] = [];

  console.log('Testing GitHub...');
  const githubResult = await testGitHub();
  results.push(githubResult);
  console.log(`  ${githubResult.status === 'pass' ? '✅' : '❌'} ${githubResult.service}: ${githubResult.status} (${githubResult.responseTime}ms)`);

  console.log('Testing Discord...');
  const discordResult = await testDiscord();
  results.push(discordResult);
  console.log(`  ${discordResult.status === 'pass' ? '✅' : '❌'} ${discordResult.service}: ${discordResult.status} (${discordResult.responseTime}ms)`);

  console.log('Testing Render...');
  const renderResult = await testRender();
  results.push(renderResult);
  console.log(`  ${renderResult.status === 'pass' ? '✅' : '❌'} ${renderResult.service}: ${renderResult.status} (${renderResult.responseTime}ms)`);

  console.log('Testing Linear...');
  const linearResult = await testLinear();
  results.push(linearResult);
  console.log(`  ${linearResult.status === 'pass' ? '✅' : '❌'} ${linearResult.service}: ${linearResult.status} (${linearResult.responseTime}ms)`);

  console.log('Testing NeonDB...');
  const neonResult = await testNeonDB();
  results.push(neonResult);
  console.log(`  ${neonResult.status === 'pass' ? '✅' : '❌'} ${neonResult.service}: ${neonResult.status} (${neonResult.responseTime}ms)`);

  // Generate report
  const date = new Date().toISOString().split('T')[0];
  const report = generateMarkdownReport(results, date);

  // Save report to file
  const reportDir = join(process.cwd(), 'DailyIntegrationTestResult');
  const reportPath = join(reportDir, `Integration-Status-${date}.md`);

  try {
    await mkdir(reportDir, { recursive: true });
    await writeFile(reportPath, report, 'utf-8');
    console.log(`\n✅ Report saved to: ${reportPath}`);
  } catch (error) {
    console.error(`\n❌ Failed to save report: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Print summary
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;

  console.log('\n=== Summary ===');
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  // Exit with appropriate code
  if (failed > 0) {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed');
    process.exit(0);
  }
}

// Run the tests
main().catch((error) => {
  console.error('Fatal error:', sanitizeCredentials(error.message));
  process.exit(1);
});
