import type { GetStaticPropsResult } from 'next';
import * as React from 'react';
import type { ReactElement } from 'react';

import Layout from '../../components/Layout';
import VenueWithConcertCountLinkRow from '../../components/VenueWithConcertCountLinkRow';
import { Minarets } from '../../minarets-api';
import type { Venue } from '../../minarets-api/minarets/types';

interface IProps {
  venues: Venue[];
}

export async function getStaticProps(): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();
  const venues = await api.venues.listVenues({
    sortAsc: 'Name',
    itemsPerPage: 10,
  });

  return {
    props: {
      venues: venues.items,
    },
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ venues }: IProps): ReactElement {
  return (
    <Layout title="Venues">
      <section>
        <div className="card">
          <h4 className="card-header">All Venues</h4>
          <div className="card-body">
            {venues.map((venue) => (
              <VenueWithConcertCountLinkRow venue={venue} key={venue.id} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
