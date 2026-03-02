import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const RENDER_API_KEY = process.env.RENDER_API_KEY;

describe('Render connectivity', () => {
  it('can reach Render API', async () => {
    // Test basic connectivity to Render's API
    const response = await fetch('https://api.render.com/v1/owners', {
      headers: {
        Accept: 'application/json',
        ...(RENDER_API_KEY ? { Authorization: `Bearer ${RENDER_API_KEY}` } : {}),
      },
    });
    // Without auth we expect 401, either way proves connectivity
    assert.ok(
      response.status < 500,
      `Expected non-5xx response from Render API, got ${response.status}`
    );
    console.log(`  Render API reachable (status: ${response.status})`);
  });

  it('skips authenticated Render operations if no API key configured', async (t) => {
    if (!RENDER_API_KEY) {
      t.skip('No RENDER_API_KEY configured - skipping authenticated tests');
      return;
    }

    const response = await fetch('https://api.render.com/v1/services', {
      headers: {
        Authorization: `Bearer ${RENDER_API_KEY}`,
        Accept: 'application/json',
      },
    });
    assert.equal(
      response.status,
      200,
      `Expected 200 from Render services endpoint, got ${response.status}`
    );
    const data = await response.json();
    assert.ok(Array.isArray(data), 'Expected array response from Render services');
    console.log(`  Render API authenticated successfully, found ${data.length} service(s)`);
  });
});
