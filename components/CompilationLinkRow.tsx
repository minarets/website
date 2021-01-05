import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import type { Compilation } from '../minarets-api/minarets/types';
import { slugify } from '../minarets-api/stringService';

interface IProps {
  compilation: Pick<Compilation, 'id' | 'name'>;
}

function CompilationLinkRow({ compilation }: IProps): ReactElement {
  return (
    <div className="row">
      <div className="col">
        <Link href={`/compilations/${compilation.id}/${slugify(compilation.name)}`}>
          <a title={compilation.name}>{compilation.name}</a>
        </Link>
      </div>
    </div>
  );
}

export default CompilationLinkRow;
