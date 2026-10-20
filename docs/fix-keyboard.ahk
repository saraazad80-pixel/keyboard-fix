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

MapStandard := Map()
MapStandard["0"] := "۰", MapStandard["1"] := "۱", MapStandard["2"] := "۲", MapStandard["3"] := "۳"
MapStandard["4"] := "۴", MapStandard["5"] := "۵", MapStandard["6"] := "۶", MapStandard["7"] := "۷"
MapStandard["8"] := "۸", MapStandard["9"] := "۹", MapStandard["-"] := "-", MapStandard["="] := "="
MapStandard["q"] := "ض", MapStandard["w"] := "ص", MapStandard["e"] := "ث", MapStandard["r"] := "ق"
MapStandard["t"] := "ف", MapStandard["y"] := "غ", MapStandard["u"] := "ع", MapStandard["i"] := "ه"
MapStandard["o"] := "خ", MapStandard["p"] := "ح", MapStandard["["] := "ج", MapStandard["]"] := "چ"
MapStandard["\"] := "\", MapStandard["a"] := "ش", MapStandard["s"] := "س", MapStandard["d"] := "ی"
MapStandard["f"] := "ب", MapStandard["g"] := "ل", MapStandard["h"] := "ا", MapStandard["j"] := "ت"
MapStandard["k"] := "ن", MapStandard["l"] := "م", MapStandard[";"] := "ک", MapStandard["'"] := "گ"
MapStandard["z"] := "ظ", MapStandard["x"] := "ط", MapStandard["c"] := "ز", MapStandard["v"] := "ر"
MapStandard["b"] := "ذ", MapStandard["n"] := "د", MapStandard["m"] := "پ", MapStandard[","] := "و"
MapStandard["."] := ".", MapStandard["/"] := "/", MapStandard["!"] := "!", MapStandard["@"] := "٬"
MapStandard["#"] := "٫", MapStandard["$"] := "﷼", MapStandard["%"] := "٪", MapStandard["^"] := "×"
MapStandard["&"] := "،", MapStandard["*"] := "*", MapStandard["("] := ")", MapStandard[")"] := "("
MapStandard["_"] := "ـ", MapStandard["+"] := "+", MapStandard["Q"] := "ْ", MapStandard["W"] := "ٌ"
MapStandard["E"] := "ٍ", MapStandard["R"] := "ً", MapStandard["T"] := "ُ", MapStandard["Y"] := "ِ"
MapStandard["U"] := "َ", MapStandard["I"] := "ّ", MapStandard["O"] := "]", MapStandard["P"] := "["
MapStandard["{"] := "}", MapStandard["}"] := "{", MapStandard["|"] := "|", MapStandard["A"] := "ؤ"
MapStandard["S"] := "ئ", MapStandard["D"] := "ي", MapStandard["F"] := "إ", MapStandard["G"] := "أ"
MapStandard["H"] := "آ", MapStandard["J"] := "ة", MapStandard["K"] := "»", MapStandard["L"] := "«"
MapStandard[":"] := ":", MapStandard["`""] := "؛", MapStandard["Z"] := "ك", MapStandard["X"] := "ٓ"
MapStandard["C"] := "ژ", MapStandard["V"] := "ٰ", MapStandard["B"] := Chr(0x200C), MapStandard["N"] := "ٔ"
MapStandard["M"] := "ء", MapStandard["<"] := ">", MapStandard[">"] := "<", MapStandard["?"] := "؟"

MapWindows := Map()
MapWindows["0"] := "۰", MapWindows["1"] := "۱", MapWindows["2"] := "۲", MapWindows["3"] := "۳"
MapWindows["4"] := "۴", MapWindows["5"] := "۵", MapWindows["6"] := "۶", MapWindows["7"] := "۷"
MapWindows["8"] := "۸", MapWindows["9"] := "۹", MapWindows["-"] := "-", MapWindows["="] := "="
MapWindows["q"] := "ض", MapWindows["w"] := "ص", MapWindows["e"] := "ث", MapWindows["r"] := "ق"
MapWindows["t"] := "ف", MapWindows["y"] := "غ", MapWindows["u"] := "ع", MapWindows["i"] := "ه"
MapWindows["o"] := "خ", MapWindows["p"] := "ح", MapWindows["["] := "ج", MapWindows["]"] := "چ"
MapWindows["\"] := "پ", MapWindows["a"] := "ش", MapWindows["s"] := "س", MapWindows["d"] := "ی"
MapWindows["f"] := "ب", MapWindows["g"] := "ل", MapWindows["h"] := "ا", MapWindows["j"] := "ت"
MapWindows["k"] := "ن", MapWindows["l"] := "م", MapWindows[";"] := "ک", MapWindows["'"] := "گ"
MapWindows["z"] := "ظ", MapWindows["x"] := "ط", MapWindows["c"] := "ز", MapWindows["v"] := "ر"
MapWindows["b"] := "ذ", MapWindows["n"] := "د", MapWindows["m"] := "ئ", MapWindows[","] := "و"
MapWindows["."] := ".", MapWindows["/"] := "/", MapWindows["!"] := "!", MapWindows["@"] := "@"
MapWindows["#"] := "#", MapWindows["$"] := "$", MapWindows["%"] := "٪", MapWindows["^"] := "^"
MapWindows["&"] := "&", MapWindows["*"] := "*", MapWindows["("] := ")", MapWindows[")"] := "("
MapWindows["_"] := "_", MapWindows["+"] := "+", MapWindows["Q"] := "ً", MapWindows["W"] := "ٌ"
MapWindows["E"] := "ٍ", MapWindows["R"] := "﷼", MapWindows["T"] := "،", MapWindows["Y"] := "؛"
MapWindows["U"] := ",", MapWindows["I"] := "]", MapWindows["O"] := "[", MapWindows["P"] := "\"
MapWindows["{"] := "}", MapWindows["}"] := "{", MapWindows["|"] := "|", MapWindows["A"] := "َ"
MapWindows["S"] := "ُ", MapWindows["D"] := "ِ", MapWindows["F"] := "ّ", MapWindows["G"] := "ۀ"
MapWindows["H"] := "آ", MapWindows["J"] := "ـ", MapWindows["K"] := "«", MapWindows["L"] := "»"
MapWindows[":"] := ":", MapWindows["`""] := "`"", MapWindows["Z"] := "ك", MapWindows["X"] := "ي"
MapWindows["C"] := "ژ", MapWindows["V"] := "ؤ", MapWindows["B"] := "إ", MapWindows["N"] := "أ"
MapWindows["M"] := "ء", MapWindows["<"] := ">", MapWindows[">"] := "<", MapWindows["?"] := "؟"

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
