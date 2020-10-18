export function slugify(input: string | undefined | null): string {
  if (!input) {
    return '';
  }

  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]+/g, '')
    .replace(/\s+/g, '-');
}
