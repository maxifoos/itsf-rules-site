import React, {type ReactNode} from 'react';
import penaltyEntries from '@site/src/data/penalties.json';
import glossaryEntries from '@site/src/data/glossary.json';
import {buildGlossaryIndex, splitByGlossaryMatches} from '@site/src/utils/glossaryMatch';
import GlossaryTerm from '@site/src/components/GlossaryTerm';
import HoverTooltip from '@site/src/components/HoverTooltip';
import styles from './styles.module.css';

const penaltyIndex = buildGlossaryIndex(penaltyEntries);
// Penalty descriptions reference regular glossary concepts (possession, team, restart, ...);
// nested matches there link to the real GlossaryTerm, same as running prose.
const glossaryIndex = buildGlossaryIndex(glossaryEntries);

export default function PenaltyTerm({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}): ReactNode {
  const entry = penaltyIndex.lookup.get(term.toLowerCase());
  if (!entry) {
    return <>{children}</>;
  }

  const bodySegments = splitByGlossaryMatches(entry.definition, glossaryIndex);

  return (
    <HoverTooltip
      triggerClassName={styles.penaltyTerm}
      tooltipClassName={styles.tooltip}
      tooltip={
        <>
          <span className={styles.tooltipTitle}>{entry.term}</span>
          <span className={styles.tooltipBody}>
            {bodySegments.map((segment, i) =>
              segment.match ? (
                <GlossaryTerm key={i} term={segment.match.term}>
                  {segment.text}
                </GlossaryTerm>
              ) : (
                <React.Fragment key={i}>{segment.text}</React.Fragment>
              ),
            )}
          </span>
        </>
      }
    >
      {children}
    </HoverTooltip>
  );
}
