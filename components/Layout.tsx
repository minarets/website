import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ReactElement } from 'react';
import SideBarMenu from './SideBarMenu';
import styles from '../styles/Home.module.css';

interface LayoutParams {
  title: string;
  children: ReactElement;
}

export default function Layout({ title, children }: LayoutParams): ReactElement {
  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex-grow-1">
        <header className="navbar navbar-dark bg-dark flex-md-nowrap p-0 shadow">
          <Link href="/">
            <a className="navbar-brand col-md-3 col-lg-2 mr-0 px-3">Home</a>
          </Link>
          <button
            className="navbar-toggler position-absolute d-md-none collapsed"
            type="button"
            data-toggle="collapse"
            data-target="#sidebarMenu"
            aria-controls="sidebarMenu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <input className="form-control form-control-dark w-100" type="text" placeholder="Search for concerts by date, songs, venues..." aria-label="Search" />
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap">
              <Link href="/concerts/random">
                <a className="nav-link" title="Random concert">
                  {/* https://iconmonstr.com/infinity-5-svg/ */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M18 13v5h-5l1.607-1.608c-3.404-2.824-5.642-8.392-9.179-8.392-2.113 0-3.479 1.578-3.479 4s1.365 4 3.479 4c1.664 0 2.86-1.068 4.015-2.392l1.244 1.561c-1.499 1.531-3.05 2.831-5.259 2.831-3.197 0-5.428-2.455-5.428-6s2.231-6 5.428-6c4.839 0 7.34 6.449 10.591 8.981l1.981-1.981zm.57-7c-2.211 0-3.762 1.301-5.261 2.833l1.244 1.561c1.156-1.325 2.352-2.394 4.017-2.394 2.114 0 3.48 1.578 3.48 4 0 1.819-.771 3.162-2.051 3.718v2.099c2.412-.623 4-2.829 4-5.816.001-3.546-2.231-6.001-5.429-6.001z" />
                  </svg>
                </a>
              </Link>
            </li>
          </ul>
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
            <a className="navbar-brand col-md-3 col-lg-2 mr-0 px-3" href="https://vercel.com?utm_source=minarets&utm_campaign=oss" target="_blank" rel="noopener noreferrer">
              <img src="/powered-by-vercel.svg" alt="Powered by Vercel" className={styles.logo} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
