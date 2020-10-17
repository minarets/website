import { ApiBase } from './apiBase';
import type { Compilation } from './types/Compilation';
import type { CompilationSummary } from './types/CompilationSummary';
import type { ListAllResponse } from './types/ListAllResponse';
import type { ListResponse } from './types/ListResponse';

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

    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/compilations/${id}`);

    return (await response.json()) as Compilation;
  }

  public async listAllCompilations(): Promise<ListAllResponse<CompilationSummary>> {
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/compilations/all`);

    return (await response.json()) as ListAllResponse<CompilationSummary>;
  }

  public async listCompilations(request: IListCompilationsRequest): Promise<ListResponse<Compilation>> {
    const query = this.queryParams(request);
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/compilations`, { query });

    return (await response.json()) as ListResponse<Compilation>;
  }
}
