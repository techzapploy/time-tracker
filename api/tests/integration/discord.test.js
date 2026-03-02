import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

describe('Discord connectivity', () => {
  it('skips if no Discord credentials are configured', async (t) => {
    if (!DISCORD_BOT_TOKEN && !DISCORD_WEBHOOK_URL) {
      t.skip('No Discord credentials (DISCORD_BOT_TOKEN or DISCORD_WEBHOOK_URL) configured - skipping');
      return;
    }

    // If we have a webhook URL, test it
    if (DISCORD_WEBHOOK_URL) {
      const response = await fetch(`${DISCORD_WEBHOOK_URL}?wait=true`, {
        method: 'GET',
      });
      // Discord webhooks return 200 or 401 on GET; either means connectivity works
      assert.ok(
        response.status < 500,
        `Expected non-5xx response from Discord webhook endpoint, got ${response.status}`
      );
      console.log(`  Discord webhook endpoint reachable (status: ${response.status})`);
    }

    // If we have a bot token, test the API
    if (DISCORD_BOT_TOKEN) {
      const response = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      });
      assert.ok(
        response.status !== 500,
        `Expected non-500 response from Discord API, got ${response.status}`
      );
      if (response.status === 200) {
        const data = await response.json();
        console.log(`  Discord bot connected: ${data.username}`);
      } else {
        console.log(`  Discord API response status: ${response.status}`);
      }
    }
  });
});
