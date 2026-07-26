import {visit} from 'unist-util-visit';
import type {Plugin} from 'unified';
import type {Parent} from 'unist';
import glossaryEntries from '../data/glossary.json';
import {buildGlossaryIndex, splitByGlossaryMatches} from '../utils/glossaryMatch';

// Node types whose text content should never be turned into a glossary term:
// code, headings, and bold labels (term names on the Definitions page,
// "Penalty:" labels elsewhere).
const SKIP_PARENT_TYPES = new Set(['inlineCode', 'code', 'heading', 'strong']);

const glossaryIndex = buildGlossaryIndex(glossaryEntries);

const glossaryTermsPlugin: Plugin = function glossaryTermsPlugin() {
  return (tree) => {
    visit(tree, 'text', (node: {value: string}, index, parent: Parent | undefined) => {
      if (!parent || index === null || index === undefined) return;
      if (SKIP_PARENT_TYPES.has(parent.type)) return;

      const segments = splitByGlossaryMatches(node.value, glossaryIndex);
      if (segments.length === 1 && !segments[0].match) return;

      const newNodes = segments.map((segment) =>
        segment.match
          ? {
              type: 'mdxJsxTextElement',
              name: 'GlossaryTerm',
              attributes: [
                {type: 'mdxJsxAttribute', name: 'term', value: segment.match.term},
              ],
              children: [{type: 'text', value: segment.text}],
            }
          : {type: 'text', value: segment.text},
      );

      (parent.children as unknown[]).splice(index, 1, ...newNodes);
      return index + newNodes.length;
    });
  };
};

export default glossaryTermsPlugin;
