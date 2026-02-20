# Time Tracker Integration Tests

Automated daily integration tests for verifying external service connections in the time-tracker project.

## Overview

This test suite validates connectivity and authentication for 6 critical external services:

1. **Discord** - Communication and notifications
2. **Render** - Application hosting platform
3. **Linear** - Project management and issue tracking
4. **NeonDB** - PostgreSQL database hosting
5. **GitHub** - Version control and repository management
6. **Sentry** - Error tracking and monitoring

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Access to all required service credentials

### Installation

```bash
cd scripts
npm install
```

## Environment Variables

The following environment variables must be configured for the tests to run:

### Discord
One of the following:
- `DISCORD_WEBHOOK_URL` - Discord webhook URL for sending messages
- `DISCORD_BOT_TOKEN` - Discord bot token for API authentication

### Render
- `RENDER_API_KEY` - API key from Render dashboard

### Linear
- `LINEAR_API_KEY` - Personal API key from Linear settings

### NeonDB
- `DATABASE_URL` - PostgreSQL connection string from Neon console

### GitHub
- `GITHUB_TOKEN` - GitHub personal access token or provided by GitHub Actions

### Sentry
One of the following:
- `SENTRY_DSN` - Data Source Name from Sentry project settings
- `SENTRY_AUTH_TOKEN` - Authentication token from Sentry account settings

### Example .env File

```bash
# Discord (choose one)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
# DISCORD_BOT_TOKEN=your_bot_token

# Render
RENDER_API_KEY=your_render_api_key

# Linear
LINEAR_API_KEY=your_linear_api_key

# NeonDB
DATABASE_URL=postgresql://user:password@host/database

# GitHub
GITHUB_TOKEN=your_github_token

# Sentry (choose one)
SENTRY_DSN=https://key@host/project
# SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

## Running Tests

### Local Execution

```bash
cd scripts
npm test
```

### Manual Workflow Trigger

Go to the GitHub Actions tab in your repository and manually trigger the "Daily Integration Test" workflow.

## Automated Workflow

The integration tests run automatically via GitHub Actions:

- **Schedule**: Daily at 00:00 UTC
- **Trigger**: Can be manually triggered via workflow_dispatch
- **Report**: Automatically committed to `DailyIntegrationTestResult/`

### Workflow Configuration

File: `.github/workflows/daily-integration-test.yml`

The workflow:
1. Checks out the repository
2. Sets up Node.js 18
3. Installs dependencies from `scripts/`
4. Runs integration tests with environment variables from GitHub Secrets
5. Commits the generated report (if changes exist)

## Report Format

Reports are generated in markdown format with the naming convention:
`Integration-Status-YYYY-MM-DD.md`

### Sample Report

```markdown
# Integration Status Report - 2026-02-20

Generated: 2026-02-20T00:00:00.000Z

## Summary
- Total: 6
- Passed: 5
- Failed: 1

## Test Results

### Discord
- Status: ✅ Pass
- Message: Webhook connection successful
- Timestamp: 2026-02-20T00:00:01.234Z

### Render
- Status: ✅ Pass
- Message: API connection successful
- Timestamp: 2026-02-20T00:00:02.345Z

### Linear
- Status: ✅ Pass
- Message: GraphQL API connection successful
- Timestamp: 2026-02-20T00:00:03.456Z

### NeonDB
- Status: ✅ Pass
- Message: Database connection successful
- Timestamp: 2026-02-20T00:00:04.567Z

### GitHub
- Status: ✅ Pass
- Message: API connection successful
- Timestamp: 2026-02-20T00:00:05.678Z

### Sentry
- Status: ❌ Fail
- Message: Missing SENTRY_DSN or SENTRY_AUTH_TOKEN
- Timestamp: 2026-02-20T00:00:06.789Z
```

## Security

### Credential Sanitization

All error messages are automatically sanitized to prevent credential leakage:

- Bearer tokens are replaced with `[REDACTED]`
- API keys in query parameters are masked
- Passwords in connection strings are hidden
- PostgreSQL connection strings are sanitized
- Sentry DSN keys are redacted
- Authorization headers are masked

### Example Sanitization

Before:
```
Error: Connection failed with postgresql://user:secret@host/db
```

After:
```
Error: Connection failed with postgresql://[REDACTED]
```

## API Testing Strategy

### Discord
- **Webhook**: POST test message to webhook URL
- **Bot Token**: GET `/users/@me` endpoint to validate token
- **Timeout**: 10 seconds

### Render
- **Method**: GET request to `/v1/services`
- **Auth**: Bearer token in Authorization header
- **Validation**: HTTP 200 status code
- **Timeout**: 10 seconds

### Linear
- **Method**: POST GraphQL query to `/graphql`
- **Query**: `{ viewer { id name } }` to test authentication
- **Auth**: API key in Authorization header
- **Validation**: Valid response with viewer data
- **Timeout**: 10 seconds

### NeonDB
- **Method**: Direct PostgreSQL connection
- **Query**: `SELECT 1` to verify connectivity
- **Validation**: Query returns results
- **Timeout**: 10 seconds

### GitHub
- **Method**: GET request to repository API
- **Endpoint**: `/repos/techzapploy/time-tracker`
- **Auth**: Bearer token in Authorization header
- **Validation**: HTTP 200 status code
- **Timeout**: 10 seconds

### Sentry
- **DSN Mode**: Validates DSN format matches `https://<key>@<host>/<project>`
- **Token Mode**: GET request to `/api/0/organizations/`
- **Auth**: Bearer token in Authorization header
- **Validation**: HTTP 200 status code or valid DSN format
- **Timeout**: 10 seconds

## Troubleshooting

### Tests Failing Locally

1. **Check environment variables**: Ensure all required variables are set
   ```bash
   echo $DISCORD_WEBHOOK_URL
   echo $RENDER_API_KEY
   # etc.
   ```

2. **Verify credentials**: Test credentials directly using curl or API clients

3. **Check network connectivity**: Ensure you can reach external services

4. **Review error messages**: Check the sanitized error messages in console output

### Workflow Failures

1. **GitHub Secrets**: Verify all secrets are configured in repository settings
2. **Permissions**: Ensure workflow has `contents: write` permission
3. **Node version**: Confirm Node.js 18 is being used
4. **Dependencies**: Check if npm install completed successfully

### Common Issues

**Error: Missing GITHUB_TOKEN**
- Solution: GitHub automatically provides this in Actions; check workflow permissions

**Error: Connection timeout**
- Solution: Service may be temporarily unavailable; check service status pages

**Error: Invalid credentials**
- Solution: Regenerate API keys/tokens and update secrets

**Error: Database connection refused**
- Solution: Verify DATABASE_URL format and NeonDB instance is running

**Error: Invalid SENTRY_DSN format**
- Solution: Ensure DSN matches pattern `https://<key>@<host>/<project>`

**Error: Sentry API returned status 401**
- Solution: Regenerate SENTRY_AUTH_TOKEN with proper permissions

## Development

### Adding New Tests

1. Create a new test function following the pattern:
   ```typescript
   async function testNewService(): Promise<TestResult> {
     const timestamp = new Date().toISOString();
     try {
       // Test logic here
       return { service: 'ServiceName', status: 'pass', message: '...', timestamp };
     } catch (error) {
       return { service: 'ServiceName', status: 'fail', message: sanitizeError(...), timestamp };
     }
   }
   ```

2. Add the test to the `tests` array in `main()`

3. Update the total count in the Summary section

4. Document the new service in this README

### Modifying Timeout

Change the default timeout (10 seconds) in `fetchWithTimeout()`:
```typescript
await fetchWithTimeout(url, options, 15000); // 15 seconds
```

### Customizing Report Format

Modify the report generation in the `main()` function after test execution.

## License

MIT
