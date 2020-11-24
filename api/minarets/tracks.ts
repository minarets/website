import { ApiBase } from './apiBase';
import type { ListResponse, TrackWithExtendedInformation } from './types';

export interface IListTracksRequest {
  page?: number;
  itemsPerPage?: number;
  sortAsc?: string;
  sortDesc?: string;
  since?: Date;
}

export class Tracks extends ApiBase {
  // public async playTrack(id: string): Promise<void> {
  //   // TODO: Need to authenticate in order to call this
  //   await this.post(`${this.apiUrl}/api/tracks/trackPlay`, {
  //     body: JSON.stringify({
  //       id,
  //     }),
  //   });
  // }

  public async listTracks(request: IListTracksRequest): Promise<ListResponse<TrackWithExtendedInformation>> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/tracks`, { query });

    return (await response.json()) as ListResponse<TrackWithExtendedInformation>;
  }
}
