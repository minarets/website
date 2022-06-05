import * as Sentry from '@sentry/browser';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';

import styles from '../styles/Layout.module.scss';

import ChatWidget from './ChatWidget';
import Header from './Header';

const Player = dynamic(() => import('./Player'), { ssr: false });

interface LayoutParams {
  children: JSX.Element;
}

function Layout({ children }: LayoutParams): JSX.Element {
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';

  React.useEffect(() => {
    if (session && session.user) {
      Sentry.setUser({
        id: session.user.email || undefined,
        email: session.user.email || undefined,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>A community for Dave Matthews Band fans · Minarets</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <div className={styles.grid}>
        <Header />
        <div className={styles.gridBody}>
          <div className={styles.mainBody}>
            <main className="flex-grow-1">
              <div className="container-fluid">{children}</div>
            </main>

            <footer className="flex-shrink-0">
              <div className="footer mt-auto py-3 bg-light shadow sticky-xl-bottom">
                <div className="container-fluid">
                  <div className="row">
                    <div className="col text-start">
                      <a className="navbar-brand" href="https://vercel.com?utm_source=minarets&utm_campaign=oss" target="_blank" rel="noopener noreferrer">
                        <img src="/powered-by-vercel.svg" alt="Powered by Vercel" className={styles.footerLogo} />
                      </a>
                    </div>
                    <div className="col text-end">
                      <a className="navbar-brand" href="https://github.com/minarets/website" target="_blank" rel="noopener noreferrer">
                        <img src="/github.svg" alt="Open Source" className={styles.footerLogo} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <aside className={styles.chatColumn}>
            {!isAuthenticated && (
              <div className="position-relative">
                <div className="position-absolute top-50 start-50 translate-middle">
                  <Link href="/api/auth/signin">
                    <a title="Login" className="btn btn-primary btn-lg">
                      Login to chat and listen to music!
                    </a>
                  </Link>
                </div>
              </div>
            )}
            {isAuthenticated && <ChatWidget />}
          </aside>
        </div>
        {isAuthenticated && <Player />}
      </div>
    </>
  );
}

export default Layout;
