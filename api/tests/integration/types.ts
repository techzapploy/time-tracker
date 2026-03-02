export interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  reason?: string;
  duration_ms: number;
}
