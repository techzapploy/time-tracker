export interface CheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  timestamp: string;
}
export type CheckFn = () => Promise<CheckResult>;
