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

// src/pages/plans.tsx — espelha pages/plans.tsx (#393)
{
  let c = read('src/pages/plans.tsx');
  c = c.replace(
    /  const \[showModal, setShowModal\] = useState\(false\);\r?\n  const \[showCreateModal, setShowCreateModal\] = useState\(false\);\r?\n/,
    '  const [showModal, setShowModal] = useState(false);\r\n'
  );
  c = c.replace(/setShowCreateModal/g, 'setShowModal');
  c = c.replace(
    /\r?\n  const priorityColors = \{\r?\n    low: 'bg-gray-100 text-gray-800',\r?\n    medium: 'bg-yellow-100 text-yellow-800',\r?\n    high: 'bg-red-100 text-red-800'\r?\n  \};\r?\n/,
    '\r\n'
  );
  c = c.replace(
    /\r?\n  const handleStatusChange = \(planId: string, newStatus: Plan\['status'\]\) => \{\r?\n    setPlans\(prev => prev\.map\(p => \r?\n      p\.id === planId \? \{ \.\.\.p, status: newStatus \} : p\r?\n    \)\);\r?\n  \};\r?\n/,
    '\r\n'
  );
  c = c.replace(
    '  const [plans, setPlans] = useState<Plan[]>([',
    '  const [plans] = useState<Plan[]>(['
  );
  write('src/pages/plans.tsx', c);
}

// SkillsAssessment.tsx
{
  let c = read('src/components/training/SkillsAssessment.tsx');
  c = c.replace(/^import \{ Input \} from '@\/components\/ui\/Input'\r?\n/m, '');
  c = c.replace(/^import \{ Select \} from '@\/components\/ui\/Select'\r?\n/m, '');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(
    /  Pie,\r?\n  RadialBarChart,\r?\n  RadialBar,\r?\n  ScatterChart,\r?\n  Scatter,\r?\n  ComposedChart\r?\n\} from 'recharts'/,
    "  Pie\r\n} from 'recharts'"
  );
  c = c.replace('  correctAnswer?: any', '  correctAnswer?: unknown');
  c = c.replace(
    /  const \[selectedCategory, setSelectedCategory\] = useState<string \| null>\(null\)\r?\n/,
    '  const [, setSelectedCategory] = useState<string | null>(null)\r\n'
  );
  c = c.replace(
    /  const \[currentAssessment, setCurrentAssessment\] = useState<AssessmentMethod \| null>\(null\)\r?\n/,
    ''
  );
  c = c.replace(
    /  const \[assessmentProgress, setAssessmentProgress\] = useState\(0\)\r?\n/,
    ''
  );
  c = c.replace(
    /  const \[selectedResult, setSelectedResult\] = useState<AssessmentResult \| null>\(null\)\r?\n/,
    ''
  );
  c = c.replace(
    /\r?\n  const formatDuration = \(minutes: number\) => \{\r?\n    const hours = Math\.floor\(minutes \/ 60\)\r?\n    const remainingMinutes = minutes % 60\r?\n    \r?\n    if \(hours > 0\) \{\r?\n      return `\$\{hours\}h \$\{remainingMinutes\}m`\r?\n    \} else \{\r?\n      return `\$\{remainingMinutes\}m`\r?\n    \}\r?\n  \}\r?\n/,
    '\r\n'
  );
  c = c.replace(
    /\r?\n  const getImportanceColor = \(importance: string\) => \{\r?\n    switch \(importance\) \{\r?\n      case 'critical': return 'bg-red-100 text-red-800'\r?\n      case 'high': return 'bg-orange-100 text-orange-800'\r?\n      case 'medium': return 'bg-yellow-100 text-yellow-800'\r?\n      case 'low': return 'bg-green-100 text-green-800'\r?\n      default: return 'bg-gray-100 text-gray-800'\r?\n    \}\r?\n  \}\r?\n/,
    '\r\n'
  );
  c = c.replace(
    'Não se preocupe com respostas "certas"',
    'Não se preocupe com respostas &quot;certas&quot;'
  );
  write('src/components/training/SkillsAssessment.tsx', c);
}

// DataReplication.tsx
{
  let c = read('src/components/backup/DataReplication.tsx');
  c = c.replace(/^import \{ Input \} from '@\/components\/ui\/Input'\r?\n/m, '');
  c = c.replace(/^import \{ Select \} from '@\/components\/ui\/Select'\r?\n/m, '');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(
    /  ResponsiveContainer, \r?\n  AreaChart, \r?\n  Area, \r?\n  BarChart,/,
    '  ResponsiveContainer, \r\n  BarChart,'
  );
  c = c.replace(
    /  Pie,\r?\n  RadialBarChart,\r?\n  RadialBar,\r?\n  ScatterChart,\r?\n  Scatter,\r?\n  ComposedChart,\r?\n  RechartsTooltip\r?\n\} from 'recharts'/,
    "  Pie,\r\n  ComposedChart\r\n} from 'recharts'"
  );
  c = c.replace('  sourceValue: any', '  sourceValue: unknown');
  c = c.replace('  targetValue: any', '  targetValue: unknown');
  c = c.replace(
    /interface ReplicationMetrics \{\r?\n  channelId: string\r?\n  timestamp: string\r?\n  lag: number\r?\n  throughput: number\r?\n  errorCount: number\r?\n  bytesPerSecond: number\r?\n  recordsPerSecond: number\r?\n  cpuUsage: number\r?\n  memoryUsage: number\r?\n  networkUsage: number\r?\n\}\r?\n\r?\n/,
    ''
  );
  c = c.replace(
    /  const \[selectedChannel, setSelectedChannel\] = useState<ReplicationChannel \| null>\(null\)\r?\n/,
    ''
  );
  c = c.replace(
    /  const \[selectedTopology, setSelectedTopology\] = useState<ReplicationTopology \| null>\(null\)\r?\n/,
    ''
  );
  write('src/components/backup/DataReplication.tsx', c);
}
