#!/usr/bin/env tsx

/**
 * Integration Test Script
 *
 * Tests connectivity to critical external services:
 * - Discord (webhook or bot token)
 * - Render (API key)
 * - Linear (API key)
 * - NeonDB (database connection or API key)
 * - GitHub (API token)
 *
 * Generates a markdown report in DailyIntegrationTestResult/ directory
 * Exits with code 0 on success, 1 on failures
 */

/* eslint-disable no-console */

import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  service: string;
  status: 'pass' | 'fail';
  message: string;
  timestamp: string;
}

// Utility function to create fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Sanitize credentials from text
function sanitize(text: string, credentials: string[]): string {
  let sanitized = text;
  for (const cred of credentials) {
    if (cred && cred.length > 0) {
      // Replace the credential with asterisks, keeping first and last 2 chars if long enough
      const replacement =
        cred.length > 8
          ? `${cred.substring(0, 2)}${'*'.repeat(cred.length - 4)}${cred.substring(cred.length - 2)}`
          : '*'.repeat(cred.length);
      sanitized = sanitized.split(cred).join(replacement);
    }
  }
  return sanitized;
}

// Test Discord connectivity
async function testDiscord(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!webhookUrl && !botToken) {
    return {
      service: 'Discord',
      status: 'fail',
      message: 'Missing credentials: DISCORD_WEBHOOK_URL or DISCORD_BOT_TOKEN not set',
      timestamp,
    };
  }

  try {
    if (webhookUrl) {
      // Test webhook by sending a GET request (Discord webhooks support GET for validation)
      const response = await fetchWithTimeout(webhookUrl, {
        method: 'GET',
        timeout: 10000,
      });

      if (response.ok || response.status === 405) {
        // 405 Method Not Allowed means webhook exists but doesn't support GET (which is fine)
        return {
          service: 'Discord',
          status: 'pass',
          message: 'Webhook URL is valid and accessible',
          timestamp,
        };
      } else {
        return {
          service: 'Discord',
          status: 'fail',
          message: `Webhook validation failed: ${response.status} ${response.statusText}`,
          timestamp,
        };
      }
    } else if (botToken) {
      // Test bot token by calling Discord API
      const response = await fetchWithTimeout('https://discord.com/api/v10/users/@me', {
        method: 'GET',
        headers: {
          Authorization: `Bot ${botToken}`,
        },
        timeout: 10000,
      });

      if (response.ok) {
        return {
          service: 'Discord',
          status: 'pass',
          message: 'Bot token is valid and authenticated',
          timestamp,
        };
      } else {
        return {
          service: 'Discord',
          status: 'fail',
          message: `Bot token validation failed: ${response.status} ${response.statusText}`,
          timestamp,
        };
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service: 'Discord',
      status: 'fail',
      message: `Connection error: ${errorMessage}`,
      timestamp,
    };
  }

  return {
    service: 'Discord',
    status: 'fail',
    message: 'Unexpected error in test logic',
    timestamp,
  };
}

// Test Render API connectivity
async function testRender(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return {
      service: 'Render',
      status: 'fail',
      message: 'Missing credentials: RENDER_API_KEY not set',
      timestamp,
    };
  }

  try {
    const response = await fetchWithTimeout('https://api.render.com/v1/services', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 10000,
    });

    if (response.ok) {
      return {
        service: 'Render',
        status: 'pass',
        message: 'API key is valid and authenticated',
        timestamp,
      };
    } else {
      return {
        service: 'Render',
        status: 'fail',
        message: `API authentication failed: ${response.status} ${response.statusText}`,
        timestamp,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service: 'Render',
      status: 'fail',
      message: `Connection error: ${errorMessage}`,
      timestamp,
    };
  }
}

// Test Linear API connectivity
async function testLinear(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return {
      service: 'Linear',
      status: 'fail',
      message: 'Missing credentials: LINEAR_API_KEY not set',
      timestamp,
    };
  }

  try {
    // Linear uses GraphQL, so we test with a simple viewer query
    const response = await fetchWithTimeout('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ viewer { id name } }',
      }),
      timeout: 10000,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.errors) {
        return {
          service: 'Linear',
          status: 'fail',
          message: `API query failed: ${data.errors[0]?.message || 'Unknown error'}`,
          timestamp,
        };
      }
      return {
        service: 'Linear',
        status: 'pass',
        message: 'API key is valid and authenticated',
        timestamp,
      };
    } else {
      return {
        service: 'Linear',
        status: 'fail',
        message: `API authentication failed: ${response.status} ${response.statusText}`,
        timestamp,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service: 'Linear',
      status: 'fail',
      message: `Connection error: ${errorMessage}`,
      timestamp,
    };
  }
}

// Test NeonDB connectivity
async function testNeonDB(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const databaseUrl = process.env.DATABASE_URL;
  const neonApiKey = process.env.NEON_API_KEY;

  if (!databaseUrl && !neonApiKey) {
    return {
      service: 'NeonDB',
      status: 'fail',
      message: 'Missing credentials: DATABASE_URL or NEON_API_KEY not set',
      timestamp,
    };
  }

  try {
    if (neonApiKey) {
      // Test Neon API
      const response = await fetchWithTimeout('https://console.neon.tech/api/v2/projects', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${neonApiKey}`,
        },
        timeout: 10000,
      });

      if (response.ok) {
        return {
          service: 'NeonDB',
          status: 'pass',
          message: 'Neon API key is valid and authenticated',
          timestamp,
        };
      } else {
        return {
          service: 'NeonDB',
          status: 'fail',
          message: `Neon API authentication failed: ${response.status} ${response.statusText}`,
          timestamp,
        };
      }
    } else if (databaseUrl) {
      // For DATABASE_URL, we'll use dynamic import to load postgres driver
      // This is a basic connectivity test without full database driver
      const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

      if (!urlMatch) {
        return {
          service: 'NeonDB',
          status: 'fail',
          message: 'Invalid DATABASE_URL format',
          timestamp,
        };
      }

      // Try to connect to the database host (basic TCP check via HTTP)
      // Note: This is a simplified check. In production, you'd use the postgres driver
      try {
        const postgresModule = await import('postgres');
        // @ts-expect-error - postgres uses export = syntax which creates ambiguity with dynamic imports
        const postgres = postgresModule.default || postgresModule;
        const sql = postgres(databaseUrl, {
          max: 1,
          connect_timeout: 10,
        });

        // Simple query to test connection
        await sql`SELECT 1 as test`;
        await sql.end();

        return {
          service: 'NeonDB',
          status: 'pass',
          message: 'Database connection successful',
          timestamp,
        };
      } catch (dbError) {
        const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
        return {
          service: 'NeonDB',
          status: 'fail',
          message: `Database connection failed: ${errorMessage}`,
          timestamp,
        };
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service: 'NeonDB',
      status: 'fail',
      message: `Connection error: ${errorMessage}`,
      timestamp,
    };
  }

  return {
    service: 'NeonDB',
    status: 'fail',
    message: 'Unexpected error in test logic',
    timestamp,
  };
}

// Test GitHub API connectivity
async function testGitHub(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const apiToken = process.env.GITHUB_TOKEN;

  if (!apiToken) {
    return {
      service: 'GitHub',
      status: 'fail',
      message: 'Missing credentials: GITHUB_TOKEN not set',
      timestamp,
    };
  }

  try {
    const response = await fetchWithTimeout('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
      timeout: 10000,
    });

    if (response.ok) {
      return {
        service: 'GitHub',
        status: 'pass',
        message: 'API token is valid and authenticated',
        timestamp,
      };
    } else {
      return {
        service: 'GitHub',
        status: 'fail',
        message: `API authentication failed: ${response.status} ${response.statusText}`,
        timestamp,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service: 'GitHub',
      status: 'fail',
      message: `Connection error: ${errorMessage}`,
      timestamp,
    };
  }
}

// Generate markdown report
function generateReport(results: TestResult[]): string {
  const date = new Date();
  const timestamp = date.toISOString();

  let report = `# Integration Test Report\n\n`;
  report += `**Generated:** ${timestamp}\n\n`;

  const totalTests = results.length;
  const passedTests = results.filter((r) => r.status === 'pass').length;
  const failedTests = results.filter((r) => r.status === 'fail').length;

  report += `## Summary\n\n`;
  report += `- **Total Tests:** ${totalTests}\n`;
  report += `- **Passed:** ${passedTests}\n`;
  report += `- **Failed:** ${failedTests}\n`;
  report += `- **Status:** ${failedTests === 0 ? '✅ All tests passed' : '❌ Some tests failed'}\n\n`;

  report += `## Test Results\n\n`;

  for (const result of results) {
    const statusIcon = result.status === 'pass' ? '✅' : '❌';
    report += `### ${statusIcon} ${result.service}\n\n`;
    report += `- **Status:** ${result.status.toUpperCase()}\n`;
    report += `- **Message:** ${result.message}\n`;
    report += `- **Timestamp:** ${result.timestamp}\n\n`;
  }

  report += `---\n\n`;
  report += `*This report was automatically generated by the integration test script.*\n`;

  return report;
}

// Main execution
async function main() {
  console.log('Starting integration tests...\n');

  // Collect all credentials for sanitization
  const credentials = [
    process.env.DISCORD_WEBHOOK_URL || '',
    process.env.DISCORD_BOT_TOKEN || '',
    process.env.RENDER_API_KEY || '',
    process.env.LINEAR_API_KEY || '',
    process.env.NEON_API_KEY || '',
    process.env.GITHUB_TOKEN || '',
    process.env.DATABASE_URL || '',
  ].filter((c) => c.length > 0);

  // Run all tests
  const results: TestResult[] = [];

  console.log('Testing Discord connectivity...');
  const discordResult = await testDiscord();
  results.push(discordResult);
  console.log(
    `  ${discordResult.status === 'pass' ? '✅' : '❌'} ${sanitize(discordResult.message, credentials)}\n`,
  );

  console.log('Testing Render connectivity...');
  const renderResult = await testRender();
  results.push(renderResult);
  console.log(
    `  ${renderResult.status === 'pass' ? '✅' : '❌'} ${sanitize(renderResult.message, credentials)}\n`,
  );

  console.log('Testing Linear connectivity...');
  const linearResult = await testLinear();
  results.push(linearResult);
  console.log(
    `  ${linearResult.status === 'pass' ? '✅' : '❌'} ${sanitize(linearResult.message, credentials)}\n`,
  );

  console.log('Testing NeonDB connectivity...');
  const neonResult = await testNeonDB();
  results.push(neonResult);
  console.log(
    `  ${neonResult.status === 'pass' ? '✅' : '❌'} ${sanitize(neonResult.message, credentials)}\n`,
  );

  console.log('Testing GitHub connectivity...');
  const githubResult = await testGitHub();
  results.push(githubResult);
  console.log(
    `  ${githubResult.status === 'pass' ? '✅' : '❌'} ${sanitize(githubResult.message, credentials)}\n`,
  );

  // Generate report
  const report = generateReport(results);
  const sanitizedReport = sanitize(report, credentials);

  // Create output directory if it doesn't exist
  const outputDir = path.join(process.cwd(), 'DailyIntegrationTestResult');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write report to file
  const date = new Date().toISOString().split('T')[0];
  const reportFilename = `Integration-Status-${date}.md`;
  const reportPath = path.join(outputDir, reportFilename);

  fs.writeFileSync(reportPath, sanitizedReport, 'utf-8');
  console.log(`Report generated: ${reportPath}\n`);

  // Print summary
  const failedTests = results.filter((r) => r.status === 'fail').length;
  if (failedTests === 0) {
    console.log('✅ All integration tests passed!');
    process.exit(0);
  } else {
    console.log(`❌ ${failedTests} integration test(s) failed.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error running integration tests:', error);
  process.exit(1);
});
