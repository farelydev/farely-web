import assert from 'node:assert/strict';
import { monthFromPrompt, parsePlannerPrompt, UMRAH_PATTERN } from '../src/utils/plannerLogic.js';

const now = new Date('2026-06-29T12:00:00Z');
assert.equal(monthFromPrompt('warm halal-friendly in August under £250', now), '2026-08');
assert.equal(parsePlannerPrompt('August 5 nights halal warm', 'ai', now).flexMonth, '2026-08');
assert.equal(UMRAH_PATTERN.test('Makkah 5 nights and Madinah 4 nights in November'), true);
const umrah = parsePlannerPrompt('Makkah 5 nights and Madinah 4 nights in November, non-stop preferred', 'ai', now);
assert.ok(umrah.tags.includes('umrah'));
assert.ok(umrah.tags.includes('direct'));
assert.equal(umrah.flexMonth, '2026-11');
console.log('AI regression checks passed');
