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

function fixDashboardMaster(rel) {
  let c = read(rel);
  c = c.replace(/^import NavigationButtons from[^\n]+\n/m, '');
  c = c.replace(
    /  useEffect\(\(\) => \{\r?\n    loadDashboardData\(\);\r?\n  \}, \[selectedPeriod\]\);\r?\n\r?\n  const loadDashboardData = async \(\) => \{/,
    `  async function loadDashboardData() {`
  );
  c = c.replace(
    /    \} finally \{\r?\n      setLoading\(false\);\r?\n    \}\r?\n  \};\r?\n\r?\n  const quickActions/,
    `    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload mock dashboard when period changes
  }, [selectedPeriod]);

  const quickActions`
  );
  write(rel, c);
}

function fixHotelsFuncional(rel) {
  let c = read(rel);

  const mockMatch = c.match(/  const getMockHotels = \(\): Hotel\[\] => \[[\s\S]*?  \];\r?\n/);
  if (!mockMatch) throw new Error('getMockHotels block not found');
  const mockBlock = mockMatch[0].replace(/^  /gm, '');
  c = c.replace(mockMatch[0], '');

  c = c.replace(
    /  \/\/ Carregar hotéis da API\r?\n  useEffect\(\(\) => \{\r?\n    loadHotels\(\);\r?\n  \}, \[\]\);\r?\n\r?\n  const loadHotels = async \(\) => \{/,
    `  ${mockBlock}
  async function loadHotels() {`
  );

  c = c.replace(
    /    \} finally \{\r?\n      setLoading\(false\);\r?\n    \}\r?\n  \};\r?\n\r?\n  const handleCreateHotel/,
    `    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotels();
  }, []);

  const handleCreateHotel`
  );

  c = c.replace(/} catch \(error: any\)/g, '} catch (error: unknown)');
  c = c.replace(
    'setError(`Erro ao salvar: ${error.message || \'Erro desconhecido\'}`);',
    "setError(`Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);"
  );
  c = c.replace(
    /  const handleInputChange = \(field: string, value: any\) =>/,
    '  const handleInputChange = (field: string, value: unknown) =>'
  );
  c = c.replace(
    /  const handleArrayAdd = \(field: string, value: string\) => \{[\s\S]*?  \};\r?\n\r?\n  const handleArrayRemove = \(field: string, index: number\) => \{[\s\S]*?  \};\r?\n\r?\n/,
    ''
  );

  write(rel, c);
}

function fixFinancialAnalytics(rel) {
  let c = read(rel);
  const imports = `'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'
import {
  TrendingUp,
  Calculator,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  CreditCard,
  Wallet
} from 'lucide-react'
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts'
`;

  c = c.replace(/^'use client'[\s\S]*?from 'recharts'\r?\n/, `${imports}\n`);
  c = c.replace(
    /  const \[comparisonMode, setComparisonMode\] = useState\('periodo-anterior'\)\r?\n\r?\n/,
    ''
  );
  write(rel, c);
}

fixDashboardMaster('pages/dashboard-master.tsx');
fixHotelsFuncional('pages/hotels-funcional.tsx');
fixFinancialAnalytics('src/components/financial/FinancialAnalytics.tsx');
