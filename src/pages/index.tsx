import type {ReactNode} from 'react';
import {Redirect} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

// The "Standard Matchplay Rules" category's generated index (the chapter
// tile grid, at /rules) doubles as the site's homepage.
export default function Home(): ReactNode {
  return <Redirect to={useBaseUrl('/rules')} />;
}
