import { ApiBase } from './apiBase';
import type { Artist, ArtistSummary, ListAllResponse, ListResponse } from './types';

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

    const response = await this.get(`${this.apiUrl}/api/artists/${id}`);

    return (await response.json()) as Artist;
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
