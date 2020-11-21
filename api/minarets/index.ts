import { Artists } from './artists';
import { Compilations } from './compilations';
import { Concerts } from './concerts';
import { Playlists } from './playlists';
import { Tours } from './tours';
import { Users } from './users';
import { Venues } from './venues';

export class Minarets {
  protected apiKey: string;

  protected apiToken: string;

  protected artistsApi: Artists;

  protected compilationsApi: Compilations;

  protected concertsApi: Concerts;

  protected playlistsApi: Playlists;

  protected toursApi: Tours;

  protected usersApi: Users;

  protected venuesApi: Venues;

  public constructor(apiToken = process?.env?.MINARETS_API_TOKEN, apiKey = process?.env?.MINARETS_API_KEY) {
    if (!apiToken) {
      throw new Error('Minarets apiToken is not defined');
    }

    if (!apiKey) {
      throw new Error('Minarets apiKey is not defined');
    }

    this.apiKey = apiKey;
    this.apiToken = apiToken;
    this.artistsApi = new Artists(apiKey, apiToken);
    this.compilationsApi = new Compilations(apiKey, apiToken);
    this.concertsApi = new Concerts(apiKey, apiToken);
    this.playlistsApi = new Playlists(apiKey, apiToken);
    this.toursApi = new Tours(apiKey, apiToken);
    this.usersApi = new Users(apiKey, apiToken);
    this.venuesApi = new Venues(apiKey, apiToken);
  }

  public get artists(): Artists {
    return this.artistsApi;
  }

  public get compilations(): Compilations {
    return this.compilationsApi;
  }

  public get concerts(): Concerts {
    return this.concertsApi;
  }

  public get playlists(): Playlists {
    return this.playlistsApi;
  }

  public get tours(): Tours {
    return this.toursApi;
  }

  public get users(): Users {
    return this.usersApi;
  }

  public get venues(): Venues {
    return this.venuesApi;
  }
}
