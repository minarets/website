import LRUCache from 'lru-cache';
import moment from 'moment';

import { ApiBase } from './apiBase';
import type { BasicConcert, BasicConcertWithNotes, Concert, ConcertSummary, ListAllResponse, ListResponse } from './types';

export interface ISearchConcertsRequest {
  page?: number;
  itemsPerPage?: number;
  artistId?: number;
  query: string;
}

export interface IGetRandomConcertRequest {
  page?: number;
  itemsPerPage?: number;
  artistId?: number | string;
  tourId?: number | string;
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
  compilationId: number;
}

export interface IListConcertsByPlaylistRequest extends IListConcertsRequest {
  playlistId: number;
}

export interface IListConcertsByTourRequest extends IListConcertsRequest {
  tourSlug: string;
}

export interface IListConcertsByVenueRequest extends IListConcertsRequest {
  venueId: number;
}

const cache = new LRUCache<string, Concert>({
  max: 100000,
  ttl: 60 * 60 * 1000, // 60 minutes
});

export class Concerts extends ApiBase {
  public async getConcert(id: string): Promise<Concert> {
    if (!id) {
      throw new Error('Unable to get concert by empty id.');
    }

    const cacheKey = `concerts_id/${id}`;
    let result = cache.get(cacheKey);
    if (!result) {
      const response = await this.get(`${this.apiUrl}/api/concerts/${id}`);

      result = (await response.json()) as Concert;
      if (result) {
        cache.set(cacheKey, result);
        cache.set(`concerts_date/${moment.utc(result.date).format('yyyy/MM/DD')}`, result);
      }
    }

    return result;
  }

  public async getConcertByUrlParts(year: string, month: string, day: string, slug: string): Promise<Concert> {
    const cacheKey = `concerts_date/${year}/${month}/${day}`;
    let result = cache.get(cacheKey);
    if (!result) {
      const response = await this.get(`${this.apiUrl}/api/concerts/${year}/${month}/${day}/${slug}`);

      result = (await response.json()) as Concert;
      if (result) {
        cache.set(cacheKey, result);
        cache.set(`concerts_id/${result.id}`, result);
      }
    }

    return result;
  }

  public async getRandomConcert(request: IGetRandomConcertRequest = {}): Promise<ConcertSummary> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/concerts/random`, { query });

    return (await response.json()) as ConcertSummary;
  }

  public async searchConcerts(request: ISearchConcertsRequest): Promise<Concert> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/concerts/search`, { query });

    return (await response.json()) as Concert;
  }

  public async listAllConcerts(): Promise<ListAllResponse<ConcertSummary>> {
    const response = await this.get(`${this.apiUrl}/api/concerts/all`);

    return (await response.json()) as ListAllResponse<ConcertSummary>;
  }

  public async listConcerts(request: IListConcertsRequest): Promise<ListResponse<Concert>> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/concerts`, { query });

    return (await response.json()) as ListResponse<Concert>;
  }

  public async listConcertsFull(request: IListConcertsRequest): Promise<ListResponse<Concert>> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/concerts/list`, { query });

    return (await response.json()) as ListResponse<Concert>;
  }

  public async listRelatedConcerts(id: string): Promise<ListResponse<BasicConcert>> {
    const response = await this.get(`${this.apiUrl}/api/concerts/${id}/related`);

    return (await response.json()) as ListResponse<BasicConcert>;
  }

  public async listConcertsByArtist(request: IListConcertsByArtistRequest): Promise<ListResponse<BasicConcert>> {
    const { artistId, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    const response = await this.get(`${this.apiUrl}/api/artists/${artistId}/concerts`, { query });

    return (await response.json()) as ListResponse<BasicConcert>;
  }

  public async listConcertsByCompilation(request: IListConcertsByCompilationRequest): Promise<ListResponse<BasicConcertWithNotes>> {
    const { compilationId, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    const response = await this.get(`${this.apiUrl}/api/compilations/${compilationId}/concerts`, { query });

    return (await response.json()) as ListResponse<BasicConcert>;
  }

  public async listConcertsByPlaylist(request: IListConcertsByPlaylistRequest): Promise<ListResponse<BasicConcertWithNotes>> {
    const { playlistId, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    const response = await this.get(`${this.apiUrl}/api/playlists/${playlistId}/concerts`, { query });

    return (await response.json()) as ListResponse<BasicConcert>;
  }

  public async listConcertsByTour(request: IListConcertsByTourRequest): Promise<ListResponse<BasicConcert>> {
    const { tourSlug, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    const response = await this.get(`${this.apiUrl}/api/tours/${tourSlug}/concerts`, { query });

    return (await response.json()) as ListResponse<BasicConcert>;
  }

  public async listConcertsByVenue(request: IListConcertsByVenueRequest): Promise<ListResponse<BasicConcert>> {
    const { venueId, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    const response = await this.get(`${this.apiUrl}/api/venues/${venueId}/concerts`, { query });

    return (await response.json()) as ListResponse<BasicConcert>;
  }
}
