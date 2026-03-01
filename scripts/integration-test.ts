import { writeFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

const { Client } = pg;

interface TestResult {
  service: string;
  status: 'pass' | 'fail';
  message: string;
  timestamp: string;
}

/**
 * Sanitize error messages to remove credentials
 */
function sanitizeError(error: unknown): string {
  let message = error instanceof Error ? error.message : String(error);

  // Remove tokens and API keys from URLs and messages
  message = message.replace(/Bearer\s+[A-Za-z0-9_-]+/gi, 'Bearer ****');
  message = message.replace(/token=[A-Za-z0-9_-]+/gi, 'token=****');
  message = message.replace(/api[_-]?key=[A-Za-z0-9_-]+/gi, 'api_key=****');
  message = message.replace(/password=[^&\s]+/gi, 'password=****');
  message = message.replace(/:[^:@]+@/g, ':****@'); // Remove passwords from connection strings

  return message;
}

/**
 * Create a fetch request with timeout
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
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/**
 * Test Discord connectivity
 */
async function testDiscord(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  try {
    if (webhookUrl) {
      // Test webhook by getting webhook info
      const response = await fetchWithTimeout(webhookUrl);

      if (response.ok) {
        return {
          service: 'Discord',
          status: 'pass',
          message: 'Webhook connectivity verified successfully',
          timestamp,
        };
      } else {
        return {
          service: 'Discord',
          status: 'fail',
          message: `Webhook returned status ${response.status}`,
          timestamp,
        };
      }
    } else if (botToken) {
      // Test bot token
      const response = await fetchWithTimeout(
        'https://discord.com/api/v10/users/@me',
        {
          headers: {
            Authorization: `Bot ${botToken}`,
          },
        }
      );

      if (response.ok) {
        return {
          service: 'Discord',
          status: 'pass',
          message: 'Bot API connectivity verified successfully',
          timestamp,
        };
      } else {
        return {
          service: 'Discord',
          status: 'fail',
          message: `Bot API returned status ${response.status}`,
          timestamp,
        };
      }
    } else {
      return {
        service: 'Discord',
        status: 'fail',
        message: 'No Discord credentials configured (DISCORD_WEBHOOK_URL or DISCORD_BOT_TOKEN)',
        timestamp,
      };
    }
  } catch (error) {
    return {
      service: 'Discord',
      status: 'fail',
      message: `Error: ${sanitizeError(error)}`,
      timestamp,
    };
  }
}

/**
 * Test Render connectivity
 */
async function testRender(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return {
      service: 'Render',
      status: 'fail',
      message: 'No Render API key configured (RENDER_API_KEY)',
      timestamp,
    };
  }

  try {
    const response = await fetchWithTimeout(
      'https://api.render.com/v1/services',
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (response.ok) {
      return {
        service: 'Render',
        status: 'pass',
        message: 'API connectivity verified successfully',
        timestamp,
      };
    } else {
      return {
        service: 'Render',
        status: 'fail',
        message: `API returned status ${response.status}`,
        timestamp,
      };
    }
  } catch (error) {
    return {
      service: 'Render',
      status: 'fail',
      message: `Error: ${sanitizeError(error)}`,
      timestamp,
    };
  }
}

/**
 * Test Linear connectivity
 */
async function testLinear(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return {
      service: 'Linear',
      status: 'fail',
      message: 'No Linear API key configured (LINEAR_API_KEY)',
      timestamp,
    };
  }

  try {
    const response = await fetchWithTimeout(
      'https://api.linear.app/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiKey,
        },
        body: JSON.stringify({
          query: '{ viewer { id name email } }',
        }),
      }
    );

    if (response.ok) {
      const data = await response.json() as any;
      if (data.data && data.data.viewer) {
        return {
          service: 'Linear',
          status: 'pass',
          message: 'GraphQL API connectivity verified successfully',
          timestamp,
        };
      } else if (data.errors) {
        return {
          service: 'Linear',
          status: 'fail',
          message: `GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`,
          timestamp,
        };
      } else {
        return {
          service: 'Linear',
          status: 'fail',
          message: 'Unexpected response format',
          timestamp,
        };
      }
    } else {
      return {
        service: 'Linear',
        status: 'fail',
        message: `API returned status ${response.status}`,
        timestamp,
      };
    }
  } catch (error) {
    return {
      service: 'Linear',
      status: 'fail',
      message: `Error: ${sanitizeError(error)}`,
      timestamp,
    };
  }
}

/**
 * Test NeonDB connectivity
 */
async function testNeonDB(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      service: 'NeonDB',
      status: 'fail',
      message: 'No database URL configured (DATABASE_URL)',
      timestamp,
    };
  }

  const client = new Client({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT 1');
    await client.end();

    if (result.rows.length > 0) {
      return {
        service: 'NeonDB',
        status: 'pass',
        message: 'Database connectivity verified successfully',
        timestamp,
      };
    } else {
      return {
        service: 'NeonDB',
        status: 'fail',
        message: 'Query did not return expected result',
        timestamp,
      };
    }
  } catch (error) {
    try {
      await client.end();
    } catch {
      // Ignore cleanup errors
    }
    return {
      service: 'NeonDB',
      status: 'fail',
      message: `Error: ${sanitizeError(error)}`,
      timestamp,
    };
  }
}

/**
 * Test GitHub connectivity
 */
async function testGitHub(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return {
      service: 'GitHub',
      status: 'fail',
      message: 'No GitHub token configured (GITHUB_TOKEN)',
      timestamp,
    };
  }

  try {
    const response = await fetchWithTimeout(
      'https://api.github.com/repos/techzapploy/time-tracker',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'time-tracker-integration-test',
        },
      }
    );

    if (response.ok) {
      return {
        service: 'GitHub',
        status: 'pass',
        message: 'API connectivity verified successfully',
        timestamp,
      };
    } else {
      return {
        service: 'GitHub',
        status: 'fail',
        message: `API returned status ${response.status}`,
        timestamp,
      };
    }
  } catch (error) {
    return {
      service: 'GitHub',
      status: 'fail',
      message: `Error: ${sanitizeError(error)}`,
      timestamp,
    };
  }
}

/**
 * Generate markdown report from test results
 */
function generateMarkdownReport(results: TestResult[]): string {
  const reportDate = new Date().toISOString().split('T')[0];
  const generatedTime = new Date().toISOString();

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;

  let markdown = `# Integration Status Report - ${reportDate}\n\n`;
  markdown += `Generated: ${generatedTime}\n\n`;
  markdown += `## Summary\n`;
  markdown += `- Total: ${results.length}\n`;
  markdown += `- Passed: ${passed}\n`;
  markdown += `- Failed: ${failed}\n\n`;
  markdown += `## Test Results\n\n`;

  for (const result of results) {
    const statusIcon = result.status === 'pass' ? '✅' : '❌';
    const statusText = result.status === 'pass' ? 'Pass' : 'Fail';

    markdown += `### ${result.service}\n`;
    markdown += `- Status: ${statusIcon} ${statusText}\n`;
    markdown += `- Message: ${result.message}\n`;
    markdown += `- Timestamp: ${result.timestamp}\n\n`;
  }

  return markdown;
}

/**
 * Main function to run all tests and generate report
 */
async function main() {
  console.log('Starting integration tests...\n');

  // Run all tests in parallel
  const results = await Promise.all([
    testDiscord(),
    testRender(),
    testLinear(),
    testNeonDB(),
    testGitHub(),
  ]);

  // Print results to console
  for (const result of results) {
    const statusIcon = result.status === 'pass' ? '✅' : '❌';
    console.log(`${statusIcon} ${result.service}: ${result.message}`);
  }

  // Generate markdown report
  const markdown = generateMarkdownReport(results);
  const reportDate = new Date().toISOString().split('T')[0];
  const reportPath = join(
    process.cwd(),
    '..',
    'DailyIntegrationTestResult',
    `Integration-Status-${reportDate}.md`
  );

  // Save report
  writeFileSync(reportPath, markdown, 'utf-8');
  console.log(`\nReport saved to: ${reportPath}`);

  // Exit with error code if any tests failed
  const failedCount = results.filter((r) => r.status === 'fail').length;
  if (failedCount > 0) {
    console.log(`\n${failedCount} test(s) failed`);
    process.exit(1);
  } else {
    console.log('\nAll tests passed!');
    process.exit(0);
  }
}

// Run main function
main().catch((error) => {
  console.error('Fatal error:', sanitizeError(error));
  process.exit(1);
});
