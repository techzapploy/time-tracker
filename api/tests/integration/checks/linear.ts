export interface CheckResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  message: string;
  durationMs: number;
}

export async function checkLinear(): Promise<CheckResult> {
  const start = Date.now();
  const name = "linear";

  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return {
      name,
      status: "skipped",
      message: "LINEAR_API_KEY is not set",
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: "{ viewer { id name } }" }),
    });

    if (response.ok) {
      const data = (await response.json()) as { data?: { viewer?: { name?: string } } };
      const userName = data?.data?.viewer?.name ?? "unknown";
      return {
        name,
        status: "passed",
        message: `Linear API accessible, authenticated as: ${userName}`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: "failed",
      message: `Linear API returned status ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: "failed",
      message: `Linear check failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
