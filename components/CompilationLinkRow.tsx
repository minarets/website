import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import { getCompilationUrl } from '../minarets-api/compilationService';
import type { Compilation } from '../minarets-api/minarets/types';

interface IProps {
  compilation: Pick<Compilation, 'id' | 'name'>;
}

function CompilationLinkRow({ compilation }: IProps): ReactElement {
  return (
    <div className="row">
      <div className="col">
        <Link href={getCompilationUrl(compilation)}>
          <a title={compilation.name}>{compilation.name}</a>
        </Link>
      </div>
    </div>
  );
}

export default CompilationLinkRow;
