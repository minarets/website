import { ApiBase } from './apiBase';
import type { Compilation, CompilationSummary, ListAllResponse, ListResponse } from './types';

export interface IListCompilationsRequest {
  page?: number;
  itemsPerPage?: number;
  sortAsc?: string;
  sortDesc?: string;
}

export class Compilations extends ApiBase {
  public async getCompilation(id: number): Promise<Compilation> {
    if (!id) {
      throw new Error('Unable to get compilation by empty id.');
    }

    const response = await this.get(`${this.apiUrl}/api/compilations/${id}`);

    return (await response.json()) as Compilation;
  }

  public async listAllCompilations(): Promise<ListAllResponse<CompilationSummary>> {
    const response = await this.get(`${this.apiUrl}/api/compilations/all`);

    return (await response.json()) as ListAllResponse<CompilationSummary>;
  }

  public async listCompilations(request: IListCompilationsRequest): Promise<ListResponse<Compilation>> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/compilations`, { query });

    return (await response.json()) as ListResponse<Compilation>;
  }
}
