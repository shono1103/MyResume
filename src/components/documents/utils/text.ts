export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value);
}

export function markdownToText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '・')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function splitParagraphs(markdown: string): string[] {
  return markdownToText(markdown)
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}
