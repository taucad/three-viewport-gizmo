import assert from 'node:assert/strict';
import test from 'node:test';

import { blocking } from '../scripts/audit.mjs';

const report = (...advisories) => ({
  vulnerabilities: { pkg: { via: ['other-pkg', ...advisories] } },
});
const advisory = (id, severity) => ({ url: `https://github.com/advisories/${id}`, severity, name: 'pkg', title: 't' });

test('an allowlisted advisory does not block', () => {
  assert.deepEqual(blocking(report(advisory('GHSA-fc5q-39xc-vjpf', 'high'))), []);
});

test('any other high or critical advisory blocks; moderate does not', () => {
  const found = blocking(report(advisory('GHSA-aaaa', 'high'), advisory('GHSA-bbbb', 'critical'), advisory('GHSA-cccc', 'moderate')));
  assert.equal(found.length, 2);
});
