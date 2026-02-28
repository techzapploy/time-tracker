import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

const { Client } = pg;

interface TestResult {
  service: string;
  status: 'pass' | 'fail';
  message: string;
  timestamp: string;
}

function sanitizeError(message: string): string {
  return message
    .replace(/Bearer\s+[^\s"']*/gi, 'Bearer ****')
    .replace(/token=[^\s&"']*/gi, 'token=****')
    .replace(/api_key=[^\s&"']*/gi, 'api_key=****')
    .replace(/password=[^\s&"']*/gi, 'password=****')
    .replace(/:([^@\s]+)@/g, ':****@');
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function testDiscord(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!webhookUrl && !botToken) {
    return {
      service: 'Discord',
      status: 'fail',
      message: 'No Discord credentials configured (DISCORD_WEBHOOK_URL or DISCORD_BOT_TOKEN)',
      timestamp,
    };
  }

  try {
    if (webhookUrl) {
      const response = await fetchWithTimeout(webhookUrl, { method: 'GET' }, 10000);
      if (response.ok || response.status === 405) {
        return { service: 'Discord', status: 'pass', message: 'Discord webhook URL is accessible', timestamp };
      }
      return { service: 'Discord', status: 'fail', message: `Discord webhook returned status ${response.status}`, timestamp };
    }

    if (botToken) {
      const response = await fetchWithTimeout(
        'https://discord.com/api/v10/users/@me',
        { method: 'GET', headers: { Authorization: `Bot ${botToken}` } },
        10000
      );
      if (response.ok) {
        const data = await response.json() as { username?: string };
        return { service: 'Discord', status: 'pass', message: `Discord bot connected as ${data.username ?? 'unknown'}`, timestamp };
      }
      return { service: 'Discord', status: 'fail', message: `Discord API returned status ${response.status}`, timestamp };
    }

    return { service: 'Discord', status: 'fail', message: 'No Discord credentials available', timestamp };
  } catch (error) {
    return { service: 'Discord', status: 'fail', message: sanitizeError(String(error)), timestamp };
  }
}

async function testRender(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return { service: 'Render', status: 'fail', message: 'No Render API key configured (RENDER_API_KEY)', timestamp };
  }

  try {
    const response = await fetchWithTimeout(
      'https://api.render.com/v1/services',
      { method: 'GET', headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } },
      10000
    );

    if (response.ok) {
      return { service: 'Render', status: 'pass', message: 'Render API is accessible', timestamp };
    }
    return { service: 'Render', status: 'fail', message: `Render API returned status ${response.status}`, timestamp };
  } catch (error) {
    return { service: 'Render', status: 'fail', message: sanitizeError(String(error)), timestamp };
  }
}

async function testLinear(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return { service: 'Linear', status: 'fail', message: 'No Linear API key configured (LINEAR_API_KEY)', timestamp };
  }

  try {
    const response = await fetchWithTimeout(
      'https://api.linear.app/graphql',
      {
        method: 'POST',
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: '{ viewer { id name email } }' }),
      },
      10000
    );

    if (response.ok) {
      const data = await response.json() as { data?: { viewer?: { name?: string } } };
      const name = data.data?.viewer?.name ?? 'unknown';
      return { service: 'Linear', status: 'pass', message: `Linear API connected as ${name}`, timestamp };
    }
    return { service: 'Linear', status: 'fail', message: `Linear API returned status ${response.status}`, timestamp };
  } catch (error) {
    return { service: 'Linear', status: 'fail', message: sanitizeError(String(error)), timestamp };
  }
}

async function testNeonDB(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return { service: 'NeonDB', status: 'fail', message: 'No database URL configured (DATABASE_URL)', timestamp };
  }

  const client = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 10000 });

  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return { service: 'NeonDB', status: 'pass', message: 'PostgreSQL connection successful', timestamp };
  } catch (error) {
    try { await client.end(); } catch { /* ignore */ }
    return { service: 'NeonDB', status: 'fail', message: sanitizeError(String(error)), timestamp };
  }
}

async function testGitHub(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return { service: 'GitHub', status: 'fail', message: 'No GitHub token configured (GITHUB_TOKEN)', timestamp };
  }

  try {
    const response = await fetchWithTimeout(
      'https://api.github.com/repos/techzapploy/time-tracker',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'time-tracker-integration-test',
        },
      },
      10000
    );

    if (response.ok) {
      return { service: 'GitHub', status: 'pass', message: 'GitHub API is accessible', timestamp };
    }
    return { service: 'GitHub', status: 'fail', message: `GitHub API returned status ${response.status}`, timestamp };
  } catch (error) {
    return { service: 'GitHub', status: 'fail', message: sanitizeError(String(error)), timestamp };
  }
}

function generateMarkdownReport(results: TestResult[], reportDate: string): string {
  const generatedAt = new Date().toISOString();
  const total = results.length;
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = total - passed;

  const rows = results
    .map((r) => {
      const icon = r.status === 'pass' ? '✅' : '❌';
      return `| ${r.service} | ${icon} ${r.status} | ${r.message} | ${r.timestamp} |`;
    })
    .join('\n');

  return `# Daily Integration Test Report

**Date:** ${reportDate}
**Generated:** ${generatedAt}

## Summary

- **Total:** ${total}
- **Passed:** ${passed}
- **Failed:** ${failed}

## Test Results

| Service | Status | Message | Timestamp |
|---------|--------|---------|-----------|
${rows}
`;
}

async function main(): Promise<void> {
  console.log('Running integration tests...');

  const results = await Promise.all([
    testDiscord(),
    testRender(),
    testLinear(),
    testNeonDB(),
    testGitHub(),
  ]);

  results.forEach((r) => {
    const icon = r.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${r.service}: ${r.message}`);
  });

  const reportDate = new Date().toISOString().split('T')[0];
  const reportDir = join(process.cwd(), '..', 'DailyIntegrationTestResult');
  const reportPath = join(reportDir, `Integration-Status-${reportDate}.md`);

  mkdirSync(reportDir, { recursive: true });
  const report = generateMarkdownReport(results, reportDate);
  writeFileSync(reportPath, report, 'utf-8');

  console.log(`\nReport written to: ${reportPath}`);

  const failed = results.filter((r) => r.status === 'fail').length;
  if (failed > 0) {
    console.log(`\n${failed} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('\nAll tests passed!');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Fatal error:', sanitizeError(String(error)));
  process.exit(1);
});
