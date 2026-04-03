const fs = require('fs');
const file = 'app/daftar/page.tsx';
const content = fs.readFileSync(file, 'utf8');

// Cari semua karakter non-ASCII untuk debug
let found = [];
for (let i = 0; i < content.length; i++) {
  const code = content.charCodeAt(i);
  if (code > 127) {
    found.push({ index: i, char: content[i], code: code.toString(16), context: content.slice(Math.max(0,i-2), i+3) });
    if (found.length > 20) break;
  }
}
console.log(JSON.stringify(found, null, 2));
