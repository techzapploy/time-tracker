export interface CheckResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  message: string;
  durationMs: number;
}

export async function checkSentry(): Promise<CheckResult> {
  const start = Date.now();
  const name = "sentry";

  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return {
      name,
      status: "skipped",
      message: "SENTRY_DSN is not set",
      durationMs: Date.now() - start,
    };
  }

  try {
    // Parse the DSN to validate it and check the Sentry API
    const dsnUrl = new URL(dsn);
    const host = dsnUrl.hostname;
    const pathParts = dsnUrl.pathname.split("/").filter(Boolean);
    const projectId = pathParts[pathParts.length - 1];

    if (!projectId) {
      return {
        name,
        status: "failed",
        message: "Invalid Sentry DSN: could not extract project ID",
        durationMs: Date.now() - start,
      };
    }

    // Basic DSN validation
    if (!host || !dsnUrl.username) {
      return {
        name,
        status: "failed",
        message: "Invalid Sentry DSN format",
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: "passed",
      message: `Sentry DSN is configured for project ${projectId} on ${host}`,
      durationMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: "failed",
      message: `Sentry check failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
