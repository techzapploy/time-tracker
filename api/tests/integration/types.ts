export type CheckStatus = 'pass' | 'fail' | 'skip';

export interface CheckResult {
  service: string;
  status: CheckStatus;
  duration: number;
  message: string;
}

export type CheckFn = () => Promise<CheckResult>;
