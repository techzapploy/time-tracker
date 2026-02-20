/**
 * Integration Test Script
 *
 * This script verifies connectivity to all external services used by the application.
 *
 * Required Environment Variables:
 * - DISCORD_BOT_TOKEN: Discord bot authentication token
 * - RENDER_API_KEY: Render.com API key for deployment services
 * - LINEAR_API_KEY: Linear API key for project management integration
 * - NEON_DATABASE_URL: PostgreSQL connection string for NeonDB
 * - GITHUB_TOKEN: GitHub personal access token
 *
 * Usage:
 *   npm run integration-test
 *   OR: cd api && npx tsx integration-test.ts
 *
 * Exit Codes:
 *   0 - All services passed
 *   1 - One or more services failed
 */

import postgres from 'postgres';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface TestResult {
  service: string;
  status: 'success' | 'failure';
  message: string;
  timestamp: string;
  error?: string;
}

/**
 * Sanitizes error messages by replacing sensitive environment variable values
 * with '***REDACTED***'
 */
function sanitizeError(error: string): string {
  const envVars = [
    process.env.DISCORD_BOT_TOKEN,
    process.env.RENDER_API_KEY,
    process.env.LINEAR_API_KEY,
    process.env.NEON_DATABASE_URL,
    process.env.GITHUB_TOKEN,
  ];

  let sanitized = error;
  for (const envVar of envVars) {
    if (envVar) {
      sanitized = sanitized.replace(new RegExp(envVar, 'g'), '***REDACTED***');
    }
  }

  return sanitized;
}

/**
 * Creates an AbortController with a timeout
 */
function createTimeout(ms: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller;
}

/**
 * Check Discord API connectivity
 */
async function checkDiscord(): Promise<TestResult> {
  const service = 'Discord';
  const timestamp = new Date().toISOString();

  try {
    if (!process.env.DISCORD_BOT_TOKEN) {
      return {
        service,
        status: 'failure',
        message: 'Missing DISCORD_BOT_TOKEN environment variable',
        timestamp,
        error: 'Environment variable not set',
      };
    }

    const controller = createTimeout(10000);
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      method: 'GET',
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      signal: controller.signal,
    });

    if (response.ok) {
      const data = await response.json() as any;
      return {
        service,
        status: 'success',
        message: `Successfully connected to Discord API (Bot: ${data.username})`,
        timestamp,
      };
    } else {
      const errorText = await response.text();
      return {
        service,
        status: 'failure',
        message: `Discord API returned status ${response.status}`,
        timestamp,
        error: sanitizeError(errorText),
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'failure',
      message: 'Failed to connect to Discord API',
      timestamp,
      error: sanitizeError(errorMessage),
    };
  }
}

/**
 * Check Render API connectivity
 */
async function checkRender(): Promise<TestResult> {
  const service = 'Render';
  const timestamp = new Date().toISOString();

  try {
    if (!process.env.RENDER_API_KEY) {
      return {
        service,
        status: 'failure',
        message: 'Missing RENDER_API_KEY environment variable',
        timestamp,
        error: 'Environment variable not set',
      };
    }

    const controller = createTimeout(10000);
    const response = await fetch('https://api.render.com/v1/services', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.RENDER_API_KEY}`,
      },
      signal: controller.signal,
    });

    if (response.ok) {
      const data = await response.json() as any;
      return {
        service,
        status: 'success',
        message: `Successfully connected to Render API (${data.length || 0} services found)`,
        timestamp,
      };
    } else {
      const errorText = await response.text();
      return {
        service,
        status: 'failure',
        message: `Render API returned status ${response.status}`,
        timestamp,
        error: sanitizeError(errorText),
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'failure',
      message: 'Failed to connect to Render API',
      timestamp,
      error: sanitizeError(errorMessage),
    };
  }
}

/**
 * Check Linear API connectivity
 */
async function checkLinear(): Promise<TestResult> {
  const service = 'Linear';
  const timestamp = new Date().toISOString();

  try {
    if (!process.env.LINEAR_API_KEY) {
      return {
        service,
        status: 'failure',
        message: 'Missing LINEAR_API_KEY environment variable',
        timestamp,
        error: 'Environment variable not set',
      };
    }

    const controller = createTimeout(10000);
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': process.env.LINEAR_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ viewer { id name } }',
      }),
      signal: controller.signal,
    });

    if (response.ok) {
      const data = await response.json() as any;
      if (data.data?.viewer) {
        return {
          service,
          status: 'success',
          message: `Successfully connected to Linear API (User: ${data.data.viewer.name})`,
          timestamp,
        };
      } else {
        return {
          service,
          status: 'failure',
          message: 'Linear API returned unexpected response format',
          timestamp,
          error: sanitizeError(JSON.stringify(data)),
        };
      }
    } else {
      const errorText = await response.text();
      return {
        service,
        status: 'failure',
        message: `Linear API returned status ${response.status}`,
        timestamp,
        error: sanitizeError(errorText),
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'failure',
      message: 'Failed to connect to Linear API',
      timestamp,
      error: sanitizeError(errorMessage),
    };
  }
}

/**
 * Check NeonDB connectivity
 */
async function checkNeonDB(): Promise<TestResult> {
  const service = 'NeonDB';
  const timestamp = new Date().toISOString();

  let sql: ReturnType<typeof postgres> | null = null;

  try {
    if (!process.env.NEON_DATABASE_URL) {
      return {
        service,
        status: 'failure',
        message: 'Missing NEON_DATABASE_URL environment variable',
        timestamp,
        error: 'Environment variable not set',
      };
    }

    sql = postgres(process.env.NEON_DATABASE_URL, {
      max: 1,
      idle_timeout: 10,
      connect_timeout: 10,
    });

    // Test the connection with a simple query
    const result = await sql`SELECT 1 as test`;

    if (result.length > 0 && result[0].test === 1) {
      await sql.end();
      return {
        service,
        status: 'success',
        message: 'Successfully connected to NeonDB',
        timestamp,
      };
    } else {
      await sql.end();
      return {
        service,
        status: 'failure',
        message: 'NeonDB query returned unexpected result',
        timestamp,
        error: 'Query result validation failed',
      };
    }
  } catch (error) {
    if (sql) {
      try {
        await sql.end();
      } catch {
        // Ignore cleanup errors
      }
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'failure',
      message: 'Failed to connect to NeonDB',
      timestamp,
      error: sanitizeError(errorMessage),
    };
  }
}

/**
 * Check GitHub API connectivity
 */
async function checkGitHub(): Promise<TestResult> {
  const service = 'GitHub';
  const timestamp = new Date().toISOString();

  try {
    if (!process.env.GITHUB_TOKEN) {
      return {
        service,
        status: 'failure',
        message: 'Missing GITHUB_TOKEN environment variable',
        timestamp,
        error: 'Environment variable not set',
      };
    }

    const controller = createTimeout(10000);
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'Integration-Test-Script',
      },
      signal: controller.signal,
    });

    if (response.ok) {
      const data = await response.json() as any;
      return {
        service,
        status: 'success',
        message: `Successfully connected to GitHub API (User: ${data.login})`,
        timestamp,
      };
    } else {
      const errorText = await response.text();
      return {
        service,
        status: 'failure',
        message: `GitHub API returned status ${response.status}`,
        timestamp,
        error: sanitizeError(errorText),
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'failure',
      message: 'Failed to connect to GitHub API',
      timestamp,
      error: sanitizeError(errorMessage),
    };
  }
}

/**
 * Generate markdown report from test results
 */
function generateMarkdownReport(results: TestResult[]): string {
  const timestamp = new Date().toISOString();
  const date = new Date().toISOString().split('T')[0];

  const passed = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failure').length;
  const total = results.length;

  let markdown = `# Integration Test Report - ${date}\n\n`;
  markdown += `Generated: ${timestamp}\n\n`;
  markdown += `## Summary\n`;
  markdown += `- Total Services: ${total}\n`;
  markdown += `- Passed: ${passed}\n`;
  markdown += `- Failed: ${failed}\n\n`;
  markdown += `## Service Status\n\n`;

  for (const result of results) {
    const statusIcon = result.status === 'success' ? '✅' : '❌';
    const statusText = result.status === 'success' ? 'Success' : 'Failed';

    markdown += `### ${result.service}\n`;
    markdown += `- Status: ${statusIcon} ${statusText}\n`;
    markdown += `- Timestamp: ${result.timestamp}\n`;
    markdown += `- Message: ${result.message}\n`;

    if (result.error) {
      markdown += `\n**Error Details:**\n`;
      markdown += `\`\`\`\n${result.error}\n\`\`\`\n`;
    }

    markdown += `\n`;
  }

  return markdown;
}

/**
 * Main test execution function
 */
async function runIntegrationTests(): Promise<void> {
  console.log('🚀 Starting Integration Tests...\n');

  // Run all service checks
  console.log('Running service checks...');
  const results = await Promise.all([
    checkDiscord(),
    checkRender(),
    checkLinear(),
    checkNeonDB(),
    checkGitHub(),
  ]);

  // Log results to console
  console.log('\n📊 Test Results:\n');
  for (const result of results) {
    const icon = result.status === 'success' ? '✅' : '❌';
    console.log(`${icon} ${result.service}: ${result.message}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  // Generate report
  const date = new Date().toISOString().split('T')[0];
  const reportDir = join(process.cwd(), '..', 'DailyIntegrationTestResult');
  const reportPath = join(reportDir, `Integration-Status-${date}.md`);

  try {
    await mkdir(reportDir, { recursive: true });
    const markdown = generateMarkdownReport(results);
    await writeFile(reportPath, markdown, 'utf-8');
    console.log(`\n📝 Report saved to: ${reportPath}`);
  } catch (error) {
    console.error('❌ Failed to save report:', error);
  }

  // Calculate final status
  const failed = results.filter(r => r.status === 'failure').length;
  const passed = results.filter(r => r.status === 'success').length;

  console.log(`\n✨ Summary: ${passed} passed, ${failed} failed`);

  // Exit with appropriate code
  if (failed > 0) {
    console.log('❌ Integration tests failed');
    process.exit(1);
  } else {
    console.log('✅ All integration tests passed');
    process.exit(0);
  }
}

// Run the tests
runIntegrationTests().catch((error) => {
  console.error('💥 Unexpected error during test execution:', error);
  process.exit(1);
});
