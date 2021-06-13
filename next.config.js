'use strict';

const SentryWebpackPlugin = require('@sentry/webpack-plugin');

// const { Artists } = require('./api/minarets');

const {
  NEXT_PUBLIC_SENTRY_DSN,
  SENTRY_ORG,
  SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN,
  NODE_ENV,
  VERCEL_GITHUB_COMMIT_SHA,
} = process.env;

process.env.SENTRY_DSN = NEXT_PUBLIC_SENTRY_DSN;
const basePath = ''

module.exports = {
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  env: {
    // Make the COMMIT_SHA available to the client so that Sentry events can be
    // marked for the release they belong to. It may be undefined if running
    // outside of Vercel
    NEXT_PUBLIC_COMMIT_SHA: VERCEL_GITHUB_COMMIT_SHA,
  },
  future: {
    webpack5: true,
  },
  webpack: (config, options) => {
    // In `pages/_app.js`, Sentry is imported from @sentry/browser. While
    // @sentry/node will run in a Node.js environment. @sentry/node will use
    // Node.js-only APIs to catch even more unhandled exceptions.
    //
    // This works well when Next.js is SSRing your page on a server with
    // Node.js, but it is not what we want when your client-side bundle is being
    // executed by a browser.
    //
    // Luckily, Next.js will call this webpack function twice, once for the
    // server and once for the client. Read more:
    // https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config
    //
    // So ask Webpack to replace @sentry/node imports with @sentry/browser when
    // building the browser's bundle
    if (!options.isServer) {
      config.resolve.alias['@sentry/node'] = '@sentry/browser'
    }

    // Define an environment variable so source code can check whether or not
    // it's running on the server so we can correctly initialize Sentry
    config.plugins.push(
      new options.webpack.DefinePlugin({
        'process.env.NEXT_IS_SERVER': JSON.stringify(
          options.isServer.toString()
        ),
      })
    )

    // When all the Sentry configuration env variables are available/configured
    // The Sentry webpack plugin gets pushed to the webpack plugins to build
    // and upload the source maps to sentry.
    // This is an alternative to manually uploading the source maps
    // Note: This is disabled in development mode.
    if (
      NEXT_PUBLIC_SENTRY_DSN &&
      SENTRY_ORG &&
      SENTRY_PROJECT &&
      SENTRY_AUTH_TOKEN &&
      VERCEL_GITHUB_COMMIT_SHA &&
      NODE_ENV === 'production'
    ) {
      config.plugins.push(
        new SentryWebpackPlugin({
          include: '.next',
          ignore: ['node_modules'],
          stripPrefix: ['webpack://_N_E/'],
          urlPrefix: `~${basePath}/_next`,
          release: VERCEL_GITHUB_COMMIT_SHA,
        })
      )
    }
    return config
  },
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
        destination: '/',
        permanent: false,
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
        destination: '/',
        permanent: false,
      },
      {
        source: '/Users/Detail/:slug*',
        destination: '/users/:slug*',
        permanent: true,
      },
    ];
  },
  basePath,
}
