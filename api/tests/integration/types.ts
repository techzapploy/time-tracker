export interface CheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skipped';
  message: string;
  duration_ms: number;
}
