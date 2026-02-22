const SENSITIVE_ENV_VARS = [
  'DATABASE_URL', 'REDIS_PASSWORD', 'REDIS_URL',
  'DISCORD_WEBHOOK_URL', 'DISCORD_BOT_TOKEN',
  'RENDER_API_KEY', 'LINEAR_API_KEY', 'GITHUB_TOKEN',
  'SENTRY_AUTH_TOKEN', 'JWT_SECRET', 'SMTP_PASSWORD',
  'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY',
];

export function sanitize(text: string): string {
  let sanitized = text;
  for (const key of SENSITIVE_ENV_VARS) {
    const value = process.env[key];
    if (value && value.length > 4) {
      sanitized = sanitized.replaceAll(value, '[REDACTED]');
    }
  }
  sanitized = sanitized.replace(/postgresql:\/\/[^@\s]+@/g, 'postgresql://[REDACTED]@');
  sanitized = sanitized.replace(/redis:\/\/[^:@\s]*:[^@\s]+@/g, 'redis://[REDACTED]@');
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9._\-]{20,}/g, 'Bearer [REDACTED]');
  return sanitized;
}
