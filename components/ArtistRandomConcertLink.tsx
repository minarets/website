import { useRouter } from 'next/router';
import * as React from 'react';

import { getArtistUrl } from '../minarets-api/artistService';
import type { BasicArtist } from '../minarets-api/minarets/types';
import styles from '../styles/RandomConcertLink.module.scss';

interface IProps {
  artist: BasicArtist;
}

function ArtistRandomConcertLink({ artist }: IProps): JSX.Element {
  const router = useRouter();
  const [randomClicked, setRandomClicked] = React.useState(false);

  async function handleRandomConcertClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): Promise<void> {
    e.preventDefault();
    setRandomClicked(true);
    const response = await fetch(`/api/minarets/getArtistRandomConcert/${artist.id}`);
    if (response.ok) {
      const result = (await response.json()) as { url: string };

      await router.push(result.url);
      setRandomClicked(false);
    }
  }

  if (randomClicked) {
    return (
      <div className="spinner-border spinner-border-sm" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  return (
    <a href={getArtistUrl(artist)} onClick={handleRandomConcertClick} title={`Random concert for ${artist.name}`} rel="nofollow">
      <img src="/random.svg" alt={`Random concert for ${artist.name}`} className={styles.logo} />
    </a>
  );
}

export default ArtistRandomConcertLink;
