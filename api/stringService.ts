export function slugify(input: string | undefined | null): string {
  if (!input) {
    return '';
  }

  return input
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}
