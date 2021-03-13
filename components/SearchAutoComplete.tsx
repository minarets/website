import * as Sentry from '@sentry/browser';
import { useRouter } from 'next/router';
import React from 'react';
import type { SuggestionSelectedEventData, SuggestionsFetchRequestedParams, ChangeEvent } from 'react-autosuggest';
import AutoSuggest from 'react-autosuggest';
import type { BasicDoc, Hit } from 'react-instantsearch-core';
import { Highlight, connectAutoComplete } from 'react-instantsearch-dom';

interface IndexedDocument extends BasicDoc {
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

  function renderSectionTitle(section: { index: React.ReactNode }): React.ReactNode {
    return section.index;
  }

  function getSectionSuggestions(section: { hits: AutoCompleteType[] }): AutoCompleteType[] {
    return section.hits;
  }

  const inputProps = {
    placeholder: 'Search for concerts by date, songs, venues...',
    onChange(_event: React.FormEvent, { newValue }: ChangeEvent): void {
      setValue(newValue);
    },
    value,
  };

  const joinedHits = [];
  for (const section of hits) {
    joinedHits.push(...section.hits);
  }

  return (
    <AutoSuggest
      suggestions={joinedHits}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      onSuggestionSelected={onSuggestionSelected}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
      renderSectionTitle={renderSectionTitle}
      getSectionSuggestions={getSectionSuggestions}
      theme={{
        container: 'flex-grow-1',
        getFromContainer: 'autosuggest',
        input: 'form-control shadow-none',
        suggestionsContainer: 'dropdown',
        suggestionsList: `dropdown-menu ${hits.length ? 'show' : ''}`,
        suggestion: 'dropdown-item',
        suggestionHighlighted: 'active',
      }}
    />
  );
}

export default connectAutoComplete(SearchAutoComplete);
