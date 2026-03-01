export interface CheckResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  message: string;
  durationMs: number;
}

export async function checkDiscord(): Promise<CheckResult> {
  const start = Date.now();
  const name = "discord";

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const token = process.env.DISCORD_TOKEN;

  if (!webhookUrl && !token) {
    return {
      name,
      status: "skipped",
      message: "DISCORD_WEBHOOK_URL and DISCORD_TOKEN are not set",
      durationMs: Date.now() - start,
    };
  }

  try {
    if (webhookUrl) {
      const response = await fetch(webhookUrl, { method: "GET" });
      if (response.ok) {
        return {
          name,
          status: "passed",
          message: "Discord webhook URL is reachable",
          durationMs: Date.now() - start,
        };
      }
      return {
        name,
        status: "failed",
        message: `Discord webhook returned status ${response.status}`,
        durationMs: Date.now() - start,
      };
    }

    // If only token is set, just verify it's non-empty
    return {
      name,
      status: "passed",
      message: "Discord token is configured",
      durationMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: "failed",
      message: `Discord check failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
