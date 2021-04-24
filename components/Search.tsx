import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import { InstantSearch, Configure, Index } from 'react-instantsearch-dom';

import SearchAutoComplete from './SearchAutoComplete';

const searchClient = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID || '', process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || '');

export default function Search(): React.ReactElement {
  return (
    <InstantSearch indexName="concerts" searchClient={searchClient}>
      <SearchAutoComplete />
      <Configure hitsPerPage={5} attributesToSnippet={['name:7']} />
      <Index indexName="concerts" />
      <Index indexName="compilations" />
    </InstantSearch>
  );
}
