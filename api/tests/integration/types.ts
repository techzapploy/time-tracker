export interface CheckResult {
  service: string;
  status: 'ok' | 'failed' | 'skipped';
  message?: string;
  durationMs: number;
}
