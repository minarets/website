export function slugify(input: string | null | undefined): string {
  if (!input) {
    return '';
  }

  return input
    .toLowerCase()
    .trim()
    .replace(/[@]+/g, 'at')
    .replace(/[&]+/g, 'and')
    .replace(/[?]+/g, '-question')
    .replace(/[^\w\s]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/[-]{2,}/g, '-')
    .replace(/^[-]+(.*)/, '$1')
    .replace(/(.*)[-]+$/, '$1');
}
