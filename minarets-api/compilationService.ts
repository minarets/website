import type { CompilationSummary } from './minarets/types';
import { slugify } from './stringService';

export function getCompilationUrl(compilation: CompilationSummary): string {
  return `/compilations/${compilation.id}/${slugify(compilation.name)}`;
}
