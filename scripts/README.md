# Integration Test Scripts

This directory contains automation scripts for the project.

## Integration Test

The `integration-test.ts` script verifies connectivity to all external services used by the application.

### Services Checked

- **PostgreSQL**: Database connectivity (using `DATABASE_URL`)
- **Redis**: Cache connectivity (using `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`)
- **Discord**: Communication API (using `DISCORD_WEBHOOK_URL` or `DISCORD_BOT_TOKEN`)
- **Render**: Hosting platform API (using `RENDER_API_KEY`)
- **Linear**: Issue tracking API (using `LINEAR_API_KEY`)
- **NeonDB**: Database management API (using `NEON_API_KEY`)
- **GitHub**: Repository API (using `GITHUB_TOKEN`)

### Running Locally

```bash
# From the api directory
cd api
npm run integration-test

# Or from the root directory
npm run integration-test --prefix api
```

### Environment Variables

Configure the following environment variables in your `.env` file (or set them in your environment):

```bash
# Required for database testing
DATABASE_URL=postgresql://user:password@host:port/database

# Required for Redis testing
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional

# Optional external service API keys
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_BOT_TOKEN=Bot_token_here
RENDER_API_KEY=rnd_...
LINEAR_API_KEY=lin_api_...
NEON_API_KEY=neon_api_...
GITHUB_TOKEN=ghp_...
```

**Note**: If a service's credentials are not configured, the test for that service will be skipped gracefully.

### Output

The script generates a markdown report in the following location:

```
DailyIntegrationTestResult/Integration-Status-YYYY-MM-DD.md
```

The report includes:

- Summary of test results (success, failure, skipped counts)
- Overall status
- Detailed results for each service including response times
- Error messages (with credentials sanitized)

### Security

The script automatically sanitizes all credentials from logs and error messages to prevent accidental exposure of sensitive information.

### GitHub Actions

The integration test runs automatically every day at 00:00 UTC via GitHub Actions (`.github/workflows/daily-integration-test.yml`). The workflow:

1. Runs the integration test
2. Generates a markdown report
3. Commits the report to the `DailyIntegrationTestResult/` directory
4. Uploads the report as a workflow artifact

### Exit Codes

- `0`: All tests passed (or were skipped)
- `1`: One or more tests failed
