import postgres from "postgres";

export interface CheckResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  message: string;
  durationMs: number;
}

export async function checkPostgres(): Promise<CheckResult> {
  const start = Date.now();
  const name = "postgres";

  const databaseUrl = process.env.DATABASE_URL;
  const postgresHost = process.env.POSTGRES_HOST || process.env.SERVICE_POSTGRES_HOST;

  if (!databaseUrl && !postgresHost) {
    return {
      name,
      status: "skipped",
      message: "DATABASE_URL and POSTGRES_HOST are not set",
      durationMs: Date.now() - start,
    };
  }

  let connectionString: string;
  if (databaseUrl) {
    connectionString = databaseUrl;
  } else {
    const host = postgresHost;
    const port = process.env.POSTGRES_PORT || process.env.SERVICE_POSTGRES_PORT || "5432";
    const user = process.env.POSTGRES_USER || "postgres";
    const password = process.env.POSTGRES_PASSWORD || "";
    const db = process.env.POSTGRES_DB || "postgres";
    connectionString = password
      ? `postgres://${user}:${password}@${host}:${port}/${db}`
      : `postgres://${user}@${host}:${port}/${db}`;
  }

  let sql: ReturnType<typeof postgres> | null = null;
  try {
    sql = postgres(connectionString, { max: 1, connect_timeout: 10 });
    const result = await sql`SELECT 1 as ok`;
    if (result[0]?.ok === 1) {
      return {
        name,
        status: "passed",
        message: `Connected to PostgreSQL successfully at ${connectionString.replace(/:[^:@]*@/, ":***@")}`,
        durationMs: Date.now() - start,
      };
    }
    return {
      name,
      status: "failed",
      message: "Unexpected result from SELECT 1",
      durationMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: "failed",
      message: `PostgreSQL connection failed: ${message}`,
      durationMs: Date.now() - start,
    };
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}
