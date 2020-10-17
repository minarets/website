import moment from 'moment';
import type { GetStaticPropsResult } from 'next';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Concerts } from '../api/minarets';
import type { BasicConcert } from '../api/minarets/types/BasicConcert';
import ConcertAndArtistLinkRow from '../components/ConcertAndArtistLinkRow';
import Layout from '../components/Layout';

interface IProps {
  popularConcerts: BasicConcert[];
  newConcerts: BasicConcert[];
  latestConcerts: BasicConcert[];
}

export async function getStaticProps(): Promise<GetStaticPropsResult<IProps>> {
  const concertsApi = new Concerts();
  const [
    popularConcertsResults, //
    newConcertsResults,
    latestConcertsResults,
  ] = await Promise.all([
    concertsApi.listConcerts({
      sortDesc: 'Popular',
      itemsPerPage: 10,
      since: moment().subtract(1, 'w').startOf('day').toDate(),
    }),
    concertsApi.listConcerts({
      sortDesc: 'ApprovedOn',
      itemsPerPage: 10,
    }),
    concertsApi.listConcerts({
      sortDesc: 'ConcertDate',
      itemsPerPage: 10,
    }),
  ]);

  return {
    props: {
      popularConcerts: popularConcertsResults.items,
      newConcerts: newConcertsResults.items,
      latestConcerts: latestConcertsResults.items,
    },
    // Re-generate the data at most every 5 minutes
    revalidate: 300,
  };
}

export default function Page({ popularConcerts, newConcerts, latestConcerts }: IProps): ReactElement {
  return (
    <Layout title="A community for Dave Matthews Band fans">
      <section>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Most Popular Concerts</h2>
          </div>
          <div className="card-body">
            {popularConcerts.map((concert) => (
              <ConcertAndArtistLinkRow concert={concert} key={concert.id} />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">New Concerts</h2>
          </div>
          <div className="card-body">
            {newConcerts.map((concert) => (
              <ConcertAndArtistLinkRow concert={concert} key={concert.id} />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Latest Concerts</h2>
          </div>
          <div className="card-body">
            {latestConcerts.map((concert) => (
              <ConcertAndArtistLinkRow concert={concert} key={concert.id} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
