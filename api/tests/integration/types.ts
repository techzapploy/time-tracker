export interface CheckResult {
  service: string;
  passed: boolean;
  skipped?: boolean;
  message: string;
}
