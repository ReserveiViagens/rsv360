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

// DataProtectionCenter.tsx
{
  let c = read('src/components/security/DataProtectionCenter.tsx');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  LineChart, \r?\n/m, '');
  c = c.replace(/^  RadialBarChart,\r?\n/m, '');
  c = c.replace(/^  RadialBar,\r?\n/m, '');
  c = c.replace(
    /interface DataFlow \{[\s\S]*?\}\r?\n\r?\ninterface DataSubject \{[\s\S]*?\}\r?\n\r?\ninterface BreachIncident/,
    'interface BreachIncident'
  );
  c = c.replace(
    /  const \[selectedAsset, setSelectedAsset\] = useState<DataAsset \| null>\(null\)\r?\n/,
    ''
  );
  write('src/components/security/DataProtectionCenter.tsx', c);
}

// pages/marketing.tsx — espelha src/pages/marketing (#399)
{
  let c = read('pages/marketing.tsx');
  c = c.replace(/^import NavigationButtons from '\.\.\/components\/NavigationButtons';\r?\n/m, '');
  c = c.replace(/^import \{ useAuth \} from '\.\.\/src\/context\/AuthContext';\r?\n/m, '');
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
  write('pages/marketing.tsx', c);
}

// src/pages/reviews.tsx — espelha pages/reviews (#397)
{
  let c = read('src/pages/reviews.tsx');
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
  write('src/pages/reviews.tsx', c);
}
