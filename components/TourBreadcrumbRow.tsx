import * as React from 'react';

import type { LimitedTour } from '../minarets-api/types';

import TourBreadcrumb from './TourBreadcrumb';

interface IProps {
  tour: LimitedTour;
  toursById: Record<number, LimitedTour>;
  skipParent?: boolean;
}

function TourBreadcrumbRow({ tour, toursById, skipParent }: IProps): JSX.Element {
  return (
    <h6 className="pb-2 fw-bold">
      <TourBreadcrumb tour={tour} toursById={toursById} skipParent={skipParent} />
    </h6>
  );
}

TourBreadcrumbRow.defaultProps = {
  skipParent: false,
};

export default TourBreadcrumbRow;
