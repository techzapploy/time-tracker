/**
 * GitHub Integration Check
 *
 * Verifies the GitHub token is valid by calling the GitHub REST API.
 * Skips gracefully if GITHUB_TOKEN is not set.
 */

import type { CheckResult } from '../runner.js';

export async function checkGitHub(): Promise<CheckResult> {
  const name = 'GitHub';

  const token =
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_ACCESS_TOKEN ||
    process.env.GH_TOKEN;

  if (!token) {
    return {
      name,
      status: 'skipped',
      message: 'GITHUB_TOKEN not set - skipping GitHub check',
      durationMs: 0,
    };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const data = (await response.json()) as { login: string; name: string; type: string };
      return {
        name,
        status: 'passed',
        message: `Authenticated as "${data.login}" (${data.type})`,
        durationMs: 0,
      };
    } else {
      const errorText = await response.text();
      return {
        name,
        status: 'failed',
        message: `GitHub API returned ${response.status}`,
        durationMs: 0,
        error: errorText,
      };
    }
  } catch (err) {
    return {
      name,
      status: 'failed',
      message: 'Failed to reach GitHub API',
      durationMs: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
