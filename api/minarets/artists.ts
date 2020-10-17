import { ApiBase } from './apiBase';
import type { Artist } from './types/Artist';
import type { ArtistSummary } from './types/ArtistSummary';
import type { ListAllResponse } from './types/ListAllResponse';
import type { ListResponse } from './types/ListResponse';

export interface IListArtistsRequest {
  page?: number;
  itemsPerPage?: number;
  sortAsc?: string;
  sortDesc?: string;
}

export class Artists extends ApiBase {
  public async getArtist(id: number): Promise<Artist> {
    if (!id) {
      throw new Error('Unable to get artist by empty id.');
    }

    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/artists/${id}`);

    return (await response.json()) as Artist;
  }

  public async listAllArtists(): Promise<ListAllResponse<ArtistSummary>> {
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/artists/all`);

    return (await response.json()) as ListAllResponse<ArtistSummary>;
  }

  public async listArtists(request: IListArtistsRequest): Promise<ListResponse<Artist>> {
    const query = this.queryParams(request);
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/artists`, { query });

    return (await response.json()) as ListResponse<Artist>;
  }
}
