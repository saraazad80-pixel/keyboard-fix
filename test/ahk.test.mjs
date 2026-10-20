// Parses the generated AutoHotkey script and checks its tables against the source map.
// (AutoHotkey itself only runs on Windows; this guards the generated file, not the interpreter.)
// Run: node test/ahk.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { standard, windows } from '../src/map.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const text = fs.readFileSync(path.join(root, 'windows', 'fix-keyboard.ahk'), 'utf8');

assert.ok(text.startsWith('﻿'), 'UTF-8 BOM so Notepad and AutoHotkey agree on the encoding');
assert.match(text, /^#Requires AutoHotkey v2\.0$/m);
assert.match(text, /^Hotkey FixKey, FixText$/m);

// "..." with `" and `` escapes, or Chr(0x....)
const unescape = s => s.startsWith('Chr(') ? String.fromCodePoint(parseInt(s.slice(4, -1), 16)) : s.slice(1, -1).replace(/`"/g, '"').replace(/``/g, '`');
const STR = String.raw`(?:"(?:[^"\x60]|\x60.)*"|Chr\(0x[0-9A-F]+\))`;
const entry = new RegExp(String.raw`^(Map\w+)\[(${STR})\] := (${STR})$`);
const tables = {};
for (const line of text.split(/\r?\n/)) {
  for (const stmt of line.split(/, (?=Map\w+\[)/)) {
    const m = stmt.match(entry);
    if (!m) continue;
    (tables[m[1]] ??= {})[unescape(m[2])] = unescape(m[3]);
  }
}
assert.deepEqual(tables.MapStandard, standard, 'MapStandard matches src/map.mjs');
assert.deepEqual(tables.MapWindows, windows, 'MapWindows matches src/map.mjs');

// every line that is not a comment or string-only must have balanced brackets; the file must not rely on line continuation
let depth = 0;
for (const line of text.split(/\r?\n/)) {
  const code = line.replace(new RegExp(STR, 'g'), '""').replace(/;.*$/, '');
  for (const ch of code) { if (ch === '(' || ch === '{') depth++; if (ch === ')' || ch === '}') depth--; }
  assert.ok(!/\($/.test(code.trim()), `line ends with an open call: ${line}`);
}
assert.equal(depth, 0, 'brackets balance');
console.log('ahk: ok');
