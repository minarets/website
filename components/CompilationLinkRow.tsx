import Link from 'next/link';
import * as React from 'react';

import { getCompilationUrl } from '../minarets-api/compilationService';
import type { BasicCompilation } from '../minarets-api/minarets/types';

interface IProps {
  compilation: BasicCompilation;
}

function CompilationLinkRow({ compilation }: IProps): JSX.Element {
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
