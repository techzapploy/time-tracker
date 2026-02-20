import { Client } from 'pg';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface TestResult {
  service: string;
  status: 'pass' | 'fail';
  message: string;
  timestamp: string;
}

function sanitizeError(error: string): string {
  let sanitized = error;

  // Remove Bearer tokens
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9_\-\.]+/gi, 'Bearer [REDACTED]');

  // Remove API keys from query parameters
  sanitized = sanitized.replace(/api_key=[^&\s]+/gi, 'api_key=[REDACTED]');

  // Remove passwords from connection strings
  sanitized = sanitized.replace(/password=[^&\s]+/gi, 'password=[REDACTED]');

  // Remove full PostgreSQL connection strings
  sanitized = sanitized.replace(/postgresql:\/\/[^@]+@[^\s]+/gi, 'postgresql://[REDACTED]');

  // Remove Sentry DSN keys
  sanitized = sanitized.replace(/https:\/\/[a-f0-9]+@/gi, 'https://[REDACTED]@');

  // Remove generic tokens in headers
  sanitized = sanitized.replace(/"authorization":\s*"[^"]+"/gi, '"authorization": "[REDACTED]"');

  return sanitized;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function testDiscord(): Promise<TestResult> {
  const timestamp = new Date().toISOString();

  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!webhookUrl && !botToken) {
      return {
        service: 'Discord',
        status: 'fail',
        message: 'Missing DISCORD_WEBHOOK_URL or DISCORD_BOT_TOKEN',
        timestamp,
      };
    }

    if (webhookUrl) {
      const response = await fetchWithTimeout(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Integration test' }),
      });

      if (response.ok) {
        return {
          service: 'Discord',
          status: 'pass',
          message: 'Webhook connection successful',
          timestamp,
        };
      }
    }

    if (botToken) {
      const response = await fetchWithTimeout('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bot ${botToken}` },
      });

      if (response.ok) {
        return {
          service: 'Discord',
          status: 'pass',
          message: 'Bot token authentication successful',
          timestamp,
        };
      }
    }

    return {
      service: 'Discord',
      status: 'fail',
      message: 'Connection failed',
      timestamp,
    };
  } catch (error) {
    return {
      service: 'Discord',
      status: 'fail',
      message: sanitizeError(error instanceof Error ? error.message : String(error)),
      timestamp,
    };
  }
}

async function testRender(): Promise<TestResult> {
  const timestamp = new Date().toISOString();

  try {
    const apiKey = process.env.RENDER_API_KEY;

    if (!apiKey) {
      return {
        service: 'Render',
        status: 'fail',
        message: 'Missing RENDER_API_KEY',
        timestamp,
      };
    }

    const response = await fetchWithTimeout('https://api.render.com/v1/services', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (response.ok) {
      return {
        service: 'Render',
        status: 'pass',
        message: 'API connection successful',
        timestamp,
      };
    }

    return {
      service: 'Render',
      status: 'fail',
      message: `API returned status ${response.status}`,
      timestamp,
    };
  } catch (error) {
    return {
      service: 'Render',
      status: 'fail',
      message: sanitizeError(error instanceof Error ? error.message : String(error)),
      timestamp,
    };
  }
}

async function testLinear(): Promise<TestResult> {
  const timestamp = new Date().toISOString();

  try {
    const apiKey = process.env.LINEAR_API_KEY;

    if (!apiKey) {
      return {
        service: 'Linear',
        status: 'fail',
        message: 'Missing LINEAR_API_KEY',
        timestamp,
      };
    }

    const response = await fetchWithTimeout('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({
        query: '{ viewer { id name } }',
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as any;
      if (data.data?.viewer) {
        return {
          service: 'Linear',
          status: 'pass',
          message: 'GraphQL API connection successful',
          timestamp,
        };
      }
    }

    return {
      service: 'Linear',
      status: 'fail',
      message: `API returned status ${response.status}`,
      timestamp,
    };
  } catch (error) {
    return {
      service: 'Linear',
      status: 'fail',
      message: sanitizeError(error instanceof Error ? error.message : String(error)),
      timestamp,
    };
  }
}

async function testNeonDB(): Promise<TestResult> {
  const timestamp = new Date().toISOString();

  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return {
        service: 'NeonDB',
        status: 'fail',
        message: 'Missing DATABASE_URL',
        timestamp,
      };
    }

    const client = new Client({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 10000,
    });

    await client.connect();
    const result = await client.query('SELECT 1');
    await client.end();

    if (result.rows.length > 0) {
      return {
        service: 'NeonDB',
        status: 'pass',
        message: 'Database connection successful',
        timestamp,
      };
    }

    return {
      service: 'NeonDB',
      status: 'fail',
      message: 'Query returned no results',
      timestamp,
    };
  } catch (error) {
    return {
      service: 'NeonDB',
      status: 'fail',
      message: sanitizeError(error instanceof Error ? error.message : String(error)),
      timestamp,
    };
  }
}

async function testGitHub(): Promise<TestResult> {
  const timestamp = new Date().toISOString();

  try {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return {
        service: 'GitHub',
        status: 'fail',
        message: 'Missing GITHUB_TOKEN',
        timestamp,
      };
    }

    const response = await fetchWithTimeout('https://api.github.com/repos/techzapploy/time-tracker', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      return {
        service: 'GitHub',
        status: 'pass',
        message: 'API connection successful',
        timestamp,
      };
    }

    return {
      service: 'GitHub',
      status: 'fail',
      message: `API returned status ${response.status}`,
      timestamp,
    };
  } catch (error) {
    return {
      service: 'GitHub',
      status: 'fail',
      message: sanitizeError(error instanceof Error ? error.message : String(error)),
      timestamp,
    };
  }
}

async function testSentry(): Promise<TestResult> {
  const timestamp = new Date().toISOString();

  try {
    const dsn = process.env.SENTRY_DSN;
    const authToken = process.env.SENTRY_AUTH_TOKEN;

    if (!dsn && !authToken) {
      return {
        service: 'Sentry',
        status: 'fail',
        message: 'Missing SENTRY_DSN or SENTRY_AUTH_TOKEN',
        timestamp,
      };
    }

    if (dsn) {
      // Validate DSN format: https://<key>@<host>/<project>
      const dsnPattern = /^https:\/\/[a-f0-9]+@[^\/]+\/\d+$/;
      if (dsnPattern.test(dsn)) {
        return {
          service: 'Sentry',
          status: 'pass',
          message: 'DSN format validation successful',
          timestamp,
        };
      } else {
        return {
          service: 'Sentry',
          status: 'fail',
          message: 'Invalid DSN format',
          timestamp,
        };
      }
    }

    if (authToken) {
      const response = await fetchWithTimeout('https://sentry.io/api/0/organizations/', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        return {
          service: 'Sentry',
          status: 'pass',
          message: 'API authentication successful',
          timestamp,
        };
      }

      return {
        service: 'Sentry',
        status: 'fail',
        message: `API returned status ${response.status}`,
        timestamp,
      };
    }

    return {
      service: 'Sentry',
      status: 'fail',
      message: 'Configuration error',
      timestamp,
    };
  } catch (error) {
    return {
      service: 'Sentry',
      status: 'fail',
      message: sanitizeError(error instanceof Error ? error.message : String(error)),
      timestamp,
    };
  }
}

async function main() {
  console.log('Starting integration tests...\n');

  const tests = [
    testDiscord(),
    testRender(),
    testLinear(),
    testNeonDB(),
    testGitHub(),
    testSentry(),
  ];

  const results = await Promise.allSettled(tests);

  const testResults: TestResult[] = results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        service: 'Unknown',
        status: 'fail' as const,
        message: sanitizeError(result.reason?.message || 'Test execution failed'),
        timestamp: new Date().toISOString(),
      };
    }
  });

  // Generate report
  const date = new Date().toISOString().split('T')[0];
  const passed = testResults.filter((r) => r.status === 'pass').length;
  const failed = testResults.filter((r) => r.status === 'fail').length;

  let report = `# Integration Status Report - ${date}\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n`;
  report += `- Total: 6\n`;
  report += `- Passed: ${passed}\n`;
  report += `- Failed: ${failed}\n\n`;
  report += `## Test Results\n\n`;

  for (const result of testResults) {
    const statusIcon = result.status === 'pass' ? '✅' : '❌';
    const statusText = result.status === 'pass' ? 'Pass' : 'Fail';

    report += `### ${result.service}\n`;
    report += `- Status: ${statusIcon} ${statusText}\n`;
    report += `- Message: ${result.message}\n`;
    report += `- Timestamp: ${result.timestamp}\n\n`;
  }

  // Ensure output directory exists
  const outputDir = join(process.cwd(), '..', 'DailyIntegrationTestResult');
  await mkdir(outputDir, { recursive: true });

  // Write report
  const reportPath = join(outputDir, `Integration-Status-${date}.md`);
  await writeFile(reportPath, report, 'utf-8');

  console.log(`Report generated: ${reportPath}`);
  console.log(`\nSummary: ${passed} passed, ${failed} failed`);

  // Exit with error code if any tests failed
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', sanitizeError(error.message));
  process.exit(1);
});
