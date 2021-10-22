import * as Sentry from '@sentry/browser';
import { useRouter } from 'next/router';
import React from 'react';
import type { SuggestionSelectedEventData, SuggestionsFetchRequestedParams, ChangeEvent } from 'react-autosuggest';
import AutoSuggest from 'react-autosuggest';
import type { BasicDoc, Hit } from 'react-instantsearch-core';
import { Highlight, connectAutoComplete } from 'react-instantsearch-dom';

import { useMediaQuery } from '../hooks/useMediaQuery';
import styles from '../styles/Search.module.scss';

import SearchPoweredBy from './SearchPoweredBy';

interface IndexedDocument extends BasicDoc {
  objectID: string;
  name: string;
  url: string;
}

type AutoCompleteType = Hit<IndexedDocument>;

interface SearchAutoCompleteProps<TDoc = BasicDoc> {
  hits: readonly { hits: Hit<TDoc>[] }[];
  currentRefinement: string;
  refine(value?: string): void;
}

function SearchAutoComplete({ currentRefinement, hits, refine }: SearchAutoCompleteProps<IndexedDocument>): React.ReactElement {
  const [value, setValue] = React.useState<string>(currentRefinement);
  const router = useRouter();
  const hitIds: string[] = [];
  for (const hitSection of hits) {
    for (const hit of hitSection.hits) {
      hitIds.push(hit.objectID);
    }
  }

  function onSuggestionsFetchRequested({ value: requestValue }: SuggestionsFetchRequestedParams): void {
    refine(requestValue);
  }

  function onSuggestionsClearRequested(): void {
    refine();
  }

  function getSuggestionValue(): string {
    return '';
  }

  function renderSuggestion(hit: Hit): React.ReactElement {
    return <Highlight attribute="name" hit={hit} tagName="mark" />;
  }

  function onSuggestionSelected(_event: React.FormEvent, { suggestion }: SuggestionSelectedEventData<AutoCompleteType>): void {
    router.push(suggestion.url).catch((ex) => Sentry.captureException(ex));
  }

  function renderSectionTitle(section: { index: string; isFooter?: boolean }): React.ReactNode {
    if (section.isFooter) {
      return (
        <>
          <hr className="dropdown-divider" />
          <li className="dropdown-item-text">
            <SearchPoweredBy />
          </li>
        </>
      );
    }

    if (section.index) {
      return (
        <h6 className="dropdown-header">
          {section.index.charAt(0).toUpperCase()}
          {section.index.slice(1)}
        </h6>
      );
    }

    return section.index;
  }

  function getSectionSuggestions(section: { hits: AutoCompleteType[] }): AutoCompleteType[] {
    return section.hits;
  }

  const isMobile = useMediaQuery('(max-width: 1023px)');

  const inputProps = {
    placeholder: isMobile ? 'Search' : 'Search for concerts by date, songs, venues...',
    onChange(_event: React.FormEvent, { newValue }: ChangeEvent): void {
      setValue(newValue);
    },
    value,
  };

  const sectionsWithHits = [];
  if (value) {
    for (const section of hits) {
      if (section.hits.length) {
        sectionsWithHits.push(section);
      }
    }

    if (sectionsWithHits.length) {
      sectionsWithHits.push({
        isFooter: true,
        hits: [],
      });
    }
  }

  return (
    <AutoSuggest
      suggestions={sectionsWithHits}
      multiSection
      onSuggestionsFetchRequested={(request): void => onSuggestionsFetchRequested(request)}
      onSuggestionsClearRequested={(): void => onSuggestionsClearRequested()}
      onSuggestionSelected={(event, params: SuggestionSelectedEventData<AutoCompleteType>): void => onSuggestionSelected(event, params)}
      getSuggestionValue={(): string => getSuggestionValue()}
      renderSuggestion={(suggestion: Hit): React.ReactElement => renderSuggestion(suggestion)}
      inputProps={inputProps}
      renderSectionTitle={(section: { index: string; isFooter?: boolean }): React.ReactNode => renderSectionTitle(section)}
      getSectionSuggestions={(section: { hits: AutoCompleteType[] }): AutoCompleteType[] => getSectionSuggestions(section)}
      theme={{
        container: `flex-grow-1 dropdown ${styles.searchContainer}`,
        getFromContainer: 'autosuggest',
        input: 'form-control shadow-none',
        suggestionsContainer: 'dropdown-menu',
        suggestionsContainerOpen: 'show',
        suggestionsList: `list-unstyled ${styles.searchItemList}`,
        suggestion: `dropdown-item ${styles.searchItem}`,
        suggestionHighlighted: 'active',
      }}
    />
  );
}

export default connectAutoComplete(SearchAutoComplete);
