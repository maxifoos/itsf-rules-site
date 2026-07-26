// Regenerates src/data/glossary.json and src/data/penalties.json from the
// "2. Definitions" and "18. Penalties" pages. Runs automatically before
// `start`/`build` (see package.json), so those pages stay the single
// source of truth for term/penalty auto-highlighting.
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs', 'standard-matchplay-rules');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// Terms excluded even though they technically appear as a "**Penalty: X**"
// heading: too generic/verb-like to safely auto-link every occurrence
// (e.g. "play will continue" is not a reference to the Continue penalty).
const EXCLUDED_PENALTY_TERMS = new Set(['continue']);

function writeJson(fileName, entries) {
  const outputFile = path.join(DATA_DIR, fileName);
  fs.mkdirSync(DATA_DIR, {recursive: true});
  fs.writeFileSync(outputFile, `${JSON.stringify(entries, null, 2)}\n`);
  console.log(`Generated ${entries.length} entries -> ${path.relative(process.cwd(), outputFile)}`);
}

function readNormalized(fileName) {
  // Tolerate CRLF line endings so this doesn't silently break on a checkout
  // or an edit that reintroduces them.
  return fs.readFileSync(path.join(DOCS_DIR, fileName), 'utf-8').replace(/\r\n/g, '\n');
}

function generateGlossary() {
  const content = readNormalized('02-definitions.md');
  const termLine = /\*\*([^*]+)\*\*:\s*(.+)/g;
  const entries = [];
  let match;
  while ((match = termLine.exec(content)) !== null) {
    entries.push({term: match[1].trim(), definition: match[2].trim()});
  }
  writeJson('glossary.json', entries);
}

function cleanDescription(raw) {
  return raw
    .trim()
    // Markdown links -> plain text: [Penalty Shot](./17-penalty-shot.md) -> Penalty Shot
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Bullet list items -> semicolon-separated sentence fragments.
    .split('\n')
    .map((line) => line.replace(/^-\s*/, '').trim())
    .filter(Boolean)
    .join('; ');
}

function generatePenalties() {
  const content = readNormalized('18-penalties.md');
  const block = /\*\*Penalty: ([^*]+)\*\*\n\n([\s\S]*?)(?=\n\*\*Penalty: |\n*$)/g;
  const entries = [];
  let match;
  while ((match = block.exec(content)) !== null) {
    const term = match[1].trim();
    if (EXCLUDED_PENALTY_TERMS.has(term.toLowerCase())) continue;
    entries.push({term, definition: cleanDescription(match[2])});
  }
  writeJson('penalties.json', entries);
}

generateGlossary();
generatePenalties();
