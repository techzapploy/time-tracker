export interface CheckResult {
  service: string;
  status: 'pass' | 'fail';
  message: string;
  durationMs: number;
}
