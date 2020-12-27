import { Artists } from './artists';
import { Compilations } from './compilations';
import { Concerts } from './concerts';
import { Playlists } from './playlists';
import { Tours } from './tours';
import { Tracks } from './tracks';
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

  protected tracksApi: Tracks;

  protected usersApi: Users;

  protected venuesApi: Venues;

  public constructor(apiToken = process?.env?.MINARETS_API_TOKEN, apiKey = process?.env?.MINARETS_API_KEY, apiUrl = process?.env?.MINARETS_API_URL || 'https://meetattheshow.com') {
    if (!apiToken) {
      throw new Error('Minarets apiToken is not defined');
    }

    if (!apiKey) {
      throw new Error('Minarets apiKey is not defined');
    }

    this.apiKey = apiKey;
    this.apiToken = apiToken;
    this.artistsApi = new Artists(apiKey, apiToken, apiUrl);
    this.compilationsApi = new Compilations(apiKey, apiToken, apiUrl);
    this.concertsApi = new Concerts(apiKey, apiToken, apiUrl);
    this.playlistsApi = new Playlists(apiKey, apiToken, apiUrl);
    this.toursApi = new Tours(apiKey, apiToken, apiUrl);
    this.tracksApi = new Tracks(apiKey, apiToken, apiUrl);
    this.usersApi = new Users(apiKey, apiToken, apiUrl);
    this.venuesApi = new Venues(apiKey, apiToken, apiUrl);
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

  public get tracks(): Tracks {
    return this.tracksApi;
  }

  public get users(): Users {
    return this.usersApi;
  }

  public get venues(): Venues {
    return this.venuesApi;
  }
}
