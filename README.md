# keyboard-fix

Press one key and the text you just typed with the wrong keyboard layout is converted to the right one.
`sghl` becomes `سلام`; `صاشف` becomes `what`. Works system-wide on macOS (Hammerspoon) and Windows (AutoHotkey v2).

- Direction is detected from the text: mostly Latin letters → convert to Persian, mostly Persian → convert to Latin.
- Converts the selected text, or, with nothing selected, the current line up to the cursor.
- Restores the clipboard afterwards. On macOS it also switches the keyboard to the language of the result.
- Supports the standard Persian layout (ISIRI 9147, "Persian" on macOS, "Persian (Standard)" on Windows) and the
  old Windows "Persian" layout (`پ` on backslash, `ئ` on M).

## macOS

1. Install [Hammerspoon](https://www.hammerspoon.org) and allow it under System Settings → Privacy & Security → Accessibility.
2. Copy `mac/init.lua` to `~/.hammerspoon/init.lua` (not into the `Spoons` folder).
3. Hammerspoon menu → Reload Config.
4. Press **Fn+F8** (or plain **F8** after turning on "Use F1, F2, etc. keys as standard function keys" in
   System Settings → Keyboard → Keyboard Shortcuts… → Function Keys).

Settings are at the top of the file: the hotkey, an optional modifier-only trigger such as Fn+Shift, the layout,
and the names of your two input sources. Electron apps (Claude, VS Code, Slack) ignore the Cmd+C a script sends, so
the script reads the selection through Accessibility there and types the result; where that is unavailable the
key does nothing in that app.

## Windows

1. Install [AutoHotkey v2](https://www.autohotkey.com).
2. Double-click `windows/fix-keyboard.ahk`. Put a shortcut to it in `shell:startup` to run it at login.
3. Press **F8**.

Settings are at the top of the file: `FixKey` and `Layout` (`standard` or `windows`).

## Development

The key map lives once, in `src/map.mjs`; `src/gen.mjs` generates both scripts from it.

```bash
npm install          # fengari, a Lua VM used by the tests
npm run build        # regenerates mac/init.lua and windows/fix-keyboard.ahk
npm test             # checks the map, parses the generated AutoHotkey tables, and runs the generated Lua in a VM with simulated key events
```

Edit `src/map.mjs`, not the generated files.

---

# اصلاح متن تایپ‌شده با کیبورد اشتباه

یک کلید بزنید تا متنی که با کیبورد اشتباه نوشته‌اید به زبان درست برگردد: `sghl` می‌شود `سلام` و `صاشف` می‌شود `what`.
جهت تبدیل را خود اسکریپت از روی حروف تشخیص می‌دهد. متن انتخاب‌شده، یا اگر چیزی انتخاب نباشد خط جاری تا مکان‌نما، تبدیل می‌شود.
کلیپ‌بورد بعد از کار به حالت قبل برمی‌گردد و در مک، کیبورد هم به زبان نتیجه می‌رود.

**مک:** Hammerspoon را نصب کنید، در Privacy & Security → Accessibility به آن اجازه بدهید، فایل `mac/init.lua` را در
`~/.hammerspoon/init.lua` بگذارید و Reload Config بزنید. کلید: **Fn+F8** (یا F8 تنها، اگر در تنظیمات کیبورد
«Use F1, F2… as standard function keys» را روشن کنید).

**ویندوز:** AutoHotkey نسخهٔ ۲ را نصب کنید و روی `windows/fix-keyboard.ahk` دوبار کلیک کنید. کلید: **F8**.

**چیدمان:** پیش‌فرض چیدمان استاندارد است. اگر از چیدمان قدیمی ویندوز استفاده می‌کنید که `پ` روی `\` است، در بالای
فایل `Layout` را به `windows` تغییر دهید.

**محدودیت:** در برنامه‌های Electron مثل خود Claude، کپی ارسالی از اسکریپت پذیرفته نمی‌شود؛ اسکریپت متن را از
Accessibility می‌خواند و اگر آن هم نشد، در آن برنامه کاری نمی‌کند. متن مخلوط دو زبان یک‌جا به یک جهت تبدیل می‌شود.
