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

export class Concerts extends ApiBase {
  public async listConcerts(request: IListConcertsRequest): Promise<ListResponse<BasicConcert>> {
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/concerts`, { query: request as Record<string, unknown> });

    return (await response.json()) as ListResponse<BasicConcert>;
  }
}
