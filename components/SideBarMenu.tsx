import * as React from 'react';
import Link from 'next/link';
import { ReactElement } from 'react';

export default function Layout(): ReactElement {
  return (
    <div className="position-sticky pt-3">
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link href="/">
            <a className="nav-link">Home</a>
          </Link>
        </li>
        <li className="nav-item">
          <Link href="/concerts">
            <a className="nav-link">Concerts</a>
          </Link>
        </li>
        <li className="nav-item">
          <Link href="/tours">
            <a className="nav-link">Tours</a>
          </Link>
        </li>
        <li className="nav-item">
          <Link href="/playlists">
            <a className="nav-link">Playlists</a>
          </Link>
          <ul className="nav flex-column">
            <li className="nav-item pl-2">
              <Link href="/playlists/1/my-ideal-setlist">
                <a className="nav-link">My Ideal Set List</a>
              </Link>
            </li>
          </ul>
        </li>
        <li className="nav-item">
          <Link href="/compilations">
            <a className="nav-link">Compilations</a>
          </Link>
        </li>
        <li className="nav-item">
          <Link href="/chat">
            <a className="nav-link">Chat</a>
          </Link>
        </li>
      </ul>
    </div>
  );
}
