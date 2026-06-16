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

function fixIntegrationHub(rel) {
  let c = read(rel);
  c = c.replace(/^import \{ Progress \} from '@\/components\/ui\/Progress'\r?\n/m, '');
  c = c.replace(/^  LineChart, \r?\n/m, '');
  c = c.replace(/^  Line, \r?\n/m, '');
  c = c.replace(/Record<string, any>/g, 'Record<string, unknown>');
  c = c.replace(
    /interface MarketplaceStats \{[\s\S]*?\}\r?\n\r?\nconst IntegrationHub/,
    'const IntegrationHub'
  );
  c = c.replace(
    "const [selectedCategory, setSelectedCategory] = useState('all')",
    "const [selectedCategory] = useState('all')"
  );
  c = c.replace(
    /  const \[selectedIntegration, setSelectedIntegration\] = useState<Integration \| null>\(null\)\r?\n/,
    ''
  );
  write(rel, c);
}

function fixProjectTimeline(rel) {
  let c = read(rel);
  c = c.replace(
    /import \{[\s\S]*?\} from 'lucide-react';\r?\nimport \{ toast \}/,
    "import { Card, Button, Input, Badge, Tabs, Select, Progress, Textarea } from '@/components/ui';\nimport { Plus, Edit, Calendar, Target, Clock, CheckCircle, Eye, User, Milestone, Play, Square } from 'lucide-react';\nimport { toast }"
  );
  c = c.replace(
    'export default function ProjectTimeline({ onMilestoneSelect, onPhaseSelect }: ProjectTimelineProps) {',
    'export default function ProjectTimeline({ onMilestoneSelect, onPhaseSelect: _onPhaseSelect }: ProjectTimelineProps) {'
  );
  c = c.replace(
    /  const handleDeleteMilestone = \(milestoneId: string\) => \{\r?\n    setMilestones\(milestones\.filter\(m => m\.id !== milestoneId\)\);\r?\n    toast\.success\('Milestone removido com sucesso!'\);\r?\n  \};\r?\n\r?\n/,
    ''
  );
  c = c.replace('.map((milestone, index) => (', '.map((milestone, _index) => (');
  c = c.replace(/onValueChange=\{\(value: any\)/g, 'onValueChange={(value: string)');
  write(rel, c);
}

function fixAtracoes(rel) {
  let c = read(rel);

  c = c.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { useRouter } from 'next/router';\nimport Link from 'next/link';"
  );
  c = c.replace(
    /import \{[\s\S]*?\} from 'lucide-react';/,
    `import {
  ArrowLeft,
  MapPin,
  Plus,
  Save,
  Trash2,
  Upload,
  Eye,
  Edit,
  Lightbulb,
  CheckSquare,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';`
  );
  c = c.replace(
    "import { Budget, BudgetItem, Photo, Highlight, Benefit, AccommodationDetail, ImportantNote } from '@/lib/types/budget';",
    "import { Budget, BudgetItem } from '@/lib/types/budget';"
  );
  c = c.replace(/^import \{ getAttractionById \} from '@\/lib\/attractions-data';\r?\n/m, '');
  c = c.replace(
    "import { AttractionSelector } from '@/components/AttractionSelector';",
    "import { AttractionSelector } from '@/components/AttractionSelector';\nimport type { Attraction } from '@/lib/attractions-data';"
  );

  c = c.replace(
    '  const [selectedAttraction, setSelectedAttraction] = useState<any>(null);',
    `  interface AttractionSelection {
    state?: string;
    city?: string;
    attraction?: Attraction;
  }

  const [selectedAttraction, setSelectedAttraction] = useState<AttractionSelection | null>(null);`
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

  c = c.replace(
    /  const calculateTotals = \(\) => \{/,
    '  function calculateTotals() {'
  );
  c = c.replace(
    /  const updateBudget = \(field: string, value: any\) =>/,
    '  const updateBudget = (field: string, value: unknown) =>'
  );
  c = c.replace(
    /  const updateItem = \(index: number, field: string, value: any\) =>/,
    '  const updateItem = (index: number, field: string, value: unknown) =>'
  );
  c = c.replace(
    /  const handleAttractionSelect = \(selection: any\) =>/,
    '  const handleAttractionSelect = (selection: AttractionSelection) =>'
  );
  c = c.replace(/\(budget\.status as any\)/g, "(budget.status as Budget['status'])");
  c = c.replace(/\(budget\.items as any\)/g, '(budget.items ?? [])');
  c = c.replace(
    'Nenhum item adicionado. Clique em "Adicionar Item" para começar.',
    'Nenhum item adicionado. Clique em &quot;Adicionar Item&quot; para começar.'
  );
  c = c.replace(
    '<Image className="w-5 h-5 text-blue-600" />',
    '<ImageIcon className="w-5 h-5 text-blue-600" aria-hidden />'
  );
  c = c.replace(
    ) : (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element -- preview URL from upload */}
        <img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover rounded-lg" />
      </>
    )`,
  );

  write(rel, c);
}

fixIntegrationHub('src/components/integrations/IntegrationHub.tsx');
fixProjectTimeline('src/components/projects/ProjectTimeline.tsx');
fixAtracoes('pages/cotacoes/atracoes.tsx');
