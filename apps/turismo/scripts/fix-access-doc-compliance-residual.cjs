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

// AccessControlManager.tsx
{
  let c = read('src/components/security/AccessControlManager.tsx');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  LineChart, \r?\n/m, '');
  c = c.replace(/^  Line, \r?\n/m, '');
  c = c.replace(
    /  Pie,\r?\n  RadialBarChart,\r?\n  RadialBar\r?\n\} from 'recharts'/,
    "  Pie\r\n} from 'recharts'"
  );
  c = c.replace(
    /interface AccessPermission \{[\s\S]*?\}\r?\n\r?\ninterface AccessGroup \{[\s\S]*?\}\r?\n\r?\ninterface AccessSession/,
    'interface AccessSession'
  );
  c = c.replace(
    /interface AccessPolicy \{[\s\S]*?\}\r?\n\r?\ninterface AccessActivity/,
    'interface AccessActivity'
  );
  c = c.replace(
    /  const \[selectedUser, setSelectedUser\] = useState<AccessUser \| null>\(null\)\r?\n/,
    ''
  );
  c = c.replace(
    /\r?\n  const formatNumber = \(num: number\) => \{\r?\n    return new Intl\.NumberFormat\('pt-BR'\)\.format\(num\)\r?\n  \}\r?\n/,
    '\r\n'
  );
  c = c.replace(
    /\r?\n  const getMfaIcon = \(method: string\) => \{[\s\S]*?\r?\n  \}\r?\n/,
    '\r\n'
  );
  write('src/components/security/AccessControlManager.tsx', c);
}

// ComplianceManager.tsx
{
  let c = read('src/components/security/ComplianceManager.tsx');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  PieChart as PieChartIcon,\r?\n/m, '');
  c = c.replace(/^  AreaChart, \r?\n/m, '');
  c = c.replace(/^  Area, \r?\n/m, '');
  c = c.replace(
    /  Pie,\r?\n  RadialBarChart,\r?\n  RadialBar\r?\n\} from 'recharts'/,
    "  Pie\r\n} from 'recharts'"
  );
  c = c.replace(
    /interface ComplianceRisk \{[\s\S]*?\}\r?\n\r?\ninterface ComplianceReport \{[\s\S]*?\}\r?\n\r?\nconst ComplianceManager/,
    'const ComplianceManager'
  );
  c = c.replace(
    /  const \[selectedFramework, setSelectedFramework\] = useState<ComplianceFramework \| null>\(null\)\r?\n/,
    ''
  );
  c = c.replace(
    /\r?\n  const formatDateTime = \(dateString: string\) => \{\r?\n    return new Date\(dateString\)\.toLocaleString\('pt-BR'\)\r?\n  \}\r?\n/,
    '\r\n'
  );
  c = c.replace(
    /\r?\n  const formatNumber = \(num: number\) => \{\r?\n    return new Intl\.NumberFormat\('pt-BR'\)\.format\(num\)\r?\n  \}\r?\n/,
    '\r\n'
  );
  write('src/components/security/ComplianceManager.tsx', c);
}

// DocumentationPage.tsx
{
  let c = read('src/pages/DocumentationPage.tsx');
  c = c.replace(
    "import { FileText, GraduationCap, HelpCircle, BookOpen, MessageCircle, Plus, BarChart3, Users, CheckCircle, Star, Activity, Clock, TrendingUp } from 'lucide-react';",
    "import { FileText, GraduationCap, HelpCircle, BookOpen, MessageCircle, Plus, Users, CheckCircle, Star } from 'lucide-react';"
  );
  c = c.replace(
    "import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui';",
    "import { Card, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui';"
  );
  c = c.replace(/: any\)/g, ': unknown)');
  c = c.replace(/\((document|course|faq|article|ticket): unknown\)/g, '(_$1: unknown)');
  c = c.replace(/\((id): string\)/g, '(_$1: string)');
  c = c.replace(/\((userId): string, (courseId): string\)/g, '(_$1: string, _$2: string)');
  c = c.replace(/\((userId): string, (tutorialId): string\)/g, '(_$1: string, _$2: string)');
  c = c.replace(
      'João Silva completou "Introdução ao Sistema RSV"',
      'João Silva completou &quot;Introdução ao Sistema RSV&quot;'
  );
  c = c.replace(
      'Maria Santos começou "Gestão de Clientes"',
      'Maria Santos começou &quot;Gestão de Clientes&quot;'
  );
  write('src/pages/DocumentationPage.tsx', c);
}
