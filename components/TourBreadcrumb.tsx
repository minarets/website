import * as React from 'react';
import { ReactElement } from 'react';
import { Tour } from '../api/minarets/types/Tour';
import { slugify } from '../api/stringService';

interface IProps {
  tour: Tour;
  toursById: Record<number, Tour>;
  skipParent?: boolean;
}

function TourBreadcrumb({ tour, toursById, skipParent }: IProps): ReactElement {
  let parentTour: Tour | undefined;
  if (!skipParent && tour.parentId) {
    parentTour = toursById[tour.parentId];
  }

  return (
    <span>
      {parentTour && (
        <span>
          <TourBreadcrumb tour={parentTour} toursById={toursById} key={parentTour.id} /> &raquo;{' '}
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
