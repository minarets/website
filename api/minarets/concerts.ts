import { ApiBase } from './apiBase';
import { BasicConcert } from './types/BasicConcert';
import { ListResponse } from './types/ListResponse';

export interface IListConcertsRequest {
  page?: number;
  itemsPerPage?: number;
  sortAsc?: string;
  sortDesc?: string;
  since?: Date;
}

export interface IListConcertsByArtistRequest extends IListConcertsRequest {
  artistId: number;
}

export interface IListConcertsByTourRequest extends IListConcertsRequest {
  tourSlug: string;
}

export interface IListConcertsByVenueRequest extends IListConcertsRequest {
  venueId: number;
}

export class Concerts extends ApiBase {
  public async listConcerts(request: IListConcertsRequest): Promise<ListResponse<BasicConcert>> {
    const query = this.queryParams(request);
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/concerts`, { query });

    return (await response.json()) as ListResponse<BasicConcert>;
  }

  public async listConcertsByArtist(request: IListConcertsByArtistRequest): Promise<ListResponse<BasicConcert>> {
    const { artistId, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/artists/${artistId}/concerts`, { query });

    return (await response.json()) as ListResponse<BasicConcert>;
  }

  public async listConcertsByTour(request: IListConcertsByTourRequest): Promise<ListResponse<BasicConcert>> {
    const { tourSlug, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/tours/${tourSlug}/concerts`, { query });

    return (await response.json()) as ListResponse<BasicConcert>;
  }

  public async listConcertsByVenue(request: IListConcertsByVenueRequest): Promise<ListResponse<BasicConcert>> {
    const { venueId, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/venues/${venueId}/concerts`, { query });

    return (await response.json()) as ListResponse<BasicConcert>;
  }
}
