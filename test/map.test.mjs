// Checks the key map and the conversion rule.  Run: node test/map.test.mjs
import assert from 'node:assert/strict';
import { standard, windows, invert, convert } from '../src/map.mjs';

const cases = [
  ['sghl', 'سلام'],
  ['sghl ]x,vd?', 'سلام چطوری؟'],
  ['صاشف', 'what'],
  ['lk ;dj hsj', 'من کیت است'],
  ['این یک متن فارسی است', 'hdk d; ljk thvsd hsj'],
  ['hdk d; ljk thvsd hsj', 'این یک متن فارسی است'],
  ['123', '۱۲۳'],
  ['', ''],
];
for (const [input, want] of cases) assert.equal(convert(input, standard), want, input);

// every key round-trips on both layouts
for (const [name, m] of [['standard', standard], ['windows', windows]]) {
  const inv = invert(m);
  for (const k of Object.keys(m)) {
    if (m[k] === k) continue;
    assert.equal(inv[m[k]], k, `${name}: ${k} -> ${m[k]} -> ${inv[m[k]]}`);
    // a key whose Persian-layout output is ASCII (Shift+O gives "]") cannot be told apart on its own,
    // so the convert() round trip is checked only where the output is a Persian character
    if (m[k].charCodeAt(0) > 127) assert.equal(convert(convert(k, m), m), k, `${name}: round trip of ${k}`);
  }
}
assert.equal(convert('\\', windows), 'پ');
assert.equal(convert('پ', windows), '\\');
console.log('map: ok');
