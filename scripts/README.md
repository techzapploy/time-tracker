# Integration Test Scripts

This directory contains the daily integration test system for the time-tracker project.

## Overview

The integration test system verifies connectivity to 5 third-party services:

1. **Discord** - Webhook or Bot API
2. **Render** - Deployment platform API
3. **Linear** - Project management API
4. **NeonDB** - PostgreSQL database
5. **GitHub** - Repository API

## Setup

### Install Dependencies

```bash
cd scripts
npm install
```

### Environment Variables

The following environment variables need to be configured:

- `DISCORD_WEBHOOK_URL` or `DISCORD_BOT_TOKEN` - Discord webhook URL or bot token
- `RENDER_API_KEY` - Render API key
- `LINEAR_API_KEY` - Linear API key
- `DATABASE_URL` - NeonDB PostgreSQL connection string
- `GITHUB_TOKEN` - GitHub personal access token

## Running Tests Locally

```bash
cd scripts
npx tsx integration-test.ts
```

Or using npm:

```bash
cd scripts
npm test
```

## Automated Daily Tests

The tests run automatically daily at 00:00 UTC via GitHub Actions (`.github/workflows/daily-integration-test.yml`).

### Workflow Features

- Runs on a daily schedule (cron: '0 0 * * *')
- Can be manually triggered via workflow_dispatch
- Automatically commits and pushes test reports
- Reports are saved to `DailyIntegrationTestResult/Integration-Status-YYYY-MM-DD.md`

### Manual Trigger

You can manually trigger the workflow from the GitHub Actions tab:
1. Go to Actions → Daily Integration Test
2. Click "Run workflow"
3. Select the branch and click "Run workflow"

## Test Output

Each test generates a markdown report with:

- Summary of passed/failed tests
- Individual test results with status, message, and timestamp
- All error messages are sanitized to remove credentials

### Report Format

```markdown
# Integration Status Report - YYYY-MM-DD

Generated: [ISO timestamp]

## Summary
- Total: 5
- Passed: X
- Failed: Y

## Test Results

### Service Name
- Status: ✅ Pass / ❌ Fail
- Message: [details]
- Timestamp: [ISO timestamp]
```

## Security

- All error messages are sanitized to remove API keys, tokens, and passwords
- Credentials are never logged in full
- Each request has a 10-second timeout to prevent hanging

## API Testing Strategy

### Discord
- If `DISCORD_WEBHOOK_URL` is set: GET the webhook info
- If `DISCORD_BOT_TOKEN` is set: GET https://discord.com/api/v10/users/@me

### Render
- GET https://api.render.com/v1/services
- Authorization: Bearer token

### Linear
- POST https://api.linear.app/graphql
- Query: `{ viewer { id name email } }`

### NeonDB
- Connect using pg library with DATABASE_URL
- Execute: `SELECT 1`

### GitHub
- GET https://api.github.com/repos/techzapploy/time-tracker
- Authorization: Bearer token
- User-Agent: time-tracker-integration-test

## Troubleshooting

### Test Failures

If a test fails, check:
1. The environment variable is correctly set
2. The API key/token has the necessary permissions
3. The service is not experiencing an outage
4. Network connectivity is available

### Timeout Errors

If tests timeout, the service may be:
- Experiencing high latency
- Temporarily unavailable
- Behind a firewall blocking the connection

## Development

### Adding New Tests

To add a new service test:

1. Create a new test function following the pattern:
```typescript
async function testServiceName(): Promise<TestResult> {
  const timestamp = new Date().toISOString();
  // ... test implementation
  return {
    service: 'ServiceName',
    status: 'pass' | 'fail',
    message: 'Details about the test',
    timestamp,
  };
}
```

2. Add the test to the Promise.all array in the main function
3. Update this README with the new service details

### Modifying Test Logic

When modifying test logic, ensure:
- All credentials are sanitized in error messages
- Timeouts are set (default: 10 seconds)
- Clear success/failure messages are provided
- The TestResult interface is followed
