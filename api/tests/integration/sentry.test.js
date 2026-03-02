import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const SENTRY_ORG = process.env.SENTRY_ORG;

describe('Sentry connectivity', () => {
  it('can reach Sentry API', async () => {
    // Test basic connectivity to Sentry's API
    const response = await fetch('https://sentry.io/api/0/', {
      headers: {
        Accept: 'application/json',
        ...(SENTRY_AUTH_TOKEN ? { Authorization: `Bearer ${SENTRY_AUTH_TOKEN}` } : {}),
      },
    });
    // Without auth we expect 401, with auth we expect 200
    assert.ok(
      response.status < 500,
      `Expected non-5xx response from Sentry API, got ${response.status}`
    );
    console.log(`  Sentry API reachable (status: ${response.status})`);
  });

  it('skips authenticated Sentry operations if no credentials configured', async (t) => {
    if (!SENTRY_AUTH_TOKEN) {
      t.skip('No SENTRY_AUTH_TOKEN configured - skipping authenticated tests');
      return;
    }

    const url = SENTRY_ORG
      ? `https://sentry.io/api/0/organizations/${SENTRY_ORG}/`
      : 'https://sentry.io/api/0/organizations/';

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
        Accept: 'application/json',
      },
    });
    assert.ok(
      response.status < 400,
      `Expected successful response from Sentry organizations endpoint, got ${response.status}`
    );
    console.log(`  Sentry API authenticated successfully`);
  });

  it('skips DSN validation if no SENTRY_DSN configured', async (t) => {
    if (!SENTRY_DSN) {
      t.skip('No SENTRY_DSN configured - skipping DSN validation');
      return;
    }

    // Validate DSN format: https://<key>@<org>.ingest.sentry.io/<project-id>
    const dsnPattern = /^https?:\/\/[^@]+@[^/]+\/\d+$/;
    assert.ok(dsnPattern.test(SENTRY_DSN), `SENTRY_DSN does not match expected format: ${SENTRY_DSN}`);
    console.log('  SENTRY_DSN format is valid');
  });
});
