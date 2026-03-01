export interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs: number;
}
