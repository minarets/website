import * as Sentry from '@sentry/node';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import { Minarets } from '../../../minarets-api';
import { getConcertUrl } from '../../../minarets-api/concertService';

interface ResponseJson extends Record<string, unknown> {
  ok: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const session = await getSession({ req });
  let body: ResponseJson;

  res.status(200);
  res.setHeader('Content-Type', 'application/json');

  if (session) {
    const api = new Minarets(session.userToken as string);

    const { query } = req;
    const [action] = query.minarets;
    switch (action) {
      case 'getRandomConcert': {
        const concert = await api.concerts.getRandomConcert();

        body = {
          ok: true,
          url: getConcertUrl(concert),
        };
        break;
      }
      case 'getArtistRandomConcert': {
        const [, id] = query.minarets;
        const concert = await api.concerts.getRandomConcert({
          artistId: id,
        });

        body = {
          ok: true,
          url: getConcertUrl(concert),
        };
        break;
      }
      case 'getTourRandomConcert': {
        const [, id] = query.minarets;
        const concert = await api.concerts.getRandomConcert({
          tourId: id,
        });

        body = {
          ok: true,
          url: getConcertUrl(concert),
        };
        break;
      }
      case 'getMyPlaylists': {
        const playlists = await api.playlists.listMyPlaylists();

        body = {
          ok: true,
          ...playlists,
        };
        break;
      }
      case 'playTrack': {
        const [, id] = query.minarets;
        if (id) {
          try {
            const response = await api.tracks.play(id);
            body = {
              ...response,
            };
          } catch (ex) {
            Sentry.captureException(ex);
            body = {
              ok: true,
            };
          }
        } else {
          body = {
            ok: true,
          };
        }

        break;
      }
      case 'getChatMessages': {
        const [, lastMessageId] = query.minarets;
        try {
          const response = await api.chatMessages.listLatest({
            maxItems: 20,
            includeOnlineUsers: true,
            lastMessageId: lastMessageId ? Number(lastMessageId) : undefined,
          });
          body = {
            ok: true,
            ...response,
          };
        } catch (ex) {
          Sentry.captureException(ex);
          // TODO: Return false and back off future attempts?
          body = {
            ok: true,
            messages: [],
          };
        }

        break;
      }
      case 'getPassiveChatMessages': {
        // Same as above, just skips getting online users
        const [, lastMessageId] = query.minarets;
        try {
          const response = await api.chatMessages.listLatest({
            maxItems: 20,
            includeOnlineUsers: false,
            lastMessageId: lastMessageId ? Number(lastMessageId) : undefined,
          });
          body = {
            ok: true,
            ...response,
          };
        } catch (ex) {
          Sentry.captureException(ex);
          // TODO: Return false and back off future attempts?
          body = {
            ok: true,
            messages: [],
          };
        }

        break;
      }
      case 'sendChatMessage': {
        try {
          const response = await api.chatMessages.send(req.body);
          body = {
            ok: true,
            ...response,
          };
        } catch (ex) {
          Sentry.captureException(ex);
          body = {
            ok: false,
          };
        }

        break;
      }
      default:
        res.status(404);
        body = {
          ok: false,
          message: 'Invalid api method',
        };
        break;
    }
  } else {
    res.status(401);
    body = {
      ok: false,
      message: 'Unauthorized',
    };
  }

  res.json(body);
}
