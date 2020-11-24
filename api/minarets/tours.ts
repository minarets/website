import { ApiBase } from './apiBase';
import type { ListAllResponse, ListResponse, Tour, TourSummary, TourWithChildren } from './types';

export class Tours extends ApiBase {
  public async getTour(idOrSlug: string): Promise<TourWithChildren> {
    if (!idOrSlug) {
      throw new Error('Unable to get tour by empty id.');
    }

    const response = await this.get(`${this.apiUrl}/api/tours/${idOrSlug}`);

    return (await response.json()) as TourWithChildren;
  }

  public async listAllTours(): Promise<ListAllResponse<TourSummary>> {
    const response = await this.get(`${this.apiUrl}/api/tours/all`);

    return (await response.json()) as ListAllResponse<TourSummary>;
  }

  public async listTours(): Promise<ListResponse<Tour>> {
    const response = await this.get(`${this.apiUrl}/api/tours`);

    return (await response.json()) as ListResponse<Tour>;
  }
}
