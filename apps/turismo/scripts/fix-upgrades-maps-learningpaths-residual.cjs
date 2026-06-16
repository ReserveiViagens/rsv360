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

// pages/upgrades.tsx — unify create modal with showModal; drop dead handler
{
  let c = read('pages/upgrades.tsx');
  c = c.replace(
    /  const \[showModal, setShowModal\] = useState\(false\);\r?\n  const \[showCreateModal, setShow(?:CreateModal|Modal)\] = useState\(false\);\r?\n/,
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
  write('pages/upgrades.tsx', c);
}

// pages/maps.tsx — read-only mock state; geolocation setter only
{
  let c = read('pages/maps.tsx');
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
  write('pages/maps.tsx', c);
}

// LearningPaths — trim unused UI/recharts imports and dead state
{
  let c = read('src/components/training/LearningPaths.tsx');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  MapPin,\r?\n/m, '');
  c = c.replace(/^  User,\r?\n/m, '');
  c = c.replace(
    /  Pie,\r?\n  RadialBarChart,\r?\n  RadialBar,\r?\n  ScatterChart,\r?\n  Scatter,\r?\n  ComposedChart,\r?\n  RechartsTooltip,\r?\n  Treemap\r?\n\} from 'recharts'/,
    "  Pie\r\n} from 'recharts'"
  );
  c = c.replace('  correctAnswer: any', '  correctAnswer: unknown');
  c = c.replace(
    /  const \[selectedPath, setSelectedPath\] = useState<LearningPath \| null>\(null\)\r?\n/,
    ''
  );
  write('src/components/training/LearningPaths.tsx', c);
}
