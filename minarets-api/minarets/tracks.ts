import { ApiBase } from './apiBase';
import type { ListResponse, TrackWithExtendedInformation } from './types';

interface IPlayResponse {
  ok: boolean;
}

export interface IListTracksRequest {
  page?: number;
  itemsPerPage?: number;
  sortAsc?: string;
  sortDesc?: string;
  since?: Date;
}

export class Tracks extends ApiBase {
  public async play(id: string): Promise<IPlayResponse> {
    const response = await this.post(`${this.apiUrl}/api/tracks/${id}/play`, {
      body: '',
    });

    return (await response.json()) as IPlayResponse;
  }

  public async listTracks(request: IListTracksRequest): Promise<ListResponse<TrackWithExtendedInformation>> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/tracks`, { query });

    return (await response.json()) as ListResponse<TrackWithExtendedInformation>;
  }
}
