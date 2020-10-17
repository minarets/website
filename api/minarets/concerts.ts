import { ApiBase } from './apiBase';
import type { BasicConcert } from './types/BasicConcert';
import type { Concert } from './types/Concert';
import type { ListResponse } from './types/ListResponse';

export interface ISearchConcertsRequest {
  page?: number;
  itemsPerPage?: number;
  artistId?: number;
  query: string;
}

export interface IGetRandomConcertRequest {
  page?: number;
  itemsPerPage?: number;
  artistId?: number;
  tourId?: number;
}

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

export interface IListConcertsByCompilationRequest extends IListConcertsRequest {
  compilationId: string;
}

export interface IListConcertsByPlaylistRequest extends IListConcertsRequest {
  playlistId: string;
}

export interface IListConcertsByTourRequest extends IListConcertsRequest {
  tourSlug: string;
}

export interface IListConcertsByVenueRequest extends IListConcertsRequest {
  venueId: number;
}

export class Concerts extends ApiBase {
  public async getConcert(id: string): Promise<Concert> {
    if (!id) {
      throw new Error('Unable to get concert by empty id.');
    }

    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/concerts/${id}`);

    return (await response.json()) as Concert;
  }

  public async getConcertByUrlParts(year: string, month: string, day: string, slug: string): Promise<Concert> {
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/concerts/${year}/${month}/${day}/${slug}`);

    return (await response.json()) as Concert;
  }

  public async getRandomConcert(request: IGetRandomConcertRequest = {}): Promise<Concert> {
    const query = this.queryParams(request);
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/concerts/random`, { query });

    return (await response.json()) as Concert;
  }

  public async searchConcerts(request: ISearchConcertsRequest): Promise<Concert> {
    const query = this.queryParams(request);
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/concerts/search`, { query });

    return (await response.json()) as Concert;
  }

  public async listConcerts(request: IListConcertsRequest): Promise<ListResponse<BasicConcert>> {
    const query = this.queryParams(request);
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/concerts`, { query });

    return (await response.json()) as ListResponse<BasicConcert>;
  }

  public async listRelatedConcerts(id: string): Promise<ListResponse<BasicConcert>> {
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/concerts/${id}/related`);

    return (await response.json()) as ListResponse<BasicConcert>;
  }

  public async listConcertsByArtist(request: IListConcertsByArtistRequest): Promise<ListResponse<BasicConcert>> {
    const { artistId, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/artists/${artistId}/concerts`, { query });

    return (await response.json()) as ListResponse<BasicConcert>;
  }

  public async listConcertsByCompilation(request: IListConcertsByCompilationRequest): Promise<ListResponse<BasicConcert>> {
    const { compilationId, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/compilations/${compilationId}/concerts`, { query });

    return (await response.json()) as ListResponse<BasicConcert>;
  }

  public async listConcertsByPlaylist(request: IListConcertsByPlaylistRequest): Promise<ListResponse<BasicConcert>> {
    const { playlistId, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/playlists/${playlistId}/concerts`, { query });

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
