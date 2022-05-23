import LRUCache from 'lru-cache';

import { ApiBase } from './apiBase';
import type { Artist, ArtistSummary, ListAllResponse, ListResponse } from './types';

export interface IListArtistsRequest {
  page?: number;
  itemsPerPage?: number;
  sortAsc?: string;
  sortDesc?: string;
}

const cache = new LRUCache<string, Artist>({
  max: 100000,
  ttl: 60 * 60 * 1000, // 60 minutes
});

export class Artists extends ApiBase {
  public async getArtist(id: number): Promise<Artist> {
    if (!id) {
      throw new Error('Unable to get artist by empty id.');
    }

    const cacheKey = `artists/${id}`;
    let result = cache.get(cacheKey);
    if (!result) {
      const response = await this.get(`${this.apiUrl}/api/artists/${id}`);

      result = (await response.json()) as Artist;

      if (result) {
        cache.set(cacheKey, result);
      }
    }

    return result;
  }

  public async listAllArtists(): Promise<ListAllResponse<ArtistSummary>> {
    const response = await this.get(`${this.apiUrl}/api/artists/all`);

    return (await response.json()) as ListAllResponse<ArtistSummary>;
  }

  public async listArtists(request: IListArtistsRequest): Promise<ListResponse<Artist>> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/artists`, { query });

    return (await response.json()) as ListResponse<Artist>;
  }
}
