import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import type { Compilation } from '../api/minarets/types/Compilation';
import { slugify } from '../api/stringService';

interface IProps {
  compilation: Compilation;
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
