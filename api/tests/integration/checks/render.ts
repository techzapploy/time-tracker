/**
 * Render Integration Check
 *
 * Verifies the Render API key is valid by calling the Render REST API.
 * Skips gracefully if RENDER_API_KEY is not set.
 */

import type { CheckResult } from '../runner.js';

export async function checkRender(): Promise<CheckResult> {
  const name = 'Render';

  const apiKey = process.env.RENDER_API_KEY || process.env.RENDER_TOKEN;

  if (!apiKey) {
    return {
      name,
      status: 'skipped',
      message: 'RENDER_API_KEY not set - skipping Render check',
      durationMs: 0,
    };
  }

  try {
    const response = await fetch('https://api.render.com/v1/owners?limit=1', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const data = (await response.json()) as Array<{ owner?: { name?: string; email?: string } }>;
      const owner = data[0]?.owner;
      return {
        name,
        status: 'passed',
        message: `Connected to Render as "${owner?.name || owner?.email || 'unknown'}"`,
        durationMs: 0,
      };
    } else {
      const errorText = await response.text();
      return {
        name,
        status: 'failed',
        message: `Render API returned ${response.status}`,
        durationMs: 0,
        error: errorText,
      };
    }
  } catch (err) {
    return {
      name,
      status: 'failed',
      message: 'Failed to reach Render API',
      durationMs: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
