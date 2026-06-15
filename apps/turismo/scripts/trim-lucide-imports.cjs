const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node trim-lucide-imports.cjs <file.tsx>');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const importRegex =
  /import\s*\{([\s\S]*?)\}\s*from\s*['"]lucide-react['"];?/;
const match = content.match(importRegex);

if (!match) {
  console.log(`${filePath}: no lucide-react import`);
  process.exit(0);
}

const bodyStart = content.indexOf(match[0]) + match[0].length;
const body = content.slice(bodyStart);

function isUsed(localName) {
  const patterns = [
    `<${localName} `,
    `<${localName}/`,
    `<${localName}>`,
    `<${localName}\n`,
    ` icon: ${localName}`,
    ` icon:${localName}`,
    `(${localName})`,
    `(${localName},`,
    ` ${localName},`,
    ` ${localName})`,
    `[${localName}]`,
    `=${localName}`,
    `: ${localName}`,
    `: ${localName},`,
    `return ${localName}`,
    `|| ${localName}`,
    `&& ${localName}`,
    `? ${localName}`,
  ];

  return patterns.some((p) => body.includes(p));
}

const importItems = match[1]
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const kept = importItems.filter((item) => {
  const alias = item.match(/^(\w+)\s+as\s+(\w+)$/);
  const localName = alias ? alias[2] : item.split(/\s+/)[0];
  return isUsed(localName);
});

const newImport = `import {\n  ${kept.join(',\n  ')}\n} from 'lucide-react';`;
const updated = content.replace(importRegex, newImport);
fs.writeFileSync(filePath, updated, 'utf8');
console.log(
  `${filePath}: ${importItems.length} -> ${kept.length} (-${importItems.length - kept.length})`
);
