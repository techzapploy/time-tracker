export interface CheckResult {
  name: string;
  status: 'ok' | 'fail' | 'skip';
  message: string;
  durationMs: number;
}
