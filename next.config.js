'use strict';

// const { Artists } = require('./api/minarets');

module.exports = {
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    // const artistApi = new Artists();
    // const artists = await artistApi.listAllArtists();
    // TODO: Add redirects for venues, compilations, playlists, and concerts

    return [
      // ...artists.map((artist) => {
      //   return {
      //     source: `/artists/${artist.id}`,
      //     destination: `/artists/${artist.id}/${slugify(artist.name)}`,
      //     permanent: false,
      //   };
      // }),
      {
        source: '/Artists/Detail/:slug*',
        destination: '/artists/:slug*',
        permanent: true,
      },
      {
        source: '/Artists/RandomConcert/:slug*',
        destination: '/artists/:slug*/random',
        permanent: true,
      },
      {
        source: '/Concerts/Detail/:slug*',
        destination: '/concerts/:slug*',
        permanent: true,
      },
      {
        source: '/Compilations/Detail/:slug*',
        destination: '/compilations/:slug*',
        permanent: true,
      },
      {
        source: '/Playlists/Detail/:slug*',
        destination: '/playlists/:slug*',
        permanent: true,
      },
      {
        source: '/Tours/Detail/:slug*',
        destination: '/tours/:slug*',
        permanent: true,
      },
      {
        source: '/Tours/RandomConcert/:slug*',
        destination: '/tours/:slug*/random',
        permanent: true,
      },
      {
        source: '/Users/Detail/:slug*',
        destination: '/users/:slug*',
        permanent: true,
      },
    ];
  }
}
