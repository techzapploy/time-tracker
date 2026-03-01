export interface CheckResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  message: string;
  durationMs: number;
}

export async function checkGithub(): Promise<CheckResult> {
  const start = Date.now();
  const name = "github";

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return {
      name,
      status: "skipped",
      message: "GITHUB_TOKEN is not set",
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "integration-check/1.0",
      },
    });

    if (response.ok) {
      const data = (await response.json()) as { login?: string };
      return {
        name,
        status: "passed",
        message: `GitHub API accessible, authenticated as: ${data.login ?? "unknown"}`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: "failed",
      message: `GitHub API returned status ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: "failed",
      message: `GitHub check failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
