import LRUCache from 'lru-cache';

import { ApiBase } from './apiBase';
import type { ListAllResponse, ListResponse, Tour, TourSummary, TourWithChildren } from './types';

const cache = new LRUCache<string, TourWithChildren>({
  max: 100000,
  ttl: 60 * 60 * 1000, // 60 minutes
});

export class Tours extends ApiBase {
  public async getTour(idOrSlug: number | string): Promise<TourWithChildren> {
    if (!idOrSlug) {
      throw new Error('Unable to get tour by empty id.');
    }

    const cacheKey = `tours/${idOrSlug}`;
    let result = cache.get(cacheKey);
    if (!result) {
      const response = await this.get(`${this.apiUrl}/api/tours/${idOrSlug}`);

      result = (await response.json()) as TourWithChildren;
      if (result) {
        cache.set(cacheKey, result);
        cache.set(`tours/${result.id}`, result);
        cache.set(`tours/${result.slug}`, result);
      }
    }

    return result;
  }

  public async listAllTours(): Promise<ListAllResponse<TourSummary>> {
    const response = await this.get(`${this.apiUrl}/api/tours/all`);

    return (await response.json()) as ListAllResponse<TourSummary>;
  }

  public async listTours(): Promise<ListResponse<Tour>> {
    const response = await this.get(`${this.apiUrl}/api/tours`);

    return (await response.json()) as ListResponse<Tour>;
  }
}
