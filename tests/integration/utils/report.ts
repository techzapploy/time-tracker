export interface ServiceResult {
  name: string;
  status: 'UP' | 'DOWN' | 'SKIPPED';
  latency?: number;
  error?: string;
  details?: string;
}

export function generateReport(results: ServiceResult[], date: Date): string {
  const dateStr = date.toISOString().split('T')[0];
  const up = results.filter(r => r.status === 'UP').length;
  const down = results.filter(r => r.status === 'DOWN').length;
  const skipped = results.filter(r => r.status === 'SKIPPED').length;

  const rows = results.map(r => {
    const latency = r.latency !== undefined ? `${r.latency}ms` : '-';
    const details = r.error ?? r.details ?? '-';
    return `| ${r.name} | ${r.status} | ${latency} | ${details} |`;
  });

  return [
    `# Integration Status Report — ${dateStr}`,
    '',
    `**Summary:** ${up} UP | ${down} DOWN | ${skipped} SKIPPED`,
    '',
    '| Service | Status | Latency (ms) | Details |',
    '|---------|--------|-------------|---------|',
    ...rows,
    '',
  ].join('\n');
}
