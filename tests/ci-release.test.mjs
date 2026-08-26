import assert from 'node:assert/strict';
import test from 'node:test';

import { deriveRelease } from '../scripts/ci-release.mjs';

const sha = 'a'.repeat(40);
const releaseFiles = [
  '.nx/version-plans/cardinal-camera-settle.md',
  'CHANGELOG.md',
  'package-lock.json',
  'package.json',
];
const release = {
  event: 'push',
  ref: 'refs/heads/main',
  sha,
  packageVersion: '2.2.2',
  subject: 'chore(release): three-viewport-gizmo v2.2.2 (#3)',
  changedFiles: releaseFiles,
  changelog: '# Changelog\n\n## 2.2.2 (2026-08-26)\n',
};

test('ordinary pull requests can test a prerelease baseline without publishing', () => {
  assert.deepEqual(
    deriveRelease({
      event: 'pull_request',
      ref: 'refs/pull/2/merge',
      sha,
      packageVersion: '2.2.2-beta.0',
      subject: 'Automate npm releases',
    }),
    { kind: 'pull-request', npmPublish: false, version: '2.2.2-beta.0' },
  );
});

test('manual runs never publish, even for a release-looking commit', () => {
  assert.deepEqual(
    deriveRelease({ ...release, event: 'workflow_dispatch', ref: 'refs/heads/topic' }),
    { kind: 'dispatch', npmPublish: false, version: '2.2.2' },
  );
});

test('a release pull request validates but does not publish', () => {
  assert.deepEqual(deriveRelease({ ...release, event: 'pull_request' }), {
    kind: 'release-pull-request',
    npmPublish: false,
    version: '2.2.2',
  });
});

test('only an exact release commit pushed to main publishes', () => {
  assert.deepEqual(deriveRelease(release), {
    kind: 'release',
    npmPublish: true,
    releaseTag: 'v2.2.2',
    version: '2.2.2',
  });
});

test('rejects release commits with missing or unexpected files', () => {
  assert.throws(
    () => deriveRelease({ ...release, changedFiles: releaseFiles.filter((file) => file !== 'package-lock.json') }),
    /must change package-lock.json/u,
  );
  assert.throws(
    () => deriveRelease({ ...release, changedFiles: [...releaseFiles, 'lib/ViewportGizmo.ts'] }),
    /unexpected files/u,
  );
});

test('rejects malformed release-looking main commits', () => {
  assert.throws(
    () => deriveRelease({ ...release, subject: 'chore(release): three-viewport-gizmo vnext' }),
    /invalid SemVer/u,
  );
});
