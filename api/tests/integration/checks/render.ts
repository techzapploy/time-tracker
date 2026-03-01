export interface CheckResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  message: string;
  durationMs: number;
}

export async function checkRender(): Promise<CheckResult> {
  const start = Date.now();
  const name = "render";

  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return {
      name,
      status: "skipped",
      message: "RENDER_API_KEY is not set",
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch("https://api.render.com/v1/owners?limit=1", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (response.ok) {
      return {
        name,
        status: "passed",
        message: "Render API is accessible",
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: "failed",
      message: `Render API returned status ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: "failed",
      message: `Render check failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
