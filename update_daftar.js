const fs = require('fs');
const file = 'c:\\Users\\ACER\\ppdb-app\\app\\daftar\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace inputStyle definition
content = content.replace(
  /const inputStyle =[\s\S]*?transition";/,
  `const inputStyle = "w-full h-11 px-4 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 shadow-sm";
  const selectStyle = \`\${inputStyle} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-12px)_center] bg-no-repeat pr-10\`;`
);

// 2. Replace Kabupaten input with select
content = content.replace(
  /<input\s+name="kabupaten"[\s\S]*?\/>/,
  `<select
        name="kabupaten"
        value={form.kabupaten || ""}
        onChange={handleChange}
        className={selectStyle}
      >
        <option value="" disabled hidden>
          Pilih Kabupaten/Kota
        </option>
        <option value="Kabupaten Lombok Barat">Kabupaten Lombok Barat</option>
        <option value="Kabupaten Lombok Tengah">Kabupaten Lombok Tengah</option>
        <option value="Kabupaten Lombok Timur">Kabupaten Lombok Timur</option>
        <option value="Kabupaten Sumbawa">Kabupaten Sumbawa</option>
        <option value="Kabupaten Dompu">Kabupaten Dompu</option>
        <option value="Kabupaten Bima">Kabupaten Bima</option>
        <option value="Kabupaten Sumbawa Barat">Kabupaten Sumbawa Barat</option>
        <option value="Kabupaten Lombok Utara">Kabupaten Lombok Utara</option>
        <option value="Kota Mataram">Kota Mataram</option>
        <option value="Kota Bima">Kota Bima</option>
      </select>`
);

// 3. Update all existing selects to use selectStyle
content = content.replace(/<select([^>]*?)className=\{`\$\{inputStyle\}[^`]*`\}/g, '<select$1className={selectStyle}');
content = content.replace(/<select([^>]*?)className=\{inputStyle\}/g, '<select$1className={selectStyle}');
content = content.replace(/<select([^>]*?)className="[^"]*"/g, '<select$1className={selectStyle}');

fs.writeFileSync(file, content);
console.log('Update complete');
