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
      const response = await this.get(`${this.apiUrl}/api/compilations/${id}`);

      result = (await response.json()) as Compilation;
      if (result) {
        cache.set(cacheKey, result);
      }
    }

    return result;
  }

  public async listAllCompilations(): Promise<ListAllResponse<CompilationSummary>> {
    const response = await this.get(`${this.apiUrl}/api/compilations/all`);

    return (await response.json()) as ListAllResponse<CompilationSummary>;
  }

  public async listCompilations(request: IListCompilationsRequest): Promise<ListResponse<BasicCompilation>> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/compilations`, { query });

    return (await response.json()) as ListResponse<BasicCompilation>;
  }

  public async listCompilationsFull(request: IListCompilationsRequest): Promise<ListResponse<Compilation>> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/compilations/list`, { query });

    return (await response.json()) as ListResponse<Compilation>;
  }
}
