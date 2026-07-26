// Regenerates src/data/glossary.json from docs/02-definitions.md.
// Runs automatically before `start`/`build` (see package.json), so the
// glossary page markdown stays the single source of truth.
const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, '..', 'docs', '02-definitions.md');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'glossary.json');
const TERM_LINE = /\*\*([^*]+)\*\*:\s*(.+)/g;

const content = fs.readFileSync(SOURCE_FILE, 'utf-8');
const entries = [];
let match;
while ((match = TERM_LINE.exec(content)) !== null) {
  entries.push({term: match[1].trim(), definition: match[2].trim()});
}

fs.mkdirSync(path.dirname(OUTPUT_FILE), {recursive: true});
fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(entries, null, 2)}\n`);

console.log(`Generated ${entries.length} glossary entries -> ${path.relative(process.cwd(), OUTPUT_FILE)}`);
