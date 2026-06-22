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

function fixCustomersComplete(rel) {
  let c = read(rel);

  c = c.replace(
    'const [showStatsModal, setShowStatsModal] = useState(false);',
    'const [, setShowStatsModal] = useState(false);'
  );

  c = c.replace(
    /  \/\/ Carregar clientes completos na inicialização\r?\n  useEffect\(\(\) => \{\r?\n    loadCustomersComplete\(\);\r?\n  \}, \[\]\);\r?\n\r?\n  const loadCustomersComplete = async \(\) => \{/,
    '  async function loadCustomersComplete() {'
  );

  c = c.replace(
    /    \} finally \{\r?\n      setLoading\(false\);\r?\n    \}\r?\n  \};\r?\n\r?\n  const handleCreateCustomer/,
    `    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial mock customer load
    loadCustomersComplete();
  }, []);

  const handleCreateCustomer`
  );

  c = c.replace(/} catch \(error: any\)/g, '} catch (error: unknown)');
  c = c.replace(
    /setError\(`Erro ao carregar clientes: \$\{error\.message\}`\);/,
    "setError(`Erro ao carregar clientes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);"
  );
  c = c.replace(
    /setError\(`Erro ao salvar: \$\{error\.message\}`\);/,
    "setError(`Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);"
  );
  c = c.replace(
    /setError\(`Erro ao excluir: \$\{error\.message\}`\);/,
    "setError(`Erro ao excluir: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);"
  );

  c = c.replace(
    /  const handleInputChange = \(field: string, value: any\) => \{\r?\n    const keys = field\.split\('\.'\);\r?\n    setFormData\(prev => \{\r?\n      const updated = \{ \.\.\.prev \};\r?\n      let current: any = updated;\r?\n      for \(let i = 0; i < keys\.length - 1; i\+\+\) \{\r?\n        current = current\[keys\[i\]\];\r?\n      \}\r?\n      current\[keys\[keys\.length - 1\]\] = value;\r?\n      return updated;\r?\n    \}\);\r?\n  \};\r?\n\r?\n  const handleArrayToggle = \(field: string, value: string\) => \{[\s\S]*?  \};\r?\n\r?\n/,
    `  const handleInputChange = (field: string, value: unknown) => {
    const keys = field.split('.');
    setFormData(prev => {
      const updated = { ...prev } as Record<string, unknown>;
      let current: Record<string, unknown> = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
      return updated as Customer;
    });
  };

`
  );

  c = c.replace(
    /    \.sort\(\(a, b\) => \{\r?\n      let aValue: any;\r?\n      let bValue: any;\r?\n\r?\n      if \(sortBy\.includes\('\.'\)\) \{\r?\n        const keys = sortBy\.split\('\.'\);\r?\n        let aNested: any = a;\r?\n        let bNested: any = b;\r?\n        for \(const key of keys\) \{\r?\n          aNested = aNested\?\.\[key\];\r?\n          bNested = bNested\?\.\[key\];\r?\n        \}\r?\n        aValue = aNested;\r?\n        bValue = bNested;\r?\n      \} else \{\r?\n        aValue = a\[sortBy as keyof Customer\];\r?\n        bValue = b\[sortBy as keyof Customer\];\r?\n      \}\r?\n\r?\n      if \(typeof aValue === 'string'\) aValue = aValue\.toLowerCase\(\);\r?\n      if \(typeof bValue === 'string'\) bValue = bValue\.toLowerCase\(\);\r?\n\r?\n      if \(sortOrder === 'asc'\) \{\r?\n        return aValue < bValue \? -1 : aValue > bValue \? 1 : 0;\r?\n      \} else \{\r?\n        return aValue > bValue \? -1 : aValue < bValue \? 1 : 0;\r?\n      \}\r?\n    \}\);/,
    `    .sort((a, b) => {
      const getSortValue = (customer: Customer): string | number => {
        if (sortBy.includes('.')) {
          const keys = sortBy.split('.');
          let nested: unknown = customer;
          for (const key of keys) {
            nested = (nested as Record<string, unknown>)?.[key];
          }
          if (typeof nested === 'string' || typeof nested === 'number') return nested;
          return String(nested ?? '');
        }
        const value = customer[sortBy as keyof Customer];
        if (typeof value === 'string' || typeof value === 'number') return value;
        return String(value ?? '');
      };

      let aValue = getSortValue(a);
      let bValue = getSortValue(b);
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });`
  );

  write(rel, c);
}

function fixAdvancedCharts(rel) {
  let c = read(rel);

  const imports = `import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';
import { TrendingUp, Activity, Target, Zap } from 'lucide-react';
`;

  c = c.replace(
    /^import React[\s\S]*?from 'lucide-react';\r?\n/,
    `${imports}\n`
  );

  c = c.replace(
    /interface ChartData \{[\s\S]*?\}\r?\n\r?\ninterface AdvancedChartsProps/,
    `interface AnalyticsDestination {
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
}

interface AnalyticsData {
  destinations?: AnalyticsDestination[];
  summary?: {
    totalRevenue?: number;
    totalBookings?: number;
    activeCustomers?: number;
    averageRating?: number;
    conversionRate?: number;
  };
}

interface AdvancedChartsProps`
  );

  c = c.replace(
    'interface AdvancedChartsProps {\n  data: any;',
    'interface AdvancedChartsProps {\n  data: AnalyticsData | null;'
  );

  c = c.replace(
    /const AdvancedCharts: React\.FC<AdvancedChartsProps> = \(\{ data, selectedMetric, onMetricChange \}\) => \{\r?\n  const \[hoveredData, setHoveredData\] = useState<any>\(null\);\r?\n  const \[selectedSegment, setSelectedSegment\] = useState<string \| null>\(null\);\r?\n/,
    'const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ data, selectedMetric, onMetricChange }) => {\n  const [, setHoveredData] = useState<unknown>(null);\n'
  );

  c = c.replace(
    /    const correlationData = data\.destinations\?\.map\(\(dest: any\) => \(\{/,
    '    const correlationData = data.destinations?.map((dest) => ({'
  );
  c = c.replace(
    /    const treemapData = data\.destinations\?\.map\(\(dest: any\) => \(\{/,
    '    const treemapData = data.destinations?.map((dest) => ({'
  );

  c = c.replace(
    /  const getColorByValue = \(value: number, max: number\) => \{[\s\S]*?  \};\r?\n\r?\n  \/\/ ===================================================================\r?\n  \/\/ RENDERIZAÇÃO/,
    `  // ===================================================================
  // RENDERIZAÇÃO`
  );

  c = c.replace(/formatter=\{\(value, name, props\) =>/g, 'formatter={(value, _name, _props) =>');
  c = c.replace(/formatter=\{\(value, name\) =>/g, 'formatter={(value, _name) =>');
  c = c.replace(/content=\{\(props\) =>/g, 'content={(_props) =>');

  write(rel, c);
}

function fixApprovalSystem(rel) {
  let c = read(rel);

  c = c.replace(
    /^'use client';\r?\nimport React, \{ useState \} from 'react';\r?\nimport \{[\s\S]*?\} from 'lucide-react';\r?\nimport \{ toast \}/,
    `'use client';
import React, { useState } from 'react';
import { Card, Button, Input, Badge, Tabs, Select, Avatar } from '@/components/ui';
import { Plus, Check, X, Clock, AlertTriangle, CheckCircle, Edit, Trash2, FileText } from 'lucide-react';
import { toast }`
  );

  if (!c.includes('APPROVAL_MOCK_BASE_MS')) {
    c = c.replace(
      /interface ApprovalSystemProps \{[\s\S]*?\}\r?\n\r?\nexport default function ApprovalSystem/,
      `interface ApprovalSystemProps {
  onRequestSelect?: (request: ApprovalRequest) => void;
}

const APPROVAL_MOCK_BASE_MS = 1737374400000;
function approvalMockDate(offsetMs: number): Date {
  return new Date(APPROVAL_MOCK_BASE_MS + offsetMs);
}

export default function ApprovalSystem`
    );
  }

  c = c.replace(/new Date\(Date\.now\(\) \+ (\d+)\)/g, 'approvalMockDate($1)');
  c = c.replace(/new Date\(Date\.now\(\) - (\d+)\)/g, 'approvalMockDate(-$1)');

  c = c.replace('const [workflows, setWorkflows]', 'const [workflows]');

  c = c.replace(
    /  const getApprovalStatus = \(request: ApprovalRequest\) => \{[\s\S]*?  \};\r?\n\r?\n  const formatFileSize/,
    '  const formatFileSize'
  );

  c = c.replace(
    /<img src=\{request\.requester\.avatar\} alt=\{request\.requester\.name\} \/>/g,
    `{/* eslint-disable-next-line @next/next/no-img-element -- avatar URL from mock */}
                              <img src={request.requester.avatar} alt={request.requester.name} />`
  );
  c = c.replace(
    /<img src=\{approver\.avatar\} alt=\{approver\.name\} \/>/g,
    `{/* eslint-disable-next-line @next/next/no-img-element -- avatar URL from mock */}
                                    <img src={approver.avatar} alt={approver.name} />`
  );

  write(rel, c);
}

fixCustomersComplete('pages/customers-complete.tsx');
fixAdvancedCharts('src/components/analytics/AdvancedCharts.tsx');
fixApprovalSystem('src/components/workflow/ApprovalSystem.tsx');
