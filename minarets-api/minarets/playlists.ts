import LRUCache from 'lru-cache';

import { ApiBase } from './apiBase';
import type { ListAllResponse, ListResponse, Playlist, PlaylistSummary } from './types';

export interface IListPlaylistsRequest {
  page?: number;
  itemsPerPage?: number;
  sortAsc?: string;
  sortDesc?: string;
}

const cache = new LRUCache<string, Playlist>({
  max: 100000,
  maxAge: 60 * 60 * 1000, // 60 minutes
});

export class Playlists extends ApiBase {
  public async getPlaylist(id: number): Promise<Playlist> {
    if (!id) {
      throw new Error('Unable to get playlist by empty id.');
    }

    const cacheKey = `playlists/${id}`;
    let result = cache.get(cacheKey);
    if (!result) {
      const response = await this.get(`${this.apiUrl}/api/playlists/${id}`);

      result = (await response.json()) as Playlist;
      if (result) {
        cache.set(cacheKey, result);
      }
    }

    return result;
  }

  public async listAllPlaylists(): Promise<ListAllResponse<PlaylistSummary>> {
    const response = await this.get(`${this.apiUrl}/api/playlists/all`);

    return (await response.json()) as ListAllResponse<PlaylistSummary>;
  }

  public async listPlaylists(request: IListPlaylistsRequest): Promise<ListResponse<Playlist>> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/playlists`, { query });

    return (await response.json()) as ListResponse<Playlist>;
  }

  public async listMyPlaylists(): Promise<ListAllResponse<PlaylistSummary>> {
    const response = await this.get(`${this.apiUrl}/api/playlists/my`);

    return (await response.json()) as ListAllResponse<PlaylistSummary>;
  }
}
