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

const reservationsImport = `import React, { useState } from 'react';
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  Eye as EyeIcon,
  Search as SearchIcon,
  Clock as ClockIcon,
  UserCheck as UserCheckIcon,
  DollarSign as DollarSignIcon,
} from 'lucide-react';
`;

function fixReservations(rel) {
  let c = read(rel);
  c = c.replace(/^import React[\s\S]*?\} from 'lucide-react';\r?\n/, reservationsImport);
  c = c.replace('const handleStatusChange', 'const _handleStatusChange');
  c = c.replace('const handlePaymentStatusChange', 'const _handlePaymentStatusChange');
  write(rel, c);
}

// BackupAnalytics.tsx
{
  let c = read('src/components/backup/BackupAnalytics.tsx');
  c = c.replace(/^import \{ Input \} from '@\/components\/ui\/Input'\r?\n/m, '');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  LineChart as RechartsLineChart, \r?\n/m, '');
  c = c.replace(
    /  Pie,\r?\n  RadialBarChart,\r?\n  RadialBar,\r?\n  ScatterChart,\r?\n  Scatter,\r?\n  ComposedChart,\r?\n  RechartsTooltip\r?\n\} from 'recharts'/,
    "  Pie,\r\n  ComposedChart\r\n} from 'recharts'"
  );
  c = c.replace(
    /  const \[selectedMetric, setSelectedMetric\] = useState\('all'\)\r?\n/,
    ''
  );
  c = c.replace(/formatter=\{\(value: any\)/g, 'formatter={(value: number)');
  write('src/components/backup/BackupAnalytics.tsx', c);
}

// SecurityCenter.tsx
{
  let c = read('src/components/security/SecurityCenter.tsx');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  Mail\r?\n\} from 'lucide-react';/m, "  Mail,\r\n  Plus\r\n} from 'lucide-react';");
  c = c.replace(/^  LineChart, \r?\n/m, '');
  c = c.replace(/^  Line, \r?\n/m, '');
  c = c.replace(
    /  Pie,\r?\n  RadialBarChart,\r?\n  RadialBar,\r?\n  ScatterChart,\r?\n  Scatter\r?\n\} from 'recharts'/,
    "  Pie\r\n} from 'recharts'"
  );
  c = c.replace(
    /interface SecurityPolicy \{[\s\S]*?\}\r?\n\r?\ninterface VulnerabilityAssessment/,
    'interface VulnerabilityAssessment'
  );
  c = c.replace(
    /  const \[selectedThreat, setSelectedThreat\] = useState<SecurityThreat \| null>\(null\)\r?\n/,
    ''
  );
  write('src/components/security/SecurityCenter.tsx', c);
}

fixReservations('pages/reservations.tsx');
fixReservations('src/pages/reservations.tsx');
