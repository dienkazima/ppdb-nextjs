const fs = require('fs');
const file = 'c:\\Users\\ACER\\ppdb-app\\app\\daftar\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove thick red rings globally for errors
content = content.replace(/border-red-300 focus:ring-red-300 focus:border-red-400/g, "!border-red-500 focus:!ring-0 !ring-0");
content = content.replace(/border-red-500 focus:ring-red-500 focus:border-red-500/g, "!border-red-500 focus:!ring-0 !ring-0");

// 2. Fix jenjang pendidikan select (restore error styling logic)
content = content.replace(
  /<select\s*name="jenjang"[\s\S]*?className=\{selectStyle\}\s*>/,
  `<select
  name="jenjang"
  value={form.jenjang}
  onChange={handleChange}
  className={\`\${selectStyle} \${errors.jenjang ? "!border-red-500 focus:!ring-0 !ring-0" : ""}\`}
>`
);

// 3. Fix jenis kelamin select
content = content.replace(
  /<select\s*name="jenisKelamin"[\s\S]*?className=\{selectStyle\}\s*>/,
  `<select
  name="jenisKelamin"
  value={form.jenisKelamin}
  onChange={handleChange}
  className={\`\${selectStyle} \${errors.jenisKelamin ? "!border-red-500 focus:!ring-0 !ring-0" : ""}\`}
>`
);

fs.writeFileSync(file, content);
console.log('Error borders fixed');
