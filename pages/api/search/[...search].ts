import * as Sentry from '@sentry/node';
import algoliasearch from 'algoliasearch';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import { Minarets } from '../../../minarets-api';
import * as compilationService from '../../../minarets-api/compilationService';
import * as concertService from '../../../minarets-api/concertService';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const session = await getSession({ req });
  let body = JSON.stringify({
    ok: false,
    message: 'Something went wrong :(',
  });

  res.status(200);
  res.setHeader('Content-Type', 'application/json');

  try {
    if (session && session.user?.email === 'jim@biacreations.com') {
      if (!process.env.ALGOLIA_APPLICATION_ID || !process.env.ALGOLIA_ADMIN_API_KEY) {
        console.log(`ALGOLIA_APPLICATION_ID: ${process.env.ALGOLIA_APPLICATION_ID || ''}`);
        console.log(`ALGOLIA_ADMIN_API_KEY: ${process.env.ALGOLIA_ADMIN_API_KEY || ''}`);
        res.end(
          JSON.stringify({
            ok: false,
            message: 'Missing Algolia credentials',
          }),
        );
        return;
      }

      const api = new Minarets(session.userToken as string);
      const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_API_KEY);

      const { query } = req;
      const [action] = query.search;
      switch (action) {
        case 'indexAllConcerts': {
          console.log(`Starting ${action}`);
          const searchRecords: Record<string, unknown>[] = [];
          let page = 1;
          const itemsPerPage = 100;
          let totalCount = -1;
          while (totalCount === -1 || searchRecords.length < totalCount) {
            console.log(`Fetching page ${page} of concerts. Total found so far: ${searchRecords.length}`);
            // eslint-disable-next-line no-await-in-loop
            const concerts = await api.concerts.listConcertsFull({
              page,
              itemsPerPage,
            });

            searchRecords.push(...concerts.items.map((concert) => concertService.toSearchRecord(concert)));

            totalCount = concerts.total;
            page += 1;
          }

          const index = client.initIndex('concerts');
          console.log('Setting searchable attributes for concerts index');
          await index.setSettings({
            searchableAttributes: [
              'name', //
              'venue',
              'tour',
              'date',
              'dateTimestamp',
              'artist',
              'unordered(tracks)',
              'notes',
            ],
            attributesForFaceting: [
              'venue', //
              'tour',
              'artist',
            ],
          });
          console.log(`Saving ${searchRecords.length} concert records`);
          await index.saveObjects(searchRecords);

          body = JSON.stringify({
            ok: true,
            message: `Indexed ${searchRecords.length} concerts`,
          });

          break;
        }
        case 'indexMostRecentConcerts': {
          console.log(`Starting ${action}`);
          const searchRecords: Record<string, unknown>[] = [];
          const concerts = await api.concerts.listConcertsFull({
            page: 1,
            itemsPerPage: 100,
            sortDesc: 'ApprovedOn',
          });

          searchRecords.push(...concerts.items.map((concert) => concertService.toSearchRecord(concert)));

          const index = client.initIndex('concerts');
          console.log('Setting searchable attributes for concerts index');
          await index.setSettings({
            searchableAttributes: [
              'name', //
              'venue',
              'tour',
              'date',
              'dateTimestamp',
              'artist',
              'unordered(tracks)',
              'notes',
            ],
            attributesForFaceting: [
              'venue', //
              'tour',
              'artist',
            ],
          });
          console.log(`Saving ${searchRecords.length} concert records`);
          await index.saveObjects(searchRecords);

          body = JSON.stringify({
            ok: true,
            message: `Indexed ${searchRecords.length} concerts`,
          });

          break;
        }
        case 'indexConcert': {
          console.log(`Starting ${action}`);
          const [, id] = query.search;
          body = JSON.stringify({
            ok: false,
            message: `Unable to find concert by id ${id}`,
          });

          if (id) {
            const concert = await api.concerts.getConcert(id);
            if (concert) {
              const searchRecord = concertService.toSearchRecord(concert);
              const index = client.initIndex('concerts');
              await index.saveObject(searchRecord);

              body = JSON.stringify({
                ok: true,
                message: `Indexed concert`,
              });
            }
          }

          break;
        }
        case 'indexAllCompilations': {
          console.log(`Starting ${action}`);
          const searchRecords: Record<string, unknown>[] = [];
          let page = 1;
          const itemsPerPage = 200;
          let resultCount = -1;
          while (resultCount === -1 || resultCount === itemsPerPage) {
            // eslint-disable-next-line no-await-in-loop
            const compilations = await api.compilations.listCompilationsFull({
              page,
              itemsPerPage,
            });

            searchRecords.push(...compilations.items.map((compilation) => compilationService.toSearchRecord(compilation)));

            resultCount = compilations.total;
            page += 1;
          }

          console.log('Initializing index: compilations');
          const index = client.initIndex('compilations');
          console.log('Setting searchable attributes for compilations index');
          await index.setSettings({
            searchableAttributes: [
              'name', //
              'description',
              'unordered(tracks)',
            ],
          });
          console.log(`Saving ${searchRecords.length} compilation records`);
          await index.saveObjects(searchRecords);

          body = JSON.stringify({
            ok: true,
            message: `Indexed ${searchRecords.length} compilations`,
          });

          break;
        }
        case 'indexCompilation': {
          console.log(`Starting ${action}`);
          const [, id] = query.search;
          body = JSON.stringify({
            ok: false,
            message: `Unable to find compilation by id ${id}`,
          });

          if (id) {
            const compilation = await api.compilations.getCompilation(Number(id));
            if (compilation) {
              const searchRecord = compilationService.toSearchRecord(compilation);
              const index = client.initIndex('compilations');
              await index.saveObject(searchRecord);

              body = JSON.stringify({
                ok: true,
                message: `Indexed compilation`,
              });
            }
          }

          break;
        }
        default:
          res.status(404);
          body = JSON.stringify({
            ok: false,
            message: `Invalid api method: ${action}`,
          });
          break;
      }
    } else {
      res.status(401);
      body = JSON.stringify({
        ok: false,
        message: 'Unauthorized',
      });
    }
  } catch (ex) {
    Sentry.captureException(ex);
  }

  const { returnUrl } = req.query;
  if (returnUrl && typeof returnUrl === 'string' && returnUrl.startsWith('http')) {
    res.redirect(302, returnUrl);
  }

  res.end(body);
}
