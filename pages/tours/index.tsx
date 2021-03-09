import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import TourRandomConcertLink from '../../components/TourRandomConcertLink';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Minarets } from '../../minarets-api';
import type { TourWithChildren } from '../../minarets-api/minarets/types';

interface IProps {
  tours: TourWithChildren[];
}

export async function getStaticProps(): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();
  const tourResults = await api.tours.listTours();

  const toursById = tourResults.items.reduce((acc: Record<string, TourWithChildren>, tour) => {
    acc[tour.id] = {
      ...tour,
      children: [],
    };

    return acc;
  }, {});

  tourResults.items.sort((item1, item2) => new Date(item2.startsOn).getTime() - new Date(item1.startsOn).getTime());

  const tours: TourWithChildren[] = [];
  for (const tour of tourResults.items) {
    const tourWithChildren = toursById[tour.id];
    if (tour.parentId) {
      const parent = toursById[tour.parentId];
      if (parent) {
        parent.children.push(tour);
      }
    } else {
      tours.push(tourWithChildren);
    }
  }

  return {
    props: {
      tours,
    },
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ tours }: IProps): ReactElement {
  const title = 'Tours';
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
      </Head>

      <div className="card">
        <h4 className="card-header">All Tours</h4>
        {tours.map((tour) => (
          <div className="card-body" key={tour.id}>
            <h5>
              <Link href={`/tours/${tour.slug}`}>
                <a>{tour.name}</a>
              </Link>{' '}
              <TourRandomConcertLink tour={tour} />
            </h5>

            {!!tour.children.length && (
              <ul className="list-unstyled ps-4">
                {tour.children.reverse().map((childTour) => (
                  <li key={childTour.id}>
                    <Link href={`/tours/${childTour.slug}`}>
                      <a>{childTour.name}</a>
                    </Link>
                    {childTour.concertCount === 1 && ` (${childTour.concertCount} concert) `}
                    {childTour.concertCount !== 1 && ` (${childTour.concertCount} concerts) `}
                    <TourRandomConcertLink tour={childTour} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
