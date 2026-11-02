/**
 * POC 2 Produtora Kids — Formatters & String Utilities
 */

export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

export function formatIsoTimestamp(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR');
  } catch {
    return iso;
  }
}

export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}
