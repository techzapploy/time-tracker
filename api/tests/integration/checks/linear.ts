import { type ServiceCheckResult, sanitizeError, fetchWithTimeout } from './types.js';

export async function checkLinear(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'linear';

  const linearApiKey = process.env['LINEAR_API_KEY'];

  if (!linearApiKey) {
    return {
      service,
      status: 'skip',
      message: 'Skipped: LINEAR_API_KEY is unset',
      timestamp,
    };
  }

  try {
    const response = await fetchWithTimeout('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: linearApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ viewer { id } }',
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as { data?: { viewer?: { id?: string } }; errors?: unknown[] };

      if (data.errors && data.errors.length > 0) {
        return {
          service,
          status: 'fail',
          message: `Linear API returned GraphQL errors: ${JSON.stringify(data.errors)}`,
          timestamp,
        };
      }

      return {
        service,
        status: 'pass',
        message: `Linear API accessible (viewer id: ${data.data?.viewer?.id ?? 'unknown'})`,
        timestamp,
      };
    }

    return {
      service,
      status: 'fail',
      message: `Linear API returned HTTP ${response.status}`,
      timestamp,
    };
  } catch (error) {
    return {
      service,
      status: 'fail',
      message: `Linear API check failed: ${sanitizeError(error)}`,
      timestamp,
    };
  }
}
