import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// The source repo was renamed to flisk; stale link text sends readers to a 404.
const STALE = 'flisk-cli-core';
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);
const hits = [];
for (const file of files) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  text.split(/\r?\n/).forEach((line, index) => {
    if (line.includes(STALE)) hits.push(`${file}:${index + 1} mentions ${STALE}`);
  });
}
if (hits.length) {
  console.error(hits.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`no tracked file mentions ${STALE}`);
}
