import LRUCache from 'lru-cache';

import { ApiBase } from './apiBase';
import type { ListAllResponse, ListResponse, Tour, TourSummary, TourWithChildren } from './types';

const cache = new LRUCache<string, TourWithChildren>({
  max: 100000,
  ttl: 60 * 60 * 1000, // 60 minutes
});

const toursCache = new LRUCache<string, ListResponse<Tour>>({
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
      result = await this.get<TourWithChildren>(`${this.apiUrl}/api/tours/${idOrSlug}`);
      cache.set(cacheKey, result);
      cache.set(`tours/${result.id}`, result);
      cache.set(`tours/${result.slug}`, result);
    }

    return result;
  }

  public listAllTours(): Promise<ListAllResponse<TourSummary>> {
    return this.get<ListAllResponse<TourSummary>>(`${this.apiUrl}/api/tours/all`);
  }

  public async listTours(): Promise<ListResponse<Tour>> {
    const cacheKey = 'listTours';
    let result = toursCache.get(cacheKey);
    if (!result) {
      result = await this.get<ListResponse<Tour>>(`${this.apiUrl}/api/tours`);
      toursCache.set(cacheKey, result);
    }

    return result;
  }
}
