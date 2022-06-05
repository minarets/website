import Link from 'next/link';
import * as React from 'react';

import { getTourUrl } from '../minarets-api/tourService';
import type { LimitedTour } from '../minarets-api/types';

interface IProps {
  tour: LimitedTour;
  toursById: Record<number, LimitedTour>;
  skipParent?: boolean;
}

function TourBreadcrumb({ tour, toursById, skipParent }: IProps): JSX.Element {
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
      <Link href={getTourUrl(tour)}>
        <a>{tour.name}</a>
      </Link>
    </span>
  );
}

TourBreadcrumb.defaultProps = {
  skipParent: false,
};

export default TourBreadcrumb;
