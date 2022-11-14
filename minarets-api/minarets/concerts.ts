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
      result = await this.get<Concert>(`${this.apiUrl}/api/concerts/${id}`);
      cache.set(cacheKey, result);
      cache.set(`concerts_date/${moment.utc(result.date).format('yyyy/MM/DD')}`, result);
    }

    return result;
  }

  public async getConcertByUrlParts(year: string, month: string, day: string, slug: string): Promise<Concert> {
    const cacheKey = `concerts_date/${year}/${month}/${day}`;
    let result = cache.get(cacheKey);
    if (!result) {
      result = await this.get<Concert>(`${this.apiUrl}/api/concerts/${year}/${month}/${day}/${slug}`);
      cache.set(cacheKey, result);
      cache.set(`concerts_id/${result.id}`, result);
    }

    return result;
  }

  public getRandomConcert(request: IGetRandomConcertRequest = {}): Promise<ConcertSummary> {
    const query = this.queryParams(request);
    return this.get<ConcertSummary>(`${this.apiUrl}/api/concerts/random`, { query });
  }

  public searchConcerts(request: ISearchConcertsRequest): Promise<Concert> {
    const query = this.queryParams(request);
    return this.get<Concert>(`${this.apiUrl}/api/concerts/search`, { query });
  }

  public listAllConcerts(): Promise<ListAllResponse<ConcertSummary>> {
    return this.get<ListAllResponse<ConcertSummary>>(`${this.apiUrl}/api/concerts/all`);
  }

  public listConcerts(request: IListConcertsRequest): Promise<ListResponse<Concert>> {
    const query = this.queryParams(request);
    return this.get<ListResponse<Concert>>(`${this.apiUrl}/api/concerts`, { query });
  }

  public listConcertsFull(request: IListConcertsRequest): Promise<ListResponse<Concert>> {
    const query = this.queryParams(request);
    return this.get<ListResponse<Concert>>(`${this.apiUrl}/api/concerts/list`, { query });
  }

  public listRelatedConcerts(id: string): Promise<ListResponse<BasicConcert>> {
    return this.get<ListResponse<BasicConcert>>(`${this.apiUrl}/api/concerts/${id}/related`);
  }

  public listConcertsByArtist(request: IListConcertsByArtistRequest): Promise<ListResponse<BasicConcert>> {
    const { artistId, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    return this.get<ListResponse<BasicConcert>>(`${this.apiUrl}/api/artists/${artistId}/concerts`, { query });
  }

  public listConcertsByCompilation(request: IListConcertsByCompilationRequest): Promise<ListResponse<BasicConcertWithNotes>> {
    const { compilationId, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    return this.get<ListResponse<BasicConcert>>(`${this.apiUrl}/api/compilations/${compilationId}/concerts`, { query });
  }

  public listConcertsByPlaylist(request: IListConcertsByPlaylistRequest): Promise<ListResponse<BasicConcertWithNotes>> {
    const { playlistId, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    return this.get<ListResponse<BasicConcert>>(`${this.apiUrl}/api/playlists/${playlistId}/concerts`, { query });
  }

  public listConcertsByTour(request: IListConcertsByTourRequest): Promise<ListResponse<BasicConcert>> {
    const { tourSlug, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    return this.get<ListResponse<BasicConcert>>(`${this.apiUrl}/api/tours/${tourSlug}/concerts`, { query });
  }

  public listConcertsByVenue(request: IListConcertsByVenueRequest): Promise<ListResponse<BasicConcert>> {
    const { venueId, ...queryParams } = request;
    const query = this.queryParams(queryParams);
    return this.get<ListResponse<BasicConcert>>(`${this.apiUrl}/api/venues/${venueId}/concerts`, { query });
  }
}
