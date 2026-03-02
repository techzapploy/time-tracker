import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;

describe('Linear connectivity', () => {
  it('can reach Linear API endpoint', async () => {
    // Test basic connectivity to Linear's GraphQL API
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(LINEAR_API_KEY ? { Authorization: LINEAR_API_KEY } : {}),
      },
      body: JSON.stringify({
        query: '{ __typename }',
      }),
    });
    // Without auth we expect 401, with bad/no key we expect 400 or 401
    // Either way it proves connectivity
    assert.ok(
      response.status < 500,
      `Expected non-5xx response from Linear API, got ${response.status}`
    );
    console.log(`  Linear API reachable (status: ${response.status})`);
  });

  it('skips authenticated Linear operations if no API key configured', async (t) => {
    if (!LINEAR_API_KEY) {
      t.skip('No LINEAR_API_KEY configured - skipping authenticated tests');
      return;
    }

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: LINEAR_API_KEY,
      },
      body: JSON.stringify({
        query: '{ viewer { id name email } }',
      }),
    });
    assert.equal(response.status, 200, `Expected 200 from Linear API, got ${response.status}`);
    const data = await response.json();
    assert.ok(!data.errors, `Expected no errors, got: ${JSON.stringify(data.errors)}`);
    console.log(`  Linear authenticated as: ${data.data?.viewer?.name || 'unknown'}`);
  });
});
