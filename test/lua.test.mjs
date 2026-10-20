// Runs the generated Hammerspoon script in a Lua VM (fengari) with a fake `hs`, and simulates key events.
// Run: npm install && node test/lua.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lua, lauxlib, lualib, to_luastring, to_jsstring } from 'fengari';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let src = fs.readFileSync(path.join(root, 'mac', 'init.lua'), 'utf8');
src = src.replace('local HOTKEY_KEY    = "f8"', 'local HOTKEY_KEY    = "f8"').replace('local TRIGGER_MODS  = {}', 'local TRIGGER_MODS  = { "fn", "shift" }');

const stub = `
LOG = {}
hs = { hotkey = {}, pasteboard = {}, timer = {}, keycodes = {}, alert = {}, fnutils = {}, application = {} }
hotkeyFn = nil
hs.hotkey.bind = function(mods, key, fn) hotkeyFn = fn; LOG[#LOG+1] = "hotkey " .. key end
hs.fnutils.contains = function(t, v) for _, x in ipairs(t) do if x == v then return true end end return false end
hs.eventtap = { event = { types = { flagsChanged = 1, keyDown = 2 } } }
tapFn = nil
hs.eventtap.new = function(types, fn) tapFn = fn; return { start = function() end } end
hs.eventtap.keyStroke = function(mods, key) LOG[#LOG+1] = "key " .. table.concat(mods, "+") .. "+" .. key end
hs.eventtap.keyStrokes = function(s) LOG[#LOG+1] = "typed " .. s end
hs.timer.doAfter = function(d, f) f() end
hs.timer.usleep = function() end
clip = ""
hs.pasteboard.getContents = function() return clip end
hs.pasteboard.setContents = function(s) clip = s; LOG[#LOG+1] = "clip=" .. s end
hs.pasteboard.clearContents = function() end
hs.keycodes.layouts = function() return { "U.S.", "Persian – Standard" } end
hs.keycodes.setLayout = function(n) LOG[#LOG+1] = "layout=" .. n end
hs.keycodes.currentLayout = function() return "U.S." end
hs.alert.show = function(m) LOG[#LOG+1] = "alert " .. m end
hs.application.frontmostApplication = function() return { name = function() return "Test" end } end
hs.inspect = function(t) return "" end
axText = nil
hs.axuielement = { systemWideElement = function() return { attributeValue = function() return { attributeValue = function() return axText end } end } end }
`;
const scenario = `
local function ev(t, flags) return { getType = function() return t end, getFlags = function() return flags end } end
-- 1. hotkey, clipboard path: "sghl" selected, Cmd+C works
clip = "sghl"; hotkeyFn()
LOG[#LOG+1] = "--"
-- 2. modifier trigger: release one key at a time; must fire once, after the second release
tapFn(ev(1, { fn = true })); tapFn(ev(1, { fn = true, shift = true })); tapFn(ev(1, { fn = true }))
LOG[#LOG+1] = "--"
tapFn(ev(1, {}))
LOG[#LOG+1] = "--"
-- 3. trigger with another key in between: must not fire
tapFn(ev(1, { fn = true, shift = true })); tapFn(ev(2, {})); tapFn(ev(1, {}))
-- 4. trigger with Cmd held as well: must not fire
tapFn(ev(1, { fn = true, shift = true, cmd = true })); tapFn(ev(1, {}))
LOG[#LOG+1] = "--"
-- 5. accessibility path: Cmd+C gives nothing, AX gives Persian text -> typed back as Latin
clip = ""; axText = "صاشف"; hotkeyFn()
R = table.concat(LOG, "\\n")`;

const L = lauxlib.luaL_newstate(); lualib.luaL_openlibs(L);
if (lauxlib.luaL_dostring(L, to_luastring(stub + src + scenario)) !== 0)
  throw new Error('lua: ' + to_jsstring(lua.lua_tostring(L, -1)));
lua.lua_getglobal(L, to_luastring('R'));
const out = to_jsstring(lua.lua_tostring(L, -1)).split('\n');
assert.deepEqual(out, [
  'hotkey f8',
  'key cmd+8', 'clip=سلام', 'key cmd+9', 'clip=sghl', 'layout=Persian – Standard',
  '--',
  '--',
  'key cmd+8', 'clip=سلام', 'key cmd+9', 'clip=sghl', 'layout=Persian – Standard',
  '--',
  '--',
  'typed what', 'clip=', 'layout=U.S.',
]);
console.log('lua: ok');
