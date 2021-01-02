import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import { slugify } from '../api/stringService';
import type { LimitedTour } from '../api/types';

interface IProps {
  tour: LimitedTour;
  toursById: Record<number, LimitedTour>;
  skipParent?: boolean;
}

function TourBreadcrumb({ tour, toursById, skipParent }: IProps): ReactElement {
  let parentTour: LimitedTour | undefined;
  if (!skipParent && tour.parentId) {
    parentTour = toursById[tour.parentId];
  }

  return (
    <span>
      {parentTour && (
        <span>
          <TourBreadcrumb tour={parentTour} toursById={toursById} /> &raquo;{' '}
        </span>
      )}
      <Link href={`/tours/${slugify(tour.name)}`}>
        <a>{tour.name}</a>
      </Link>
    </span>
  );
}

TourBreadcrumb.defaultProps = {
  skipParent: false,
};

export default TourBreadcrumb;
