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

function fixParques(rel) {
  let c = read(rel);

  c = c.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { useRouter } from 'next/router';\nimport Link from 'next/link';"
  );
  c = c.replace(
    /import \{[\s\S]*?\} from 'lucide-react';/,
    `import {
  ArrowLeft,
  FerrisWheel,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Lightbulb,
  CheckSquare,
  BookOpen,
  Users,
  Zap
} from 'lucide-react';`
  );
  c = c.replace(
    "import { Budget, BudgetItem, Photo, Highlight, Benefit, AccommodationDetail, ImportantNote } from '@/lib/types/budget';",
    "import { Budget } from '@/lib/types/budget';"
  );
  c = c.replace(/^import \{ getAllParks, getParkById, parkTypes \} from '@\/lib\/parks-data';\r?\n/m, '');
  c = c.replace(
    "import { getAllParks, getParkById, parkTypes } from '@/lib/parks-data';",
    "import { getParkById, parkTypes } from '@/lib/parks-data';"
  );

  c = c.replace(
    /  useEffect\(\(\) => \{\r?\n    setIsClient\(true\);\r?\n    calculateTotals\(\);\r?\n    \r?\n    \/\/ Carregar orçamento existente se estiver em modo view\/edit\r?\n    const \{ view, edit \} = router\.query;\r?\n    const budgetId = view \|\| edit;\r?\n    if \(budgetId && typeof budgetId === 'string'\) \{\r?\n      const existing = budgetStorage\.getById\(budgetId\);\r?\n      if \(existing\) \{\r?\n        setBudget\(existing\);\r?\n      \}\r?\n    \}\r?\n  \}, \[router\.query, budget\.items, budget\.discount, budget\.taxes, budget\.discountType, budget\.taxType\]\);\r?\n/,
    `  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount
    setIsClient(true);
  }, []);

  useEffect(() => {
    const { view, edit } = router.query;
    const budgetId = view || edit;
    if (budgetId && typeof budgetId === 'string') {
      const existing = budgetStorage.getById(budgetId);
      if (existing) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- load saved budget from query
        setBudget(existing);
      }
    }
  }, [router.query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- recalc totals when pricing fields change
    calculateTotals();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recalc totals when pricing fields change
  }, [budget.items, budget.discount, budget.taxes, budget.discountType, budget.taxType]);

`
  );

  c = c.replace(/  const calculateTotals = \(\) => \{/g, '  function calculateTotals() {');

  const totalsMatch = c.match(/  function calculateTotals\(\) \{[\s\S]*?  \};\r?\n\r?\n  const handleSave/);
  if (totalsMatch) {
    const fn = totalsMatch[0].replace(/  \};\r?\n\r?\n  const handleSave/, '  }\n\n  const handleSave');
    c = c.replace(totalsMatch[0], '  const handleSave');
    c = c.replace(
      /  const \[isFullscreen, setIsFullscreen\] = useState\(false\);\r?\n\r?\n  useEffect/,
      `  const [isFullscreen, setIsFullscreen] = useState(false);

${fn.replace('  const handleSave', '')}
  useEffect`
    );
  }

  c = c.replace(
    /  const updateBudget = \(field: string, value: any\) =>/,
    '  const updateBudget = (field: string, value: unknown) =>'
  );
  c = c.replace(
    /  const updateItem = \(index: number, field: string, value: any\) =>/,
    '  const updateItem = (index: number, field: string, value: unknown) =>'
  );
  c = c.replace(/\(budget\.status as any\)/g, "(budget.status as Budget['status'])");
  c = c.replace(/\(budget\.items as any\)/g, '(budget.items ?? [])');
  c = c.replace(
    '<Image className="w-5 h-5 text-purple-600" />',
    '<ImageIcon className="w-5 h-5 text-purple-600" aria-hidden />'
  );
  c = c.replace(
    '<img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover rounded-lg" />',
    `{/* eslint-disable-next-line @next/next/no-img-element -- preview URL from upload */}
                      <img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover rounded-lg" />`
  );

  write(rel, c);
}

function fixSettings(rel) {
  let c = read(rel);

  c = c.replace(
    /^'use client'\r?\n\r?\nimport React, \{ useState, useEffect \} from 'react'\r?\nimport \{/m,
    `'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import {
  Settings,`
  );

  c = c.replace(/  value: any\r?\n/, '  value: unknown\n');
  c = c.replace(/getSettingType = \(key: string, value: any\)/, 'getSettingType = (key: string, value: unknown)');
  c = c.replace(/handleSettingChange = async \(settingId: string, newValue: any\)/, 'handleSettingChange = async (settingId: string, newValue: unknown)');

  c = c.replace(
    /  useEffect\(\(\) => \{\r?\n    loadCategories\(\)\r?\n    loadSettings\(\)\r?\n  \}, \[\]\)\r?\n\r?\n  useEffect\(\(\) => \{\r?\n    \/\/ Não recarregar quando a categoria mudar, apenas filtrar\r?\n  \}, \[selectedCategory\]\)\r?\n\r?\n  const loadSettings = async \(\) => \{/,
    '  async function loadSettings() {'
  );
  c = c.replace(
    /  const loadCategories = \(\) => \{/,
    '  function loadCategories() {'
  );
  c = c.replace(
    /    setCategories\(mockCategories\)\r?\n  \}\r?\n/,
    `    setCategories(mockCategories)
  }

  useEffect(() => {
    loadCategories()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial settings load
    void loadSettings()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [])

`
  );

  write(rel, c);
}

function fixOptimizationEngine(rel) {
  let c = read(rel);

  c = c.replace(/^  RadialBarChart,\r?\n/m, '');
  c = c.replace(/^  RadialBar,\r?\n/m, '');
  c = c.replace(/^  ScatterChart,\r?\n/m, '');
  c = c.replace(/^  Scatter\r?\n/m, '');

  c = c.replace(
    '  const [selectedRule, setSelectedRule] = useState<OptimizationRule | null>(null)\n',
    ''
  );

  c = c.replace(
    /  const RuleForm: React\.FC = \(\) => \([\s\S]*?\)\r?\n\r?\n  return \(/,
    '  return ('
  );

  c = c.replace(
    /const progress = target\.optimal_value[\s\S]*?: target\.optimization_potential\r?\n/,
    ''
  );

  c = c.replace(
    'const improvement = ((rule?.target.current_value! - execution.bestValue) / rule?.target.current_value!) * 100',
    `const baseValue = rule?.target.current_value ?? 0
                  const improvement = baseValue
                    ? ((baseValue - execution.bestValue) / baseValue) * 100
                    : 0`
  );

  write(rel, c);
}

fixParques('pages/cotacoes/parques.tsx');
fixSettings('pages/settings.tsx');
fixOptimizationEngine('src/components/ai/OptimizationEngine.tsx');
