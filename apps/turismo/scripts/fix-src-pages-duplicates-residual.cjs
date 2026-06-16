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

// src/pages/upgrades.tsx — espelha pages/upgrades.tsx (#392)
{
  let c = read('src/pages/upgrades.tsx');
  c = c.replace(
    /  const \[showModal, setShowModal\] = useState\(false\);\r?\n  const \[showCreateModal, setShowCreateModal\] = useState\(false\);\r?\n/,
    '  const [showModal, setShowModal] = useState(false);\r\n'
  );
  c = c.replace(/setShowCreateModal/g, 'setShowModal');
  c = c.replace(
    /\r?\n  const handleStatusChange = \(upgradeId: string, newStatus: Upgrade\['status'\]\) => \{\r?\n    setUpgrades\(prev => prev\.map\(u => \r?\n      u\.id === upgradeId \? \{ \.\.\.u, status: newStatus \} : u\r?\n    \)\);\r?\n  \};\r?\n/,
    '\r\n'
  );
  c = c.replace(
    '  const [upgrades, setUpgrades] = useState<Upgrade[]>([',
    '  const [upgrades] = useState<Upgrade[]>(['
  );
  write('src/pages/upgrades.tsx', c);
}

// src/pages/maps.tsx — espelha pages/maps.tsx (#392)
{
  let c = read('src/pages/maps.tsx');
  c = c.replace(
    '  const [locations, setLocations] = useState<Location[]>([',
    '  const [locations] = useState<Location[]>(['
  );
  c = c.replace(
    '  const [routes, setRoutes] = useState<Route[]>([',
    '  const [routes] = useState<Route[]>(['
  );
  c = c.replace(
    '  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);',
    '  const [, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);'
  );
  write('src/pages/maps.tsx', c);
}

// src/pages/workflows.tsx — espelha pages/workflows.tsx residual
{
  let c = read('src/pages/workflows.tsx');
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
    /\r?\n  const getPriorityColor = \(priority: string\) => \{\r?\n    switch \(priority\) \{\r?\n      case 'critical':\r?\n        return 'bg-red-500';\r?\n      case 'high':\r?\n        return 'bg-orange-500';\r?\n      case 'medium':\r?\n        return 'bg-yellow-500';\r?\n      case 'low':\r?\n        return 'bg-green-500';\r?\n      default:\r?\n        return 'bg-gray-500';\r?\n    \}\r?\n  \};\r?\n/,
    '\r\n'
  );
  write('src/pages/workflows.tsx', c);
}
