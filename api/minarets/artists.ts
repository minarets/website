import { ApiBase } from './apiBase';
import { Artist } from './types/Artist';

export class Artists extends ApiBase {
  public async getArtist(id: string): Promise<Artist | null> {
    if (!id) {
      return null;
    }

    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/artists/${id}`);

    return (await response.json()) as Artist;
  }
}
