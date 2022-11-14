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
  public play(id: string): Promise<IPlayResponse> {
    return this.post<IPlayResponse>(`${this.apiUrl}/api/tracks/${id}/play`);
  }

  public listTracks(request: IListTracksRequest): Promise<ListResponse<TrackWithExtendedInformation>> {
    const query = this.queryParams(request);
    return this.get<ListResponse<TrackWithExtendedInformation>>(`${this.apiUrl}/api/tracks`, { query });
  }
}
