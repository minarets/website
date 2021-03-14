import Link from 'next/link';
import React from 'react';
import { connectPoweredBy } from 'react-instantsearch-dom';

import styles from '../styles/Search.module.scss';

interface IProps {
  url: string;
}

function SearchPoweredBy({ url }: IProps): React.ReactElement {
  return (
    <Link href={url}>
      <a className={styles.poweredByLink}>
        Powered by <img src="/algolia-blue-mark.svg" alt="Algolia" className={styles.algoliaLogo} /> Algolia
      </a>
    </Link>
  );
}

export default connectPoweredBy(SearchPoweredBy);
