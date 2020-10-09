import { ApiBase } from './apiBase';
import { Artist } from './types/Artist';
import { ArtistIdAndName } from './types/ArtistIdAndName';
import { ListAllResponse } from './types/ListAllResponse';

export class Artists extends ApiBase {
  public async getArtist(id: string): Promise<Artist> {
    if (!id) {
      throw new Error('Unable to get artist by empty id.');
    }

    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/artists/${id}`);

    return (await response.json()) as Artist;
  }

  public async listAllArtists(): Promise<ListAllResponse<ArtistIdAndName>> {
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/artists/all`);

    return (await response.json()) as ListAllResponse<ArtistIdAndName>;
  }
}
