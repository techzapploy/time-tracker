#!/usr/bin/env node
/**
 * Integration Test Script
 *
 * This script verifies connectivity to all external services used by the application.
 * It runs daily via GitHub Actions and generates a markdown report.
 *
 * Services checked:
 * - PostgreSQL (DATABASE_URL)
 * - Redis (REDIS_HOST, REDIS_PORT)
 * - Discord API (DISCORD_WEBHOOK_URL or DISCORD_BOT_TOKEN)
 * - Render API (RENDER_API_KEY)
 * - Linear API (LINEAR_API_KEY)
 * - NeonDB API (NEON_API_KEY)
 * - GitHub API (GITHUB_TOKEN)
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Timeout for all API requests (10 seconds)
const REQUEST_TIMEOUT = 10000;

interface TestResult {
  service: string;
  status: "success" | "failure" | "skipped";
  message: string;
  responseTime?: number;
  error?: string;
}

/**
 * Sanitizes strings to remove any potential credentials
 */
function sanitize(text: string): string {
  // Remove potential tokens, passwords, and API keys
  return text
    .replace(/Bearer\s+[A-Za-z0-9_-]+/gi, "Bearer [REDACTED]")
    .replace(/token[=:]\s*[A-Za-z0-9_-]+/gi, "token=[REDACTED]")
    .replace(/api[_-]?key[=:]\s*[A-Za-z0-9_-]+/gi, "api_key=[REDACTED]")
    .replace(/password[=:]\s*[^\s&]+/gi, "password=[REDACTED]")
    .replace(/postgres:\/\/[^:]+:[^@]+@/g, "postgres://[USER]:[PASS]@")
    .replace(/redis:\/\/[^:]+:[^@]+@/g, "redis://[USER]:[PASS]@");
}

/**
 * Creates a fetch request with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Test PostgreSQL connectivity
 */
async function testPostgreSQL(): Promise<TestResult> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      service: "PostgreSQL",
      status: "skipped",
      message: "DATABASE_URL not configured",
    };
  }

  const startTime = Date.now();

  try {
    // Dynamic import to handle ESM module
    const postgres = await import("postgres");
    const sql = postgres.default(databaseUrl, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10,
    });

    // Simple connectivity test
    await sql`SELECT 1 as test`;
    await sql.end();

    const responseTime = Date.now() - startTime;

    return {
      service: "PostgreSQL",
      status: "success",
      message: "Database connection successful",
      responseTime,
    };
  } catch (error) {
    return {
      service: "PostgreSQL",
      status: "failure",
      message: "Failed to connect to database",
      error: sanitize(error instanceof Error ? error.message : String(error)),
    };
  }
}

/**
 * Test Redis connectivity
 */
async function testRedis(): Promise<TestResult> {
  const redisHost = process.env.REDIS_HOST;
  const redisPort = process.env.REDIS_PORT;

  if (!redisHost || !redisPort) {
    return {
      service: "Redis",
      status: "skipped",
      message: "REDIS_HOST or REDIS_PORT not configured",
    };
  }

  const startTime = Date.now();

  try {
    // Dynamic import to handle ESM module
    const Redis = await import("ioredis");
    const redis = new Redis.default({
      host: redisHost,
      port: parseInt(redisPort),
      password: process.env.REDIS_PASSWORD || undefined,
      connectTimeout: 10000,
      lazyConnect: true,
    });

    await redis.connect();
    await redis.ping();
    await redis.disconnect();

    const responseTime = Date.now() - startTime;

    return {
      service: "Redis",
      status: "success",
      message: "Redis connection successful",
      responseTime,
    };
  } catch (error) {
    return {
      service: "Redis",
      status: "failure",
      message: "Failed to connect to Redis",
      error: sanitize(error instanceof Error ? error.message : String(error)),
    };
  }
}

/**
 * Test Discord API connectivity
 */
async function testDiscord(): Promise<TestResult> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!webhookUrl && !botToken) {
    return {
      service: "Discord",
      status: "skipped",
      message: "DISCORD_WEBHOOK_URL or DISCORD_BOT_TOKEN not configured",
    };
  }

  const startTime = Date.now();

  try {
    let response: Response;

    if (botToken) {
      // Test bot API endpoint
      response = await fetchWithTimeout(
        "https://discord.com/api/v10/users/@me",
        {
          headers: {
            Authorization: `Bot ${botToken}`,
          },
        },
      );
    } else if (webhookUrl) {
      // Test webhook endpoint with a GET request (doesn't post anything)
      response = await fetchWithTimeout(webhookUrl);
    } else {
      throw new Error("No valid Discord credentials");
    }

    const responseTime = Date.now() - startTime;

    if (response.ok || response.status === 405) {
      // 405 is acceptable for webhook GET requests
      return {
        service: "Discord",
        status: "success",
        message: "Discord API accessible",
        responseTime,
      };
    } else {
      return {
        service: "Discord",
        status: "failure",
        message: `Discord API returned status ${response.status}`,
        error: sanitize(await response.text()),
      };
    }
  } catch (error) {
    return {
      service: "Discord",
      status: "failure",
      message: "Failed to reach Discord API",
      error: sanitize(error instanceof Error ? error.message : String(error)),
    };
  }
}

/**
 * Test Render API connectivity
 */
async function testRender(): Promise<TestResult> {
  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return {
      service: "Render",
      status: "skipped",
      message: "RENDER_API_KEY not configured",
    };
  }

  const startTime = Date.now();

  try {
    const response = await fetchWithTimeout(
      "https://api.render.com/v1/services",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      },
    );

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        service: "Render",
        status: "success",
        message: "Render API accessible",
        responseTime,
      };
    } else {
      return {
        service: "Render",
        status: "failure",
        message: `Render API returned status ${response.status}`,
        error: sanitize(await response.text()),
      };
    }
  } catch (error) {
    return {
      service: "Render",
      status: "failure",
      message: "Failed to reach Render API",
      error: sanitize(error instanceof Error ? error.message : String(error)),
    };
  }
}

/**
 * Test Linear API connectivity
 */
async function testLinear(): Promise<TestResult> {
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return {
      service: "Linear",
      status: "skipped",
      message: "LINEAR_API_KEY not configured",
    };
  }

  const startTime = Date.now();

  try {
    const response = await fetchWithTimeout("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "{ viewer { id name } }",
      }),
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      if (data.data?.viewer) {
        return {
          service: "Linear",
          status: "success",
          message: "Linear API accessible",
          responseTime,
        };
      } else {
        return {
          service: "Linear",
          status: "failure",
          message: "Linear API returned unexpected response",
          error: sanitize(JSON.stringify(data)),
        };
      }
    } else {
      return {
        service: "Linear",
        status: "failure",
        message: `Linear API returned status ${response.status}`,
        error: sanitize(await response.text()),
      };
    }
  } catch (error) {
    return {
      service: "Linear",
      status: "failure",
      message: "Failed to reach Linear API",
      error: sanitize(error instanceof Error ? error.message : String(error)),
    };
  }
}

/**
 * Test NeonDB API connectivity
 */
async function testNeonDB(): Promise<TestResult> {
  const apiKey = process.env.NEON_API_KEY;

  if (!apiKey) {
    return {
      service: "NeonDB",
      status: "skipped",
      message: "NEON_API_KEY not configured",
    };
  }

  const startTime = Date.now();

  try {
    const response = await fetchWithTimeout(
      "https://console.neon.tech/api/v2/projects",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      },
    );

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        service: "NeonDB",
        status: "success",
        message: "NeonDB API accessible",
        responseTime,
      };
    } else {
      return {
        service: "NeonDB",
        status: "failure",
        message: `NeonDB API returned status ${response.status}`,
        error: sanitize(await response.text()),
      };
    }
  } catch (error) {
    return {
      service: "NeonDB",
      status: "failure",
      message: "Failed to reach NeonDB API",
      error: sanitize(error instanceof Error ? error.message : String(error)),
    };
  }
}

/**
 * Test GitHub API connectivity
 */
async function testGitHub(): Promise<TestResult> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return {
      service: "GitHub",
      status: "skipped",
      message: "GITHUB_TOKEN not configured",
    };
  }

  const startTime = Date.now();

  try {
    const response = await fetchWithTimeout("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        service: "GitHub",
        status: "success",
        message: "GitHub API accessible",
        responseTime,
      };
    } else {
      return {
        service: "GitHub",
        status: "failure",
        message: `GitHub API returned status ${response.status}`,
        error: sanitize(await response.text()),
      };
    }
  } catch (error) {
    return {
      service: "GitHub",
      status: "failure",
      message: "Failed to reach GitHub API",
      error: sanitize(error instanceof Error ? error.message : String(error)),
    };
  }
}

/**
 * Generate markdown report from test results
 */
function generateReport(results: TestResult[]): string {
  const date = new Date().toISOString().split("T")[0];
  const timestamp = new Date().toISOString();

  let report = `# Integration Status Report\n\n`;
  report += `**Date**: ${date}\n`;
  report += `**Generated**: ${timestamp}\n\n`;

  // Summary
  const successCount = results.filter((r) => r.status === "success").length;
  const failureCount = results.filter((r) => r.status === "failure").length;
  const skippedCount = results.filter((r) => r.status === "skipped").length;

  report += `## Summary\n\n`;
  report += `- ✅ Successful: ${successCount}\n`;
  report += `- ❌ Failed: ${failureCount}\n`;
  report += `- ⏭️ Skipped: ${skippedCount}\n`;
  report += `- 📊 Total: ${results.length}\n\n`;

  // Overall status
  const overallStatus = failureCount === 0 ? "✅ PASSING" : "❌ FAILING";
  report += `## Overall Status: ${overallStatus}\n\n`;

  // Detailed results
  report += `## Detailed Results\n\n`;

  for (const result of results) {
    const statusEmoji =
      result.status === "success"
        ? "✅"
        : result.status === "failure"
          ? "❌"
          : "⏭️";

    report += `### ${statusEmoji} ${result.service}\n\n`;
    report += `**Status**: ${result.status.toUpperCase()}\n`;
    report += `**Message**: ${result.message}\n`;

    if (result.responseTime !== undefined) {
      report += `**Response Time**: ${result.responseTime}ms\n`;
    }

    if (result.error) {
      report += `**Error**: \`${result.error}\`\n`;
    }

    report += `\n`;
  }

  report += `---\n\n`;
  report += `*This report was generated automatically by the integration test script.*\n`;

  return report;
}

/**
 * Load environment variables from .env file if it exists
 */
async function loadEnvFile() {
  const envPath = join(__dirname, "../api/.env");
  if (existsSync(envPath)) {
    try {
      const dotenv = await import("dotenv");
      dotenv.config({ path: envPath });
    } catch {
      // dotenv not available - use environment variables directly
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  // Load environment variables
  await loadEnvFile();

  console.log("🚀 Starting integration tests...\n");

  const results: TestResult[] = [];

  // Run all tests
  console.log("Testing PostgreSQL...");
  results.push(await testPostgreSQL());

  console.log("Testing Redis...");
  results.push(await testRedis());

  console.log("Testing Discord...");
  results.push(await testDiscord());

  console.log("Testing Render...");
  results.push(await testRender());

  console.log("Testing Linear...");
  results.push(await testLinear());

  console.log("Testing NeonDB...");
  results.push(await testNeonDB());

  console.log("Testing GitHub...");
  results.push(await testGitHub());

  console.log("\n✅ All tests completed!\n");

  // Print summary to console
  console.log("Summary:");
  console.log(
    `- Successful: ${results.filter((r) => r.status === "success").length}`,
  );
  console.log(
    `- Failed: ${results.filter((r) => r.status === "failure").length}`,
  );
  console.log(
    `- Skipped: ${results.filter((r) => r.status === "skipped").length}`,
  );

  // Generate report
  const report = generateReport(results);
  const date = new Date().toISOString().split("T")[0];
  const reportFilename = `Integration-Status-${date}.md`;

  // Create output directory at the root of the repository
  const repoRoot = join(__dirname, "..");
  const outputDir = join(repoRoot, "DailyIntegrationTestResult");
  mkdirSync(outputDir, { recursive: true });

  // Write report
  const reportPath = join(outputDir, reportFilename);
  writeFileSync(reportPath, report, "utf-8");

  console.log(`\n📄 Report generated: ${reportPath}`);

  // Exit with error code if any tests failed
  const hasFailures = results.some((r) => r.status === "failure");
  if (hasFailures) {
    console.error("\n❌ Some integration tests failed!");
    process.exit(1);
  } else {
    console.log("\n✅ All integration tests passed!");
    process.exit(0);
  }
}

// Run main function
main().catch((error) => {
  console.error("Fatal error:", sanitize(error.message));
  process.exit(1);
});
