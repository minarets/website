import LRUCache from 'lru-cache';
import SmartyStreetSDK from 'smartystreets-javascript-sdk';

import { ApiBase } from './apiBase';
import type { ListAllResponse, ListResponse, Venue, VenueSummary } from './types';

export interface IListVenuesRequest {
  page?: number;
  itemsPerPage?: number;
  sortAsc?: string;
  sortDesc?: string;
}

const cache = new LRUCache<string, Venue>({
  max: 100000,
  ttl: 60 * 60 * 1000, // 60 minutes
});

export class Venues extends ApiBase {
  public async getVenue(id: number): Promise<Venue> {
    if (!id) {
      throw new Error('Unable to get venue by empty id.');
    }

    const cacheKey = `venues/${id}`;
    let result = cache.get(cacheKey);
    if (!result) {
      result = await this.get<Venue>(`${this.apiUrl}/api/venues/${id}`);
      cache.set(cacheKey, result);
    }

    return result;
  }

  public listAllVenues(): Promise<ListAllResponse<VenueSummary>> {
    return this.get<ListAllResponse<VenueSummary>>(`${this.apiUrl}/api/venues/all`);
  }

  public listVenues(request: IListVenuesRequest): Promise<ListResponse<Venue>> {
    const query = this.queryParams(request);
    return this.get<ListResponse<Venue>>(`${this.apiUrl}/api/venues`, { query });
  }

  public async setVenueFormattedAddress(venue: Venue): Promise<string> {
    try {
      if (process.env.SMARTY_AUTH_ID && process.env.SMARTY_AUTH_TOKEN) {
        const credentials = new SmartyStreetSDK.core.StaticCredentials(process.env.SMARTY_AUTH_ID, process.env.SMARTY_AUTH_TOKEN);
        const smartyClient = SmartyStreetSDK.core.buildClient.usStreet(credentials);
        const { Lookup } = SmartyStreetSDK.usStreet;
        const lookup = new Lookup();
        lookup.street = venue.address;
        lookup.city = venue.city;
        lookup.state = venue.state;
        lookup.zipCode = venue.postalCode;
        lookup.maxCandidates = 1;
        lookup.match = 'strict';

        await smartyClient.send(lookup);

        if (lookup.result.length) {
          let formattedAddress = lookup.result[0].deliveryLine1 || '';
          if (lookup.result[0].deliveryLine2) {
            formattedAddress += `\n${lookup.result[0].deliveryLine2}`;
          }

          if (lookup.result[0].lastLine) {
            if (formattedAddress) {
              formattedAddress += '\n';
            }

            formattedAddress += lookup.result[0].lastLine;
          }

          console.log(`Found address for venue: ${venue.id}:\n${formattedAddress}`);

          await this.post(`${this.apiUrl}/api/venues/${venue.id}/setFormattedAddress`, {
            id: venue.id,
            formattedAddress,
          });

          return formattedAddress;
        }

        console.error(`Unable to find address for venue: ${venue.id} - ${venue.name}.`);
      }
    } catch (ex) {
      console.error(ex);
    }

    return '';
  }
}
