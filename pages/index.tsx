import * as React from 'react';
import { ReactElement } from 'react';
import { GetStaticPropsResult } from 'next';
import moment from 'moment';
import Layout from '../components/Layout';
import { BasicConcert } from '../api/minarets/types/BasicConcert';
import { Concerts } from '../api/minarets';
import ConcertAndLinkRow from '../components/ConcertAndArtisLinkRow';

interface IProps {
  popularConcerts: BasicConcert[];
  newConcerts: BasicConcert[];
  latestConcerts: BasicConcert[];
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
              <ConcertAndLinkRow concert={concert} key={concert.id} />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">New Concerts</h2>
          </div>
          <div className="card-body">
            {newConcerts.map((concert) => (
              <ConcertAndLinkRow concert={concert} key={concert.id} />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Latest Concerts</h2>
          </div>
          <div className="card-body">
            {latestConcerts.map((concert) => (
              <ConcertAndLinkRow concert={concert} key={concert.id} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps(): Promise<GetStaticPropsResult<IProps>> {
  const concerts = new Concerts();
  const [
    popularConcertsResults, //
    newConcertsResults,
    latestConcertsResults,
  ] = await Promise.all([
    concerts.listConcerts({
      sortDesc: 'Popular',
      itemsPerPage: 10,
      since: moment().subtract(1, 'w').startOf('day').toDate(),
    }),
    concerts.listConcerts({
      sortDesc: 'ApprovedOn',
      itemsPerPage: 10,
    }),
    concerts.listConcerts({
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
