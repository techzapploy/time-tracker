export interface CheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration: number; // milliseconds
}
