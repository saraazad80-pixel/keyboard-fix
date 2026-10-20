import { standard, windows } from './map.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---------- AutoHotkey v2 ----------
const ahkStr = s => {
  if (s === '‌') return 'Chr(0x200C)';
  return '"' + s.replace(/`/g, '``').replace(/"/g, '`"') + '"';
};
const ahkMap = (name, m) => {
  const keys = Object.keys(m); let lines = [`${name} := Map()`];
  for (let i = 0; i < keys.length; i += 4)
    lines.push(keys.slice(i, i + 4).map(k => `${name}[${ahkStr(k)}] := ${ahkStr(m[k])}`).join(', '));
  return lines.join('\n');
};
const ahk = `﻿; Fix Persian/English keyboard mistakes
; Select the wrong text (or leave the cursor at the end of the line) and press the key below.
; Latin typed on a Persian layout becomes Persian, and the other way round.
; Needs AutoHotkey v2: https://www.autohotkey.com  — double-click this file to run it;
; put a shortcut to it in shell:startup so it runs when Windows starts.
#Requires AutoHotkey v2.0
#SingleInstance Force

; ---------- settings ----------
FixKey := "F8"          ; the key that fixes the text (examples: "F8", "^!f" = Ctrl+Alt+F, "#f" = Win+F)
Layout := "standard"    ; "standard" = Persian (Standard) / ISIRI 9147;  "windows" = the old Windows "Persian" layout (پ on backslash, ئ on M)
; ------------------------------

${ahkMap('MapStandard', standard)}

${ahkMap('MapWindows', windows)}

ToFa := Layout = "windows" ? MapWindows : MapStandard
ToEn := Map()
for k, v in ToFa
  if (v != k && !ToEn.Has(v))
    ToEn[v] := k

Convert(text) {
  global ToFa, ToEn
  fa := 0, en := 0
  Loop Parse, text {
    c := Ord(A_LoopField)
    if ((c >= 0x600 && c <= 0x6FF) || (c >= 0xFB50 && c <= 0xFEFF) || c = 0x200C || c = 0xAB || c = 0xBB || c = 0xD7)
      fa++
    else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122))
      en++
  }
  table := fa > en ? ToEn : ToFa
  out := ""
  Loop Parse, text
    out .= table.Has(A_LoopField) ? table[A_LoopField] : A_LoopField
  return out
}

FixText(*) {
  saved := ClipboardAll()
  A_Clipboard := ""
  Send "^c"
  if !ClipWait(0.3) {
    Send "+{Home}"           ; nothing selected: take the line from its start to the cursor
    Sleep 50
    Send "^c"
    if !ClipWait(0.3) {
      A_Clipboard := saved
      return
    }
  }
  A_Clipboard := Convert(A_Clipboard)
  Send "^v"
  Sleep 300
  A_Clipboard := saved
}

Hotkey FixKey, FixText
`;
fs.writeFileSync(path.join(ROOT, 'windows', 'fix-keyboard.ahk'), ahk);

// ---------- Hammerspoon (Lua) ----------
const luaStr = s => {
  if (s === '‌') return '"\\u{200C}"';
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
};
const luaMap = (name, m) => {
  const keys = Object.keys(m); let lines = [];
  for (let i = 0; i < keys.length; i += 6)
    lines.push('  ' + keys.slice(i, i + 6).map(k => `[${luaStr(k)}] = ${luaStr(m[k])}`).join(', ') + ',');
  return `local ${name} = {\n${lines.join('\n')}\n}`;
};
const lua = `-- Fix Persian/English keyboard mistakes (Hammerspoon)
-- Select the wrong text (or leave the cursor at the end of the line) and press the hotkey.
-- Latin typed on a Persian layout becomes Persian, and the other way round.
-- Install Hammerspoon (https://www.hammerspoon.org), give it Accessibility access,
-- then copy this file to ~/.hammerspoon/init.lua and choose "Reload Config" from its menu.

-- ---------- settings ----------
local TRIGGER_MODS  = {}                  -- modifier-only trigger, e.g. { "fn", "shift" }: press together and release
local HOTKEY_MODS   = {}                  -- an ordinary hotkey as well; "" below turns it off
local HOTKEY_KEY    = "f8"                -- the key (on a MacBook press Fn+F8 unless "Use F1, F2… as standard function keys" is on)
local LAYOUT        = "standard"          -- "standard" = macOS "Persian" / ISIRI 9147; "windows" = the old Windows layout
local SWITCH_INPUT  = true                -- after fixing, switch the keyboard to the language of the result
local EN_INPUT      = "U.S."              -- name of your English input source (System Settings → Keyboard)
local FA_INPUT      = "Persian"           -- name of your Persian input source
-- ------------------------------

${luaMap('mapStandard', standard)}

${luaMap('mapWindows', windows)}

local toFa = (LAYOUT == "windows") and mapWindows or mapStandard
local toEn = {}
for k, v in pairs(toFa) do
  if v ~= k and toEn[v] == nil then toEn[v] = k end
end

local function convert(text)
  local fa, en = 0, 0
  for _, cp in utf8.codes(text) do
    if (cp >= 0x600 and cp <= 0x6FF) or (cp >= 0xFB50 and cp <= 0xFEFF) or cp == 0x200C or cp == 0xAB or cp == 0xBB or cp == 0xD7 then
      fa = fa + 1
    elseif (cp >= 65 and cp <= 90) or (cp >= 97 and cp <= 122) then
      en = en + 1
    end
  end
  local map = (fa > en) and toEn or toFa
  local out = {}
  for _, cp in utf8.codes(text) do
    local ch = utf8.char(cp)
    out[#out + 1] = map[ch] or ch
  end
  return table.concat(out)
end

local KEY_DELAY = 30000   -- microseconds between key events; Electron apps (Claude, VS Code, Slack) need this

local KEYCODE = { c = 8, v = 9, left = 123 }   -- physical keys, independent of the active keyboard layout
local DEBUG = false

local function log(...)
  if DEBUG then print("[fix-keyboard]", ...) end
end

local function press(mods, key)
  hs.eventtap.keyStroke(mods, KEYCODE[key] or key, KEY_DELAY)
end

local function copySelection()
  hs.pasteboard.clearContents()
  press({ "cmd" }, "c")
  hs.timer.usleep(250000)
  return hs.pasteboard.getContents()
end

local function isPersian(text)
  local fa, en = 0, 0
  for _, cp in utf8.codes(text) do
    if (cp >= 0x600 and cp <= 0x6FF) or (cp >= 0xFB50 and cp <= 0xFEFF) or cp == 0xAB or cp == 0xBB or cp == 0xD7 then fa = fa + 1
    elseif (cp >= 65 and cp <= 90) or (cp >= 97 and cp <= 122) then en = en + 1 end
  end
  return fa > en
end

local function switchInput(toPersian)
  if not SWITCH_INPUT then return end
  local want = toPersian and FA_INPUT or EN_INPUT
  for _, name in ipairs(hs.keycodes.layouts()) do
    if name == want or name:find(want, 1, true) then
      hs.keycodes.setLayout(name)
      return
    end
  end
end

-- selected text through Accessibility (works in Electron apps such as Claude, where Cmd+C sent by a script is ignored)
local function axSelectedText()
  local ok, sys = pcall(hs.axuielement.systemWideElement)
  if not ok or not sys then return nil end
  local el = sys:attributeValue("AXFocusedUIElement")
  if not el then return nil end
  local t = el:attributeValue("AXSelectedText")
  if type(t) == "string" and t ~= "" then return t end
  return nil
end

local function grab()
  local t = axSelectedText()
  if t then return t, "ax" end
  t = copySelection()
  if t and t ~= "" then return t, "clip" end
  return nil
end

local function fix()
  local app = hs.application.frontmostApplication()
  log("fix in", app and app:name() or "?", "| layout:", hs.keycodes.currentLayout())
  local saved = hs.pasteboard.getContents()
  local text, via = grab()
  log("selection:", text and #text or "nil", via)
  if not text then
    -- nothing selected: take the line from its start to the cursor
    press({ "cmd", "shift" }, "left")
    hs.timer.usleep(100000)
    text, via = grab()
    log("line:", text and #text or "nil", via)
  end
  if not text then
    if saved then hs.pasteboard.setContents(saved) end
    hs.alert.show("متنی برای تبدیل پیدا نشد")
    return
  end
  local out = convert(text)
  if via == "clip" then
    hs.pasteboard.setContents(out)
    hs.timer.usleep(100000)
    press({ "cmd" }, "v")
  else
    hs.eventtap.keyStrokes(out)   -- type the result over the selection
  end
  hs.timer.doAfter(0.5, function()
    if saved then hs.pasteboard.setContents(saved) end
    switchInput(isPersian(out))
  end)
end

-- Wait until every modifier key is released before sending keys. Fn is the usual culprit: with Fn+F8 the
-- Cmd+Shift+Left we send would arrive as Fn+Cmd+Shift+Left, and Fn+Left is Home on a Mac.
local function modifiersDown()
  local m = hs.eventtap.checkKeyboardModifiers()
  return m.cmd or m.alt or m.shift or m.ctrl or m.fn
end

local function run()
  local waited = 0
  while modifiersDown() and waited < 1500 do
    hs.timer.usleep(20000)
    waited = waited + 20
  end
  fix()
end

-- for testing from the console: testFix(3) runs the fix after 3 seconds, so you can switch apps and select text
function testFix(seconds)
  hs.timer.doAfter(seconds or 3, fix)
end
fixKeyboard = fix

-- ordinary hotkey
if HOTKEY_KEY ~= nil and HOTKEY_KEY ~= "" then
  hs.hotkey.bind(HOTKEY_MODS, HOTKEY_KEY, run)
end

-- modifier-only trigger: all of TRIGGER_MODS pressed together, then released, with no other key in between
if #TRIGGER_MODS > 0 then
  local armed = false
  local types = hs.eventtap.event.types
  local function allDown(flags)
    for _, m in ipairs(TRIGGER_MODS) do
      if not flags[m] then return false end
    end
    return true
  end
  local function onlyThese(flags)
    for _, m in ipairs({ "cmd", "alt", "ctrl", "shift", "fn" }) do
      if flags[m] and not hs.fnutils.contains(TRIGGER_MODS, m) then return false end
    end
    return true
  end
  fixKeyboardTap = hs.eventtap.new({ types.flagsChanged, types.keyDown }, function(e)
    if e:getType() == types.keyDown then
      armed = false
      return false
    end
    local flags = e:getFlags()
    log("flags:", hs.inspect(flags), "armed:", armed)
    if allDown(flags) then
      armed = onlyThese(flags)
    elseif armed then
      -- fire only once every trigger modifier is released, otherwise a held Shift or Fn would
      -- turn the Cmd+C we send into Cmd+Shift+C
      local anyDown = false
      for _, m in ipairs(TRIGGER_MODS) do
        if flags[m] then anyDown = true end
      end
      if not anyDown and not (flags.cmd or flags.alt or flags.ctrl) then
        armed = false
        hs.timer.doAfter(0.1, run)
      end
    end
    return false
  end)
  fixKeyboardTap:start()
end
`;
fs.writeFileSync(path.join(ROOT, 'mac', 'init.lua'), lua);
// ---------- web page (docs/, served by GitHub Pages) ----------
const mapJs = `// Generated from src/map.mjs by src/gen.mjs. Do not edit.
window.KEYBOARD_FIX = (function () {
  var standard = ${JSON.stringify(standard)};
  var windows = ${JSON.stringify(windows)};
  function invert(m) { var r = {}; for (var k in m) if (m[k] !== k && !(m[k] in r)) r[m[k]] = k; return r; }
  function convert(text, m) {
    var toEn = invert(m), fa = 0, en = 0, out = '', i, ch;
    for (i = 0; i < text.length; i++) {
      ch = text[i];
      if (/[\\u0600-\\u06FF\\uFB50-\\uFEFF\\u200C\\u00AB\\u00BB\\u00D7]/.test(ch)) fa++; else if (/[A-Za-z]/.test(ch)) en++;
    }
    var table = fa > en ? toEn : m;
    for (i = 0; i < text.length; i++) { ch = text[i]; out += (ch in table) ? table[ch] : ch; }
    return out;
  }
  return { standard: standard, windows: windows, convert: convert };
})();
`;
fs.writeFileSync(path.join(ROOT, 'docs', 'map.js'), mapJs);
fs.copyFileSync(path.join(ROOT, 'mac', 'init.lua'), path.join(ROOT, 'docs', 'init.lua'));
fs.copyFileSync(path.join(ROOT, 'windows', 'fix-keyboard.ahk'), path.join(ROOT, 'docs', 'fix-keyboard.ahk'));
console.log('wrote mac/init.lua, windows/fix-keyboard.ahk, docs/{map.js,init.lua,fix-keyboard.ahk}');
