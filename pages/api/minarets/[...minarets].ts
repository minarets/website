import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

import { Minarets } from '../../../api';
import { getConcertUrl } from '../../../api/concertService';
import type { User } from '../../../api/minarets/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const session = await getSession({ req });
  let body: string;

  res.status(200);
  res.setHeader('Content-Type', 'application/json');

  if (session) {
    const api = new Minarets((session.user as User).token);

    const { query } = req;
    const [action] = query.minarets;
    switch (action) {
      case 'getRandomConcert': {
        const concert = await api.concerts.getRandomConcert();

        body = JSON.stringify({
          url: getConcertUrl(concert),
        });
        break;
      }
      case 'getArtistRandomConcert': {
        const [, id] = query.minarets;
        const concert = await api.concerts.getRandomConcert({
          artistId: id,
        });

        body = JSON.stringify({
          url: getConcertUrl(concert),
        });
        break;
      }
      case 'getTourRandomConcert': {
        const [, id] = query.minarets;
        const concert = await api.concerts.getRandomConcert({
          tourId: id,
        });

        body = JSON.stringify({
          url: getConcertUrl(concert),
        });
        break;
      }
      case 'getMyPlaylists': {
        const playlists = await api.playlists.listMyPlaylists();

        body = JSON.stringify(playlists);
        break;
      }
      case 'playTrack': {
        const [, id] = query.minarets;
        if (id) {
          try {
            const response = await api.tracks.play(id);
            body = JSON.stringify(response);
          } catch (ex) {
            console.error(ex);
            body = JSON.stringify({
              ok: true,
            });
          }
        } else {
          body = JSON.stringify({
            ok: true,
          });
        }

        break;
      }
      default:
        res.status(404);
        body = JSON.stringify({
          ok: false,
          message: 'Invalid api method',
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

  res.end(body);
}
