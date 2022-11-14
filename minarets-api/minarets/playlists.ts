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
  ttl: 60 * 60 * 1000, // 60 minutes
});

export class Playlists extends ApiBase {
  public async getPlaylist(id: number): Promise<Playlist> {
    if (!id) {
      throw new Error('Unable to get playlist by empty id.');
    }

    const cacheKey = `playlists/${id}`;
    let result = cache.get(cacheKey);
    if (!result) {
      result = await this.get<Playlist>(`${this.apiUrl}/api/playlists/${id}`);
      cache.set(cacheKey, result);
    }

    return result;
  }

  public listAllPlaylists(): Promise<ListAllResponse<PlaylistSummary>> {
    return this.get<ListAllResponse<PlaylistSummary>>(`${this.apiUrl}/api/playlists/all`);
  }

  public listPlaylists(request: IListPlaylistsRequest): Promise<ListResponse<Playlist>> {
    const query = this.queryParams(request);
    return this.get<ListResponse<Playlist>>(`${this.apiUrl}/api/playlists`, { query });
  }

  public listMyPlaylists(): Promise<ListAllResponse<PlaylistSummary>> {
    return this.get<ListAllResponse<PlaylistSummary>>(`${this.apiUrl}/api/playlists/my`);
  }
}
