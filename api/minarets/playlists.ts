import { ApiBase } from './apiBase';
import { Playlist } from './types/Playlist';
import { PlaylistSummary } from './types/PlaylistSummary';
import { ListAllResponse } from './types/ListAllResponse';
import { ListResponse } from './types/ListResponse';

export interface IListPlaylistsRequest {
  page?: number;
  itemsPerPage?: number;
  sortAsc?: string;
  sortDesc?: string;
}

export class Playlists extends ApiBase {
  public async getPlaylist(id: number): Promise<Playlist> {
    if (!id) {
      throw new Error('Unable to get playlist by empty id.');
    }

    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/playlists/${id}`);

    return (await response.json()) as Playlist;
  }

  public async listAllPlaylists(): Promise<ListAllResponse<PlaylistSummary>> {
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/playlists/all`);

    return (await response.json()) as ListAllResponse<PlaylistSummary>;
  }

  public async listPlaylists(request: IListPlaylistsRequest): Promise<ListResponse<Playlist>> {
    const query = this.queryParams(request);
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/playlists`, { query });

    return (await response.json()) as ListResponse<Playlist>;
  }
}
