import fs from 'fs';
import path from 'path';
import {visit} from 'unist-util-visit';
import type {Plugin} from 'unified';
import type {Parent} from 'unist';

const DEFINITIONS_FILE = path.join(process.cwd(), 'docs', '02-definitions.md');
const DEFINITIONS_TERM_LINE = /\*\*([^*]+)\*\*:\s*(.+)/g;

// Node types whose text content should never be turned into glossary links
// (code, headings, and our own injected spans).
const SKIP_PARENT_TYPES = new Set(['inlineCode', 'code', 'heading']);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadDefinitions(): Map<string, string> {
  const content = fs.readFileSync(DEFINITIONS_FILE, 'utf-8');
  const definitions = new Map<string, string>();
  let match: RegExpExecArray | null;
  while ((match = DEFINITIONS_TERM_LINE.exec(content)) !== null) {
    const term = match[1].trim();
    const definition = match[2].trim();
    definitions.set(term, definition);
  }
  return definitions;
}

function buildLookup(definitions: Map<string, string>): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const [term, definition] of definitions.entries()) {
    lookup.set(term.toLowerCase(), definition);
    // Support simple plural usage of the same term (e.g. "teams", "referees").
    if (!/s$/i.test(term)) {
      lookup.set(`${term.toLowerCase()}s`, definition);
    }
  }
  return lookup;
}

function buildMatcher(lookup: Map<string, string>): RegExp {
  const keys = Array.from(lookup.keys()).sort((a, b) => b.length - a.length);
  const pattern = keys.map(escapeRegExp).join('|');
  return new RegExp(`\\b(${pattern})\\b`, 'gi');
}

function isDefinitionsPage(filePath: string | undefined): boolean {
  if (!filePath) return false;
  return filePath.replace(/\\/g, '/').endsWith('docs/02-definitions.md');
}

const glossaryTermsPlugin: Plugin = function glossaryTermsPlugin() {
  const definitions = loadDefinitions();
  const lookup = buildLookup(definitions);
  const matcher = buildMatcher(lookup);

  return (tree, file) => {
    const filePath = (file as {path?: string; history?: string[]}).path
      ?? (file as {history?: string[]}).history?.[0];
    if (isDefinitionsPage(filePath)) {
      return;
    }

    visit(tree, 'text', (node: {value: string}, index, parent: Parent | undefined) => {
      if (!parent || index === null || index === undefined) return;
      if (SKIP_PARENT_TYPES.has(parent.type)) return;

      const value = node.value;
      matcher.lastIndex = 0;
      if (!matcher.test(value)) return;
      matcher.lastIndex = 0;

      const newNodes: Array<Record<string, unknown>> = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = matcher.exec(value)) !== null) {
        const matchedText = match[0];
        const start = match.index;
        if (start > lastIndex) {
          newNodes.push({type: 'text', value: value.slice(lastIndex, start)});
        }
        const definition = lookup.get(matchedText.toLowerCase()) ?? '';
        newNodes.push({
          type: 'mdxJsxTextElement',
          name: 'span',
          attributes: [
            {type: 'mdxJsxAttribute', name: 'className', value: 'def-term'},
            {type: 'mdxJsxAttribute', name: 'data-tooltip', value: definition},
          ],
          children: [{type: 'text', value: matchedText}],
        });
        lastIndex = start + matchedText.length;
      }
      if (lastIndex < value.length) {
        newNodes.push({type: 'text', value: value.slice(lastIndex)});
      }

      (parent.children as unknown[]).splice(index, 1, ...newNodes);
      return index + newNodes.length;
    });
  };
};

export default glossaryTermsPlugin;
