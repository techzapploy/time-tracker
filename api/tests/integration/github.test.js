import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

describe('GitHub connectivity', () => {
  it('can reach GitHub API', async () => {
    // GitHub API is publicly accessible for some endpoints without auth
    const response = await fetch('https://api.github.com/', {
      headers: {
        'User-Agent': 'integration-test',
        Accept: 'application/vnd.github.v3+json',
        ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
      },
    });
    assert.ok(
      response.status < 500,
      `Expected non-5xx response from GitHub API, got ${response.status}`
    );
    console.log(`  GitHub API reachable (status: ${response.status})`);
  });

  it('skips authenticated GitHub operations if no token configured', async (t) => {
    if (!GITHUB_TOKEN) {
      t.skip('No GITHUB_TOKEN configured - skipping authenticated tests');
      return;
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'integration-test',
        Accept: 'application/vnd.github.v3+json',
      },
    });
    assert.equal(response.status, 200, `Expected 200 from /user endpoint, got ${response.status}`);
    const data = await response.json();
    assert.ok(data.login, 'Expected login field in response');
    console.log(`  GitHub authenticated as: ${data.login}`);
  });
});
