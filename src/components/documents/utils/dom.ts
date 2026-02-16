export function appendLinkOrText(
  doc: Document,
  target: Element,
  value: string,
  options?: {linkText?: string; fallbackText?: string},
) {
  const linkText = options?.linkText ?? value;
  const fallbackText = options?.fallbackText ?? value;

  if (value.startsWith('http')) {
    const link = doc.createElement('a');
    link.href = value;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = linkText;
    target.appendChild(link);
    return;
  }

  target.append(fallbackText);
}
