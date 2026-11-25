import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const OrderedChangelogRenderer = createRequire(import.meta.url)('../scripts/changelog-renderer.cjs');

const plan = (bump, order, text) => ({
  type: bump === 'patch' ? 'fix' : 'feat',
  isBreaking: bump === 'major',
  description: order === null ? text : `<!-- order: ${order} -->\n${text}`,
  scope: '',
  body: '',
  affectedProjects: '*',
  githubReferences: [],
});

const render = (changes, project) =>
  new OrderedChangelogRenderer({
    changes,
    changelogEntryVersion: '3.0.0',
    project,
    entryWhenNoChanges: false,
    isVersionPlans: true,
    changelogRenderOptions: { authors: false, commitReferences: false, versionTitleDate: false },
    dependencyBumps: [],
    conventionalCommitsConfig: { types: { feat: { changelog: { title: '🚀 Features' } }, fix: { changelog: { title: '🩹 Fixes' } } } },
    remoteReleaseClient: { getRemoteRepoData: () => null },
  }).render();

// Nx hands plans over newest file first; a checkout gives them any birth order.
const shuffled = [
  plan('patch', 20, 'Fix B'),
  plan('minor', null, 'Feature without a marker'),
  plan('major', 20, 'Breaking B'),
  plan('minor', 10, 'Feature A'),
  plan('patch', 10, 'Fix A'),
  plan('major', 10, 'Summary'),
];

for (const project of ['three-viewport-gizmo', null]) {
  test(`breaking changes lead, then features, then fixes, each by its order marker (${project ? 'project' : 'workspace'} changelog)`, async () => {
    const entry = await render(shuffled, project);
    assert.equal(
      entry,
      [
        '# 3.0.0',
        '',
        '### ⚠️  Breaking Changes',
        '',
        '- Summary',
        '- Breaking B',
        '',
        '### 🚀 Features',
        '',
        '- Feature A',
        '- Feature without a marker',
        '',
        '### 🩹 Fixes',
        '',
        '- Fix A',
        '- Fix B',
      ].join('\n'),
    );
    assert.equal(await render([...shuffled].reverse(), project), entry);
  });
}
