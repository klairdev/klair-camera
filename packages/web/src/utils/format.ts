export function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ' + (s % 60) + 's';
  const h = Math.floor(m / 60);
  return h + 'h ' + (m % 60) + 'm';
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return ms + 'ms';
  const s = Math.floor(ms / 1000);
  if (s < 60) return s + 's';
  return Math.floor(s / 60) + 'm';
}

export function formatTimeAgo(ts: number): string {
  const d = Date.now() - ts;
  const s = Math.floor(d / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return s + 's ago';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ' + (m % 60) + 'm ago';
  return Math.floor(h / 24) + 'd ago';
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + ' KB';
  return (kb / 1024).toFixed(1) + ' MB';
}

export function formatMemory(mb: number): string {
  if (mb < 1024) return mb + 'MB';
  return (mb / 1024).toFixed(1) + 'GB';
}

export function shortenPath(p: string, max = 38): string {
  if (!p) return '';
  const parts = p.split('/');
  if (p.length <= max) return p;
  return '\u2026/' + parts.slice(-2).join('/');
}
