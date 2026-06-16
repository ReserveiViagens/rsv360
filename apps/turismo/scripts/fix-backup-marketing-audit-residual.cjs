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

// BackupCenter.tsx
{
  let c = read('src/components/backup/BackupCenter.tsx');
  c = c.replace(/^import \{ Input \} from '@\/components\/ui\/Input'\r?\n/m, '');
  c = c.replace(/^import \{ Select \} from '@\/components\/ui\/Select'\r?\n/m, '');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  Save,\r?\n/m, '');
  c = c.replace(/^  AreaChart, \r?\n/m, '');
  c = c.replace(/^  Area, \r?\n/m, '');
  c = c.replace(/^  BarChart, \r?\n/m, '');
  c = c.replace(
    /  Pie,\r?\n  RadialBarChart,\r?\n  RadialBar,\r?\n  ScatterChart,\r?\n  Scatter,\r?\n  ComposedChart,\r?\n  RechartsTooltip\r?\n\} from 'recharts'/,
    "  Pie,\r\n  ComposedChart,\r\n  Bar\r\n} from 'recharts'"
  );
  c = c.replace(
    /  const \[selectedJob, setSelectedJob\] = useState<BackupJob \| null>\(null\)\r?\n  const \[isCreateJobOpen, setIsCreateJobOpen\] = useState\(false\)\r?\n/,
    '  const [, setIsCreateJobOpen] = useState(false)\r\n'
  );
  c = c.replace('formatter={(value: any)', 'formatter={(value: number)');
  write('src/components/backup/BackupCenter.tsx', c);
}

// AuditSystem.tsx
{
  let c = read('src/components/security/AuditSystem.tsx');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  Edit\r?\n\} from 'lucide-react';/m, "  Edit,\r\n  Play\r\n} from 'lucide-react';");
  c = c.replace(/^  LineChart, \r?\n/m, '');
  c = c.replace(/^  Line, \r?\n/m, '');
  c = c.replace(
    /  Pie,\r?\n  RadialBarChart,\r?\n  RadialBar,\r?\n  ScatterChart,\r?\n  Scatter\r?\n\} from 'recharts'/,
    "  Pie\r\n} from 'recharts'"
  );
  c = c.replace(/Record<string, any>/g, 'Record<string, unknown>');
  c = c.replace(
    /interface AuditReport \{[\s\S]*?\}\r?\n\r?\ninterface AuditAlert/,
    'interface AuditAlert'
  );
  c = c.replace(
    /  const \[selectedLog, setSelectedLog\] = useState<AuditLog \| null>\(null\)\r?\n/,
    ''
  );
  c = c.replace(
    '{condition.field} {condition.operator} "{condition.value}"',
    '{condition.field} {condition.operator} &quot;{condition.value}&quot;'
  );
  write('src/components/security/AuditSystem.tsx', c);
}

// marketing.tsx
{
  let c = read('src/pages/marketing.tsx');
  c = c.replace(/^import NavigationButtons from '\.\.\/components\/NavigationButtons';\r?\n/m, '');
  c = c.replace(/^import \{ useAuth \} from '\.\.\/context\/AuthContext';\r?\n/m, '');
  c = c.replace(/^import \{ useRouter \} from 'next\/router';\r?\n/m, '');
  c = c.replace(/    const \{ user \} = useAuth\(\);\r?\n    const router = useRouter\(\);\r?\n/, '');
  c = c.replace(/    const \[selectedCategory, setSelectedCategory\] = useState<string \| null>\(null\);\r?\n/, '');
  c = c.replace(
    '    const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);',
    '    const [, setShowNewCampaignModal] = useState(false);'
  );
  c = c.replace(
    '    const [showEditCampaignModal, setShowEditCampaignModal] = useState(false);',
    '    const [, setShowEditCampaignModal] = useState(false);'
  );
  c = c.replace(
    '    const [showCampaignDetails, setShowCampaignDetails] = useState(false);',
    '    const [, setShowCampaignDetails] = useState(false);'
  );
  c = c.replace(
    '    const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);',
    '    const [, setShowAnalyticsModal] = useState(false);'
  );
  c = c.replace(
    '    const [showServiceDetails, setShowServiceDetails] = useState(false);',
    '    const [, setShowServiceDetails] = useState(false);'
  );
  c = c.replace(
    '    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);',
    '    const [, setEditingCampaign] = useState<Campaign | null>(null);'
  );
  c = c.replace(
    '    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);',
    '    const [, setSelectedCampaign] = useState<Campaign | null>(null);'
  );
  c = c.replace(
    '    const [selectedService, setSelectedService] = useState<MarketingService | null>(null);',
    '    const [, setSelectedService] = useState<MarketingService | null>(null);'
  );
  c = c.replace(
    '    const [showExportModal, setShowExportModal] = useState(false);',
    '    const [, setShowExportModal] = useState(false);'
  );
  c = c.replace(
    /    const \[exportFormat, setExportFormat\] = useState<'csv' \| 'pdf'>\('csv'\);\r?\n    const \[exportGenerating, setExportGenerating\] = useState\(false\);\r?\n/,
    ''
  );
  c = c.replace(
    /\r?\n    const handleExportSubmit = async \(\) => \{[\s\S]*?\r?\n    \};\r?\n/,
    '\r\n'
  );
  c = c.replace(
    /\r?\n    const formatDate = \(dateString: string\) => \{\r?\n        return new Date\(dateString\)\.toLocaleDateString\('pt-BR'\);\r?\n    \};\r?\n/,
    '\r\n'
  );
  c = c.replace(
    /\r?\n    const calculateROI = \(spent: number, conversions: number\) => \{\r?\n        if \(spent === 0\) return 0;\r?\n        return \(\(conversions \* 100 - spent\) \/ spent \* 100\)\.toFixed\(2\);\r?\n    \};\r?\n/,
    '\r\n'
  );
  c = c.replace(
    '    }, []);',
    '    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only mock load\n    }, []);'
  );
  c = c.replace(
    '{ className: \'w-5 h-5\' } as any)',
    "{ className: 'w-5 h-5' } as { className?: string })"
  );
  write('src/pages/marketing.tsx', c);
}
