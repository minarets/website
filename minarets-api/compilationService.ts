import type { Compilation, CompilationSummary } from './minarets/types';
import { slugify } from './stringService';

export function getCompilationUrl(compilation: CompilationSummary): string {
  return `/compilations/${compilation.id}/${slugify(compilation.name)}`;
}

export function toSearchRecord(compilation: Compilation): Record<string, unknown> {
  return {
    objectID: compilation.id,
    name: compilation.name,
    description: compilation.description,
    tracks: compilation.tracks.filter((track) => !/^intro/i.test(track.name)).map((track) => track.name),
    url: getCompilationUrl(compilation),
  };
}
