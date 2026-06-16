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

function fixMediaPage(file, { removeFormatDate = true } = {}) {
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
  if (removeFormatDate) {
    c = c.replace(
      /\r?\n  const formatDate = \(dateString: string\) => \{\r?\n    return new Date\(dateString\)\.toLocaleDateString\('pt-BR'\);\r?\n  \};\r?\n/,
      '\r\n'
    );
  }
  write(file, c);
}

fixMediaPage('src/pages/photos.tsx');

// pages/refunds.tsx — hooks/handlers only (formatDate is used)
{
  let c = read('pages/refunds.tsx');
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
  write('pages/refunds.tsx', c);
}

// DisasterRecovery.tsx — espelha DataReplication residual
{
  let c = read('src/components/backup/DisasterRecovery.tsx');
  c = c.replace(/^import \{ Input \} from '@\/components\/ui\/Input'\r?\n/m, '');
  c = c.replace(/^import \{ Select \} from '@\/components\/ui\/Select'\r?\n/m, '');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  LineChart, \r?\n/m, '');
  c = c.replace(/^  AreaChart, \r?\n/m, '');
  c = c.replace(/^  Area, \r?\n/m, '');
  c = c.replace(
    /  Pie,\r?\n  RadialBarChart,\r?\n  RadialBar,\r?\n  ScatterChart,\r?\n  Scatter,\r?\n  ComposedChart,\r?\n  RechartsTooltip\r?\n\} from 'recharts'/,
    "  Pie,\r\n  ComposedChart\r\n} from 'recharts'"
  );
  c = c.replace(
    /  const \[selectedPlan, setSelectedPlan\] = useState<DisasterRecoveryPlan \| null>\(null\)\r?\n/,
    ''
  );
  c = c.replace(
    /  const \[selectedEvent, setSelectedEvent\] = useState<DisasterEvent \| null>\(null\)\r?\n/,
    ''
  );
  write('src/components/backup/DisasterRecovery.tsx', c);
}
