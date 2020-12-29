import type { GetStaticPropsResult } from 'next';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Minarets } from '../../api/minarets';
import type { TourWithChildren } from '../../api/minarets/types';
import Layout from '../../components/Layout';
import styles from '../../styles/Tours.module.css';

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

  tourResults.items.sort((item1, item2) => {
    return new Date(item2.startsOn).getTime() - new Date(item1.startsOn).getTime();
  });

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
  return (
    <Layout title="Tours">
      <section>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">All Tours</h2>
          </div>
          {tours.map((tour) => (
            <div className="card-body" key={tour.id}>
              <h5>
                <a href={`/tours/${tour.slug}`} title={tour.name}>
                  {tour.name} ({tour.concertCount})
                </a>{' '}
                <a href={`/tours/${tour.slug}/random`} title={`Random concert for ${tour.name}`}>
                  Random Concert
                </a>
              </h5>

              {tour.children.length && (
                <ul className="list-unstyled ps-4">
                  {tour.children.reverse().map((childTour) => (
                    <li key={childTour.id}>
                      <a href={`/tours/${childTour.slug}`} title={childTour.name}>
                        {childTour.name}
                        {' ('}
                        {childTour.concertCount}{' '}
                        <a href={`/tours/${childTour.slug}/random`} title={`Random concert for ${childTour.name}`}>
                          <img src="/random.svg" alt={`Random concert for ${childTour.name}`} className={styles.logo} />
                        </a>
                        )
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
