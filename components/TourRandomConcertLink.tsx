import axios from 'axios';
import { useRouter } from 'next/router';
import * as React from 'react';

import type { BasicTour } from '../minarets-api/minarets/types';
import styles from '../styles/RandomConcertLink.module.scss';

interface IProps {
  tour: BasicTour;
}

function TourRandomConcertLink({ tour }: IProps): JSX.Element {
  const router = useRouter();
  const [randomClicked, setRandomClicked] = React.useState(false);

  async function handleRandomConcertClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): Promise<void> {
    e.preventDefault();
    setRandomClicked(true);
    const response = await axios.get<{ url: string }>(`/api/minarets/getTourRandomConcert/${tour.id}`);
    await router.push(response.data.url);
    setRandomClicked(false);
  }

  if (randomClicked) {
    return (
      <div className="spinner-border spinner-border-sm" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  return (
    <a href={`/tours/${tour.slug}`} onClick={handleRandomConcertClick} title={`Random concert for ${tour.name}`} rel="nofollow">
      <img src="/random.svg" alt={`Random concert for ${tour.name}`} className={styles.logo} />
    </a>
  );
}

export default TourRandomConcertLink;
