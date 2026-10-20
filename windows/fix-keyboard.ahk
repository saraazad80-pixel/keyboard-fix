; Fix Persian/English keyboard mistakes
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

MapStandard := Map(
  "0", "۰", "1", "۱", "2", "۲", "3", "۳", "4", "۴", "5", "۵",
  "6", "۶", "7", "۷", "8", "۸", "9", "۹", "-", "-", "=", "=",
  "q", "ض", "w", "ص", "e", "ث", "r", "ق", "t", "ف", "y", "غ",
  "u", "ع", "i", "ه", "o", "خ", "p", "ح", "[", "ج", "]", "چ",
  "\", "\", "a", "ش", "s", "س", "d", "ی", "f", "ب", "g", "ل",
  "h", "ا", "j", "ت", "k", "ن", "l", "م", ";", "ک", "'", "گ",
  "z", "ظ", "x", "ط", "c", "ز", "v", "ر", "b", "ذ", "n", "د",
  "m", "پ", ",", "و", ".", ".", "/", "/", "!", "!", "@", "٬",
  "#", "٫", "$", "﷼", "%", "٪", "^", "×", "&", "،", "*", "*",
  "(", ")", ")", "(", "_", "ـ", "+", "+", "Q", "ْ", "W", "ٌ",
  "E", "ٍ", "R", "ً", "T", "ُ", "Y", "ِ", "U", "َ", "I", "ّ",
  "O", "]", "P", "[", "{", "}", "}", "{", "|", "|", "A", "ؤ",
  "S", "ئ", "D", "ي", "F", "إ", "G", "أ", "H", "آ", "J", "ة",
  "K", "»", "L", "«", ":", ":", "`"", "؛", "Z", "ك", "X", "ٓ",
  "C", "ژ", "V", "ٰ", "B", Chr(0x200C), "N", "ٔ", "M", "ء", "<", ">",
  ">", "<", "?", "؟"
)

MapWindows := Map(
  "0", "۰", "1", "۱", "2", "۲", "3", "۳", "4", "۴", "5", "۵",
  "6", "۶", "7", "۷", "8", "۸", "9", "۹", "-", "-", "=", "=",
  "q", "ض", "w", "ص", "e", "ث", "r", "ق", "t", "ف", "y", "غ",
  "u", "ع", "i", "ه", "o", "خ", "p", "ح", "[", "ج", "]", "چ",
  "\", "پ", "a", "ش", "s", "س", "d", "ی", "f", "ب", "g", "ل",
  "h", "ا", "j", "ت", "k", "ن", "l", "م", ";", "ک", "'", "گ",
  "z", "ظ", "x", "ط", "c", "ز", "v", "ر", "b", "ذ", "n", "د",
  "m", "ئ", ",", "و", ".", ".", "/", "/", "!", "!", "@", "@",
  "#", "#", "$", "$", "%", "٪", "^", "^", "&", "&", "*", "*",
  "(", ")", ")", "(", "_", "_", "+", "+", "Q", "ً", "W", "ٌ",
  "E", "ٍ", "R", "﷼", "T", "،", "Y", "؛", "U", ",", "I", "]",
  "O", "[", "P", "\", "{", "}", "}", "{", "|", "|", "A", "َ",
  "S", "ُ", "D", "ِ", "F", "ّ", "G", "ۀ", "H", "آ", "J", "ـ",
  "K", "«", "L", "»", ":", ":", "`"", "`"", "Z", "ك", "X", "ي",
  "C", "ژ", "V", "ؤ", "B", "إ", "N", "أ", "M", "ء", "<", ">",
  ">", "<", "?", "؟"
)

ToFa := Layout = "windows" ? MapWindows : MapStandard
ToEn := Map()
for k, v in ToFa
  if (v != k && !ToEn.Has(v))
    ToEn[v] := k

Convert(text) {
  global ToFa, ToEn
  fa := 0, en := 0
  loop parse text {
    c := Ord(A_LoopField)
    if ((c >= 0x600 && c <= 0x6FF) || (c >= 0xFB50 && c <= 0xFEFF) || c = 0x200C || c = 0xAB || c = 0xBB || c = 0xD7)
      fa++
    else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122))
      en++
  }
  table := fa > en ? ToEn : ToFa
  out := ""
  loop parse text
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
