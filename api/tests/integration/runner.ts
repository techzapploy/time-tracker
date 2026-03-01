import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { checkPostgres } from "./checks/postgres.js";
import { checkRedis } from "./checks/redis.js";
import { checkDiscord } from "./checks/discord.js";
import { checkGithub } from "./checks/github.js";
import { checkLinear } from "./checks/linear.js";
import { checkRender } from "./checks/render.js";
import { checkSentry } from "./checks/sentry.js";

interface CheckResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  message: string;
  durationMs: number;
}

interface Report {
  timestamp: string;
  results: CheckResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

async function main(): Promise<void> {
  console.log("Starting integration test suite...\n");

  const timestamp = new Date().toISOString();

  const results = await Promise.all([
    checkPostgres(),
    checkRedis(),
    checkDiscord(),
    checkGithub(),
    checkLinear(),
    checkRender(),
    checkSentry(),
  ]);

  const summary = {
    total: results.length,
    passed: results.filter((r) => r.status === "passed").length,
    failed: results.filter((r) => r.status === "failed").length,
    skipped: results.filter((r) => r.status === "skipped").length,
  };

  for (const result of results) {
    const icon =
      result.status === "passed" ? "PASS" : result.status === "failed" ? "FAIL" : "SKIP";
    console.log(`[${icon}] ${result.name}: ${result.message} (${result.durationMs}ms)`);
  }

  console.log(
    `\nSummary: ${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped out of ${summary.total} checks`
  );

  const report: Report = {
    timestamp,
    results,
    summary,
  };

  const reportDir = "/workspace/DailyIntegrationTestResult";
  mkdirSync(reportDir, { recursive: true });

  const reportPath = join(reportDir, `report-${timestamp.replace(/[:.]/g, "-")}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to: ${reportPath}`);

  if (summary.failed > 0) {
    console.error(`\n${summary.failed} check(s) FAILED`);
    process.exit(1);
  }

  console.log("\nAll checks passed or skipped.");
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error("Runner encountered an unexpected error:", err);
  process.exit(1);
});
