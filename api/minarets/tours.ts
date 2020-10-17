import { ApiBase } from './apiBase';
import type { ListAllResponse } from './types/ListAllResponse';
import type { ListResponse } from './types/ListResponse';
import type { Tour } from './types/Tour';
import type { TourSummary } from './types/TourSummary';
import type { TourWithChildren } from './types/TourWithChildren';

export class Tours extends ApiBase {
  public async getTour(idOrSlug: string): Promise<TourWithChildren> {
    if (!idOrSlug) {
      throw new Error('Unable to get tour by empty id.');
    }

    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/tours/${idOrSlug}`);

    return (await response.json()) as TourWithChildren;
  }

  public async listAllTours(): Promise<ListAllResponse<TourSummary>> {
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/tours/all`);

    return (await response.json()) as ListAllResponse<TourSummary>;
  }

  public async listTours(): Promise<ListResponse<Tour>> {
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/tours`);

    return (await response.json()) as ListResponse<Tour>;
  }
}
