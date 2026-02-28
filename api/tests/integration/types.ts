export type CheckStatus = 'pass' | 'fail' | 'skipped';

export interface CheckResult {
  service: string;
  status: CheckStatus;
  message: string;
  duration_ms: number;
}
