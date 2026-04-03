const fs = require('fs');
const file = 'app/daftar/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove UTF-8 BOM jika ada
if (content.startsWith('\uFEFF')) {
  content = content.slice(1);
}

function replaceAll(s, find, replace) {
  while (s.includes(find)) s = s.replace(find, replace);
  return s;
}

// Dari debug: karakter rusak = mojibake Windows-1252 yg di-encode ulang sebagai UTF-8

// --- â€" (em dash / step description separator) ---
// U+00E2 U+20AC U+201D = Windows-1252 byte E2 80 94 (em dash â€") → ← dan →
// "â€" hanya" → "— hanya" (em dash)
// Tapi kita juga butuh panahnya

// Symbols in upload area: âœ… = â(U+00E2) + œ(U+0153) + …(U+2026) = bytes E2 9C 85 (✅)
content = replaceAll(content, '\u00e2\u0153\u2026', '\u2705'); // ✅

// âœ• = â(U+00E2) + œ(U+0153) + •(U+2022) = E2 9C 95 (✕)
// Tapi hati-hati, • = U+2022 di windows-1252 = 0x95, dan 0x95 di windows-1252 bukan U+2022
// Mari cari polanya dari debug lebih spesifik

// Untuk emoji 4-byte (ðŸ'¤ dll):
// 🎓 = F0 9F 8E 93 → ð(U+00F0) + Ÿ(U+0178) + "quot;(U+201C) + "(U+201D)? 
// Dari debug: ðŸ"¥ = ð(U+00F0) + Ÿ(U+0178) + "(U+201D) + ¥(U+00A5)
// jadi F0=ð(U+00F0), 9F=Ÿ(U+0178), byte ke-3 dan ke-4 bervariasi

// 👤 = F0 9F 91 A4 → ð(U+00F0) + Ÿ(U+0178) + '(U+2018) + ¤(U+00A4)
content = replaceAll(content, '\u00f0\u0178\u2018\u00a4', '\uD83D\uDC64'); // 👤

// 👪 = F0 9F 91 AA → ð(U+00F0) + Ÿ(U+0178) + '(U+2018) + ª(U+00AA)
content = replaceAll(content, '\u00f0\u0178\u2018\u00aa', '\uD83D\uDC6A'); // 👪

// 📄 = F0 9F 93 84 → ð(U+00F0) + Ÿ(U+0178) + "(U+201D) + „(U+201E)
content = replaceAll(content, '\u00f0\u0178\u201d\u201e', '\uD83D\uDCC4'); // 📄

// 🎓 = F0 9F 8E 93 → ð(U+00F0) + Ÿ(U+0178) + Ž(U+017D) + †? 
// Dari screenshot: ðŸŽ" = ð + Ÿ + Ž + " 
// ðŸŽ" → double check 9F=Ÿ(U+0178), 8E=Ž(U+017D), 93=†(U+2014)?? 
// 0x93 di windows-1252 = U+201C (left double quote)
content = replaceAll(content, '\u00f0\u0178\u017d\u201c', '\uD83C\uDF93'); // 🎓

// ✅ = E2 9C 85 → â + ... lebih tepat:
// E2=â(U+00E2), 9C=œ(U+0153)... tapi 0x85 di win-1252 = U+2026 (…)
// Sudah ditangani di atas

// ⚠ = E2 9A A0 → â(U+00E2) + š(?)(0x9A) + (0xA0)
// 0x9A di win-1252 = U+0161 (š), 0xA0 = NBSP (U+00A0)
content = replaceAll(content, '\u00e2\u0161\u00a0', '\u26A0');  // ⚠ (warning)

// ✕ = E2 9C 95 → â(U+00E2) + œ(U+0153) + •(0x95 = U+2022)
content = replaceAll(content, '\u00e2\u0153\u2022', '\u2715'); // ✕

// ← arrow = E2 86 90 → â(U+00E2) + †(U+2020) + (0x90 = U+0090 control char)
// 0x90 di win-1252 = U+0090 (control)... tricky
content = replaceAll(content, '\u00e2\u2020\u0090', '\u2190'); // ← 

// → arrow = E2 86 92 → â(U+00E2) + †(U+2020) + '(0x92 = U+2019)
content = replaceAll(content, '\u00e2\u2020\u2019', '\u2192'); // →

// — em dash = E2 80 94 → â(U+00E2) + €(U+20AC) + "(0x94=U+201D)
content = replaceAll(content, '\u00e2\u20ac\u201d', '\u2014'); // —

fs.writeFileSync(file, '\uFEFF' + content, 'utf8');
console.log('Fix selesai!');
