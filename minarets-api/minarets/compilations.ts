import LRUCache from 'lru-cache';

import { ApiBase } from './apiBase';
import type { BasicCompilation, Compilation, CompilationSummary, ListAllResponse, ListResponse } from './types';

export interface IListCompilationsRequest {
  page?: number;
  itemsPerPage?: number;
  sortAsc?: string;
  sortDesc?: string;
}

const cache = new LRUCache<string, Compilation>({
  max: 100000,
  ttl: 60 * 60 * 1000, // 60 minutes
});

export class Compilations extends ApiBase {
  public async getCompilation(id: number): Promise<Compilation> {
    if (!id) {
      throw new Error('Unable to get compilation by empty id.');
    }

    const cacheKey = `compilations/${id}`;
    let result = cache.get(cacheKey);
    if (!result) {
      result = await this.get<Compilation>(`${this.apiUrl}/api/compilations/${id}`);
      cache.set(cacheKey, result);
    }

    return result;
  }

  public listAllCompilations(): Promise<ListAllResponse<CompilationSummary>> {
    return this.get<ListAllResponse<CompilationSummary>>(`${this.apiUrl}/api/compilations/all`);
  }

  public listCompilations(request: IListCompilationsRequest): Promise<ListResponse<BasicCompilation>> {
    const query = this.queryParams(request);
    return this.get<ListResponse<BasicCompilation>>(`${this.apiUrl}/api/compilations`, { query });
  }

  public listCompilationsFull(request: IListCompilationsRequest): Promise<ListResponse<Compilation>> {
    const query = this.queryParams(request);
    return this.get<ListResponse<Compilation>>(`${this.apiUrl}/api/compilations/list`, { query });
  }
}
