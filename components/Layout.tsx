import * as Sentry from '@sentry/browser';
import type { User as NextAuthUser } from 'next-auth';
import { useSession } from 'next-auth/client';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import styles from '../styles/Layout.module.scss';

import ChatWidget from './ChatWidget';
import MainMenu from './MainMenu';

const Player = dynamic(() => import('./Player'), { ssr: false });

interface LayoutParams {
  children: React.ReactElement;
}

interface IExtendedNextAuthUser extends NextAuthUser {
  token: string;
}

function Layout({ children }: LayoutParams): React.ReactElement {
  const [session, loading] = useSession();
  const [randomClicked, setRandomClicked] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (session) {
      Sentry.setUser({
        id: session.user.email || undefined,
        email: session.user.email || undefined,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [session]);

  async function handleRandomConcertClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): Promise<void> {
    e.preventDefault();
    setRandomClicked(true);
    const response = await fetch('/api/minarets/getRandomConcert');
    if (response.ok) {
      const result = (await response.json()) as { url: string };

      await router.push(result.url);
      setRandomClicked(false);
    }
  }

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
        <header className={`${styles.headerNavbar} px-3 py-3`}>
          <Link href="/">
            <a className={`navbar-brand ${styles.logo}`}>Minarets</a>
          </Link>
          <div className="flex-grow-1 px-3">
            <MainMenu />
          </div>
          {session && !randomClicked && (
            <div className="pe-3 my-auto">
              <a href="/" title="Random concert" onClick={handleRandomConcertClick} className={styles.randomConcert} rel="nofollow">
                <svg role="img" height="25" width="25" viewBox="0 0 24 24" className={styles.hoverGrow}>
                  <path d="M18 13v5h-5l1.607-1.608c-3.404-2.824-5.642-8.392-9.179-8.392-2.113 0-3.479 1.578-3.479 4s1.365 4 3.479 4c1.664 0 2.86-1.068 4.015-2.392l1.244 1.561c-1.499 1.531-3.05 2.831-5.259 2.831-3.197 0-5.428-2.455-5.428-6s2.231-6 5.428-6c4.839 0 7.34 6.449 10.591 8.981l1.981-1.981zm.57-7c-2.211 0-3.762 1.301-5.261 2.833l1.244 1.561c1.156-1.325 2.352-2.394 4.017-2.394 2.114 0 3.48 1.578 3.48 4 0 1.819-.771 3.162-2.051 3.718v2.099c2.412-.623 4-2.829 4-5.816.001-3.546-2.231-6.001-5.429-6.001z" />
                </svg>
              </a>
            </div>
          )}
          {session && randomClicked && (
            <div className="pe-3 my-auto">
              <div className={`${styles.randomConcertLoading} spinner-border spinner-border-sm`} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          <div className="pe-3 my-auto">
            <Link href="/donate">
              <a title="Help support the site!" className={styles.donateButton}>
                <svg role="img" height="25" width="25" viewBox="0 0 24 24" className={styles.hoverGrow}>
                  <path d="M6.736 4C4.657 4 2.5 5.88 2.5 8.514c0 3.107 2.324 5.96 4.861 8.12a29.66 29.66 0 004.566 3.175l.073.041.073-.04c.271-.153.661-.38 1.13-.674.94-.588 2.19-1.441 3.436-2.502 2.537-2.16 4.861-5.013 4.861-8.12C21.5 5.88 19.343 4 17.264 4c-2.106 0-3.801 1.389-4.553 3.643a.75.75 0 01-1.422 0C10.537 5.389 8.841 4 6.736 4zM12 20.703l.343.667a.75.75 0 01-.686 0l.343-.667zM1 8.513C1 5.053 3.829 2.5 6.736 2.5 9.03 2.5 10.881 3.726 12 5.605 13.12 3.726 14.97 2.5 17.264 2.5 20.17 2.5 23 5.052 23 8.514c0 3.818-2.801 7.06-5.389 9.262a31.146 31.146 0 01-5.233 3.576l-.025.013-.007.003-.002.001-.344-.666-.343.667-.003-.002-.007-.003-.025-.013A29.308 29.308 0 0110 20.408a31.147 31.147 0 01-3.611-2.632C3.8 15.573 1 12.332 1 8.514z" />
                </svg>
              </a>
            </Link>
          </div>
          {(!session || (session.user && session.user.image)) && !loading && (
            <div className="my-auto">
              {!session && !loading && (
                <Link href="/api/auth/signin">
                  <a title="Login">Login</a>
                </Link>
              )}
              {session && !loading && session.user && session.user.image && (
                <img className={`rounded ${styles.userImage}`} src={session.user.image} alt={`${session.user.name || ''} - ${(session.user as IExtendedNextAuthUser).token}`} />
              )}
            </div>
          )}
        </header>
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
            {!session && (
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
            {!!session && <ChatWidget />}
          </aside>
        </div>
        {!!session && <Player />}
      </div>
    </>
  );
}

export default Layout;
