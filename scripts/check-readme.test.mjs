import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';

const stale = ['flisk', 'cli', 'core'].join('-');

const scaffold = (t) => {
  const root = mkdtempSync(join(tmpdir(), 'flisk-readme-check-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const scripts = join(root, 'scripts');
  mkdirSync(scripts);
  copyFileSync(new URL('./check-readme.mjs', import.meta.url), join(scripts, 'check-readme.mjs'));
  execFileSync('git', ['init', '--quiet'], { cwd: root });
  return { root, scripts };
};

test('checks tracked files from the repository root when invoked from a subdirectory', (t) => {
  const { root, scripts } = scaffold(t);
  writeFileSync(join(root, 'README.md'), `https://github.com/flisk-sh/${stale}\n`);
  execFileSync('git', ['add', 'README.md', 'scripts/check-readme.mjs'], { cwd: root });

  const result = spawnSync(process.execPath, ['check-readme.mjs'], { cwd: scripts, encoding: 'utf8' });
  assert.ifError(result.error);
  assert.equal(result.status, 1, result.stdout || result.stderr);
  assert.match(result.stderr, new RegExp(`^README\\.md:1 mentions ${stale}$`, 'm'));
});

test('ignores tracked binary files that happen to contain the stale bytes', (t) => {
  const { root, scripts } = scaffold(t);
  writeFileSync(
    join(root, 'blob.bin'),
    Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00]), Buffer.from(stale)]),
  );
  execFileSync('git', ['add', 'blob.bin', 'scripts/check-readme.mjs'], { cwd: root });

  const result = spawnSync(process.execPath, ['check-readme.mjs'], { cwd: scripts, encoding: 'utf8' });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, new RegExp(`^no tracked file mentions ${stale}$`, 'm'));
});

test('skips a PATH entry that is a directory named git', (t) => {
  const { root, scripts } = scaffold(t);
  const fakeBin = join(root, 'fake-bin');
  mkdirSync(join(fakeBin, 'git'), { recursive: true });
  execFileSync('git', ['add', 'scripts/check-readme.mjs'], { cwd: root });

  const gitDir = dirname(execFileSync('sh', ['-c', 'command -v git'], { encoding: 'utf8' }).trim());
  const result = spawnSync(process.execPath, ['check-readme.mjs'], {
    cwd: scripts,
    encoding: 'utf8',
    env: { ...process.env, PATH: `${fakeBin}${delimiter}${gitDir}` },
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, new RegExp(`^no tracked file mentions ${stale}$`, 'm'));
});
