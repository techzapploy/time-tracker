export type CheckStatus = 'pass' | 'fail' | 'skipped';

export interface CheckResult {
  name: string;
  status: CheckStatus;
  message: string;
  durationMs: number;
}

export interface IntegrationReport {
  timestamp: string;
  totalChecks: number;
  passed: number;
  failed: number;
  skipped: number;
  results: CheckResult[];
}
