import * as React from 'react';
import type { ReactElement } from 'react';

import { slugify } from '../api/stringService';
import type { LimitedTour } from '../api/types/LimitedTour';

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
      <a href={`/tours/${slugify(tour.name)}`} title={tour.name}>
        {tour.name}
      </a>
    </span>
  );
}

TourBreadcrumb.defaultProps = {
  skipParent: false,
};

export default TourBreadcrumb;
