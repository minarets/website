import type { User as NextAuthUser } from 'next-auth';
import { useSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from '../styles/Layout.module.scss';

import Player from './Player';
import SideBarMenu from './SideBarMenu';

interface LayoutParams {
  title: string;
  description?: string;
  keywords?: string;
  children: ReactElement;
}

interface IExtendedNextAuthUser extends NextAuthUser {
  token: string;
}

function Layout({ title, description, keywords, children }: LayoutParams): ReactElement {
  const [session, loading] = useSession();
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={session ? styles.playerVisible : ''}>
        <div className="flex-grow-1">
          <header className={`${styles.headerNavbar} px-3 py-1`}>
            <Link href="/">
              <a className="navbar-brand">Minarets</a>
            </Link>
            <div className="flex-grow-1 px-3">
              {/*<input className="form-control form-control-dark w-100" type="text" placeholder="Search for concerts by date, songs, venues..." aria-label="Search" />*/}
            </div>
            <div className="pe-3 my-auto">
              <Link href="/concerts/random">
                <a title="Random concert" className={styles.randomButton}>
                  <img src="/random.svg" alt="Random concert" />
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

          <div className="container-fluid">
            <div className="row">
              <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
                <SideBarMenu />
              </nav>

              <main className="col-md-9 ml-sm-auto col-lg-10 px-md-4">{children}</main>
            </div>
          </div>
        </div>

        <footer className="flex-shrink-0">
          <div className="footer mt-auto py-3 bg-light shadow sticky-xl-bottom">
            <div className="container-fluid">
              <div className="row">
                <div className="col text-start">
                  <a className="navbar-brand" href="https://vercel.com?utm_source=minarets&utm_campaign=oss" target="_blank" rel="noopener noreferrer">
                    <img src="/powered-by-vercel.svg" alt="Powered by Vercel" className={styles.logo} />
                  </a>
                </div>
                <div className="col text-end">
                  <a className="navbar-brand" href="https://github.com/minarets/website" target="_blank" rel="noopener noreferrer">
                    <img src="/github.svg" alt="Open Source" className={styles.logo} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <Player />
    </>
  );
}

Layout.defaultProps = {
  description: '',
  keywords: '',
};

export default Layout;
