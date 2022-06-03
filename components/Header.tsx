import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useQuery } from 'react-query';

import styles from '../styles/Header.module.scss';

import Search from './Search';

export default function Header(): React.ReactElement {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const router = useRouter();

  const mainMenuContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [showMainMenu, setShowMainMenu] = React.useState<boolean>(false);
  const {
    data: randomConcertUrl,
    isLoading: isLoadingRandomConcertUrl,
    refetch: refreshRandomConcertUrl,
  } = useQuery(
    ['randomConcertUrl'],
    async () => {
      if (!isAuthenticated) {
        return '/';
      }

      const response = await fetch('/api/minarets/getRandomConcert');
      if (response.ok) {
        const result = (await response.json()) as { url: string };

        return result.url;
      }

      throw new Error('Error getting random show url');
    },
    {
      useErrorBoundary: false,
      suspense: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      cacheTime: Number.POSITIVE_INFINITY,
      staleTime: Number.POSITIVE_INFINITY,
    },
  );

  function handleMainMenuClick(e: React.KeyboardEvent | React.MouseEvent): void {
    e.preventDefault();
    e.nativeEvent.preventDefault();

    setShowMainMenu(!showMainMenu);
  }

  // Close the menu when there's a click outside of the menu
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent): void {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Ignoring e.target is not assignable to Node
      if (mainMenuContainerRef.current && !mainMenuContainerRef.current.contains(e.target)) {
        setShowMainMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);

    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [mainMenuContainerRef]);

  React.useEffect(() => {
    function handleRouteChange(): void {
      setShowMainMenu(false);
    }

    router.events.on('routeChangeStart', handleRouteChange);

    return (): void => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  return (
    <header className={`${styles.headerNavbar} px-3 py-3 navbar navbar-expand-lg`}>
      <Link href="/">
        <a className={`navbar-brand ${styles.logo} d-none d-lg-block`}>Minarets</a>
      </Link>
      <div className="dropdown d-lg-none" ref={mainMenuContainerRef}>
        <Link href="/">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a className={`navbar-brand ${styles.logo} dropdown-toggle`} onClick={handleMainMenuClick} onKeyPress={handleMainMenuClick} role="button" tabIndex={0}>
            Minarets
          </a>
        </Link>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <ul className={`dropdown-menu shadow ${showMainMenu ? 'show' : ''}`}>
          <li>
            <Link href="/">
              <a className="dropdown-item">Home</a>
            </Link>
          </li>
          <li>
            <Link href="/concerts">
              <a className="dropdown-item">Concerts</a>
            </Link>
          </li>
          <li>
            <Link href="/tours">
              <a className="dropdown-item">Tours</a>
            </Link>
          </li>
          <li>
            <Link href="/artists">
              <a className="dropdown-item">Artists</a>
            </Link>
          </li>
          <li>
            <Link href="/playlists">
              <a className="dropdown-item">Playlists</a>
            </Link>
          </li>
          <li>
            <Link href="/compilations">
              <a className="dropdown-item">Compilations</a>
            </Link>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li className="px-2">
            <Search />
          </li>
        </ul>
      </div>
      <div className="flex-grow-1 px-3">
        <div className="d-flex justify-content-between">
          <div className="flex-shrink-1 pe-3 d-none d-lg-block">
            <nav>
              <div className="nav navbar-nav">
                <Link href="/concerts">
                  <a className="nav-link">Concerts</a>
                </Link>
                <Link href="/tours">
                  <a className="nav-link">Tours</a>
                </Link>
                <Link href="/artists">
                  <a className="nav-link">Artists</a>
                </Link>
                <Link href="/playlists">
                  <a className="nav-link">Playlists</a>
                </Link>
                {/*{!!playlists.length && (
                <ul className="nav flex-column">
                  {playlists.map((playlist) => (
                    <li className="nav-item ps-2" key={playlist.id}>
                      <Link href={`/playlists/${playlist.id}/${slugify(playlist.name)}`}>
                        <a className="nav-link">{playlist.name}</a>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}*/}
                <Link href="/compilations">
                  <a className="nav-link">Compilations</a>
                </Link>
              </div>
            </nav>
          </div>

          <div className={`d-none d-lg-block flex-grow-1 ${styles.searchBar}`}>
            <Search />
          </div>
        </div>
      </div>
      {isAuthenticated && !!randomConcertUrl && (
        <div className="pe-3 my-auto">
          <Link href={randomConcertUrl}>
            <button
              type="button"
              title="Random concert"
              className={`btn ${styles.randomConcert}`}
              disabled={isLoadingRandomConcertUrl}
              onClick={() => {
                void refreshRandomConcertUrl();
              }}
            >
              <svg role="img" height="25" width="25" viewBox="0 0 24 24" className={styles.hoverGrow}>
                <path d="M18 13v5h-5l1.607-1.608c-3.404-2.824-5.642-8.392-9.179-8.392-2.113 0-3.479 1.578-3.479 4s1.365 4 3.479 4c1.664 0 2.86-1.068 4.015-2.392l1.244 1.561c-1.499 1.531-3.05 2.831-5.259 2.831-3.197 0-5.428-2.455-5.428-6s2.231-6 5.428-6c4.839 0 7.34 6.449 10.591 8.981l1.981-1.981zm.57-7c-2.211 0-3.762 1.301-5.261 2.833l1.244 1.561c1.156-1.325 2.352-2.394 4.017-2.394 2.114 0 3.48 1.578 3.48 4 0 1.819-.771 3.162-2.051 3.718v2.099c2.412-.623 4-2.829 4-5.816.001-3.546-2.231-6.001-5.429-6.001z" />
              </svg>
            </button>
          </Link>
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
      {(!isAuthenticated || (session && session.user && session.user.image)) && !loading && (
        <div className="my-auto">
          {!isAuthenticated && !loading && (
            <Link href="/api/auth/signin">
              <a title="Login">Login</a>
            </Link>
          )}
          {isAuthenticated && session && session.user && session.user.image && <img className={`rounded ${styles.userImage}`} src={session.user.image} alt={`${session.user.name || ''}`} />}
        </div>
      )}
    </header>
  );
}
