const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function write(rel, content) {
  fs.writeFileSync(path.join(root, rel), content, 'utf8');
  console.log(`fixed ${rel}`);
}

function fixMediaPage(file) {
  let c = read(file);
  c = c.replace(/  const \{ user \} = useAuth\(\);\r?\n  const router = useRouter\(\);\r?\n/, '');
  c = c.replace(/  const \[isLoading, setIsLoading\] = useState\(false\);\r?\n/, '');
  c = c.replace(
    'const handleCardClick = (cardId: string)',
    'const handleCardClick = (_cardId: string)'
  );
  c = c.replace(
    'const handleQuickAction = (action: string)',
    'const handleQuickAction = (_action: string)'
  );
  c = c.replace(
    /\r?\n  const formatDate = \(dateString: string\) => \{\r?\n    return new Date\(dateString\)\.toLocaleDateString\('pt-BR'\);\r?\n  \};\r?\n/,
    '\r\n'
  );
  write(file, c);
}

for (const file of ['pages/videos.tsx', 'src/pages/videos.tsx', 'pages/photos.tsx']) {
  fixMediaPage(file);
}

// src/pages/notifications.tsx
{
  let c = read('src/pages/notifications.tsx');
  c = c.replace(/  const \{ user \} = useAuth\(\);\r?\n  const router = useRouter\(\);\r?\n/, '');
  c = c.replace(/  const \[isLoading, setIsLoading\] = useState\(false\);\r?\n/, '');
  c = c.replace(
    'const handleCardClick = (cardId: string)',
    'const handleCardClick = (_cardId: string)'
  );
  c = c.replace(
    'const handleQuickAction = (action: string)',
    'const handleQuickAction = (_action: string)'
  );
  c = c.replace(/^  Archive,\r?\n/m, '');
  c = c.replace(
    /\r?\n  const getPriorityColor = \(priority: string\) => \{\r?\n    switch \(priority\) \{\r?\n      case 'urgent':\r?\n        return 'bg-red-500';\r?\n      case 'high':\r?\n        return 'bg-orange-500';\r?\n      case 'medium':\r?\n        return 'bg-yellow-500';\r?\n      case 'low':\r?\n        return 'bg-green-500';\r?\n      default:\r?\n        return 'bg-gray-500';\r?\n    \}\r?\n  \};\r?\n/,
    '\r\n'
  );
  write('src/pages/notifications.tsx', c);
}
