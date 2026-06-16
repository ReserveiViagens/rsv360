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

const PAYMENT_PERIODS_BLOCK = `const PAYMENT_PERIODS = ['diario', 'semanal', 'mensal', 'anual'] as const;
`;

function fixPagamentos(rel) {
  let c = read(rel);

  c = c.replace(/^import NavigationButtons from[^\n]+\n/m, '');

  c = c.replace('const [showNewPaymentModal, setShowNewPaymentModal]', 'const [showNewPaymentModal, setShowNewPaymentModal]');
  c = c.replace('const [, setShowEditPaymentModal]', 'const [, setShowEditPaymentModal]');
  c = c.replace('const [showPaymentDetails, setShowPaymentDetails]', 'const [, setShowPaymentDetails]');
  c = c.replace('const [showPaymentModal, setShowPaymentModal]', 'const [, setShowPaymentModal]');
  c = c.replace('const [editingPayment, setEditingPayment]', 'const [, setEditingPayment]');
  c = c.replace('const [selectedPayment, setSelectedPayment]', 'const [, setSelectedPayment]');

  c = c.replace(
    /    const \[showExportModal, setShowExportModal\] = useState\(false\);\r?\n    const \[exportFormat, setExportFormat\] = useState<'csv' \| 'pdf'>\('csv'\);\r?\n    const \[exportGenerating, setExportGenerating\] = useState\(false\);\r?\n/,
    ''
  );

  const mockMatch = c.match(
    /    \/\/ Dados mockados de pagamentos\r?\n    const mockPayments: Payment\[\] = \[[\s\S]*?    \];\r?\n\r?\n    useEffect/
  );
  if (mockMatch) {
    let mocks = mockMatch[0].replace(/    useEffect$/, '');
    mocks = mocks
      .replace(
        /    \/\/ Dados mockados de pagamentos\r?\n    const mockPayments: Payment\[\] = \[/,
        'const MOCK_PAYMENTS: Payment[] = ['
      )
      .replace(/^    /gm, '');
    c = c.replace(mockMatch[0], '    useEffect');
    c = c.replace(
      /(\}\r?\n\r?\n)(interface PaymentCategory)/,
      `$1${mocks}\n${PAYMENT_PERIODS_BLOCK}$2`
    );
  }

  c = c.replace(/mockPayments/g, 'MOCK_PAYMENTS');

  c = c.replace(
    /    const handleExportReport = \(\) => \{\r?\n        setShowExportModal\(true\);\r?\n    \};\r?\n\r?\n    const handleExportSubmit = async \(\) => \{[\s\S]*?    \};\r?\n/,
    `    const handleExportReport = async () => {
        try {
            const filename = \`relatorio-pagamentos-\${new Date().toISOString().split('T')[0]}.csv\`;
            const content = \`Relatório de Pagamentos - \${new Date().toLocaleDateString()}\\n\\n\`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('Relatório exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar relatório:', error);
            alert('Erro ao exportar relatório. Tente novamente.');
        }
    };

`
  );

  c = c.replace(
    /    const getCategoryStats = \(categoryId: string\) => \{[\s\S]*?    \};\r?\n\r?\n    const getSubcategoryStats/,
    '    const getSubcategoryStats'
  );

  c = c.replace(
    /\['diario', 'semanal', 'mensal', 'anual'\]\.map\(\(period\) => \{/g,
    'PAYMENT_PERIODS.map((period) => {'
  );
  c = c.replace(/period as any/g, 'period');

  write(rel, c);
}

function fixHotelsDebug(rel) {
  let c = read(rel);

  c = c.replace(
    /  const \[loading, setLoading\] = useState\(false\);\r?\n/,
    ''
  );

  const mockMatch = c.match(
    /  \/\/ Carregar hotéis mock na inicialização\r?\n  useEffect\(\(\) => \{\r?\n    addDebugLog\('Componente iniciado - carregando dados mock'\);\r?\n    const mockHotels: Hotel\[\] = \[[\s\S]*?    \];\r?\n    setHotels\(mockHotels\);\r?\n    addDebugLog\(`\$\{mockHotels\.length\} hotéis carregados`\);\r?\n  \}, \[\]\);\r?\n/
  );
  if (mockMatch) {
    const inner = mockMatch[0].match(/const mockHotels: Hotel\[\] = \[[\s\S]*?    \];/)[0];
    let mocks = inner
      .replace('const mockHotels: Hotel[] = [', 'const MOCK_HOTELS: Hotel[] = [')
      .replace(/^    /gm, '');
    c = c.replace(mockMatch[0], '');
    c = c.replace(
      /(const initialHotelData: Hotel = \{[\s\S]*?\};\r?\n)(\r?\nexport default function HotelsDebug)/,
      `$1\n${mocks}\n$2`
    );
    c = c.replace(
      'const [hotels, setHotels] = useState<Hotel[]>([]);',
      'const [hotels, setHotels] = useState<Hotel[]>(MOCK_HOTELS);'
    );
    c = c.replace(
      /  const \[debugLog, setDebugLog\] = useState<string\[\]>\(\[\]\);\r?\n/,
      "  const [debugLog, setDebugLog] = useState<string[]>(['Componente iniciado - dados mock carregados']);\n"
    );
  }

  c = c.replace(/: any\)/g, ': unknown)');
  c = c.replace(/err: any/g, 'err: unknown');
  c = c.replace(/error: any/g, 'error: unknown');
  c = c.replace(
    'setError(`Erro ao salvar: ${error.message}`);',
    "setError(`Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);"
  );
  c = c.replace(
    'addDebugLog(`ERRO ao abrir modal: ${err.message}`);',
    "addDebugLog(`ERRO ao abrir modal: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);"
  );
  c = c.replace(
    'addDebugLog(`ERRO ao editar: ${err.message}`);',
    "addDebugLog(`ERRO ao editar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);"
  );

  write(rel, c);
}

function fixPasseios(rel) {
  let c = read(rel);

  c = c.replace(
    "import { Budget, BudgetItem, Photo, Highlight, Benefit, AccommodationDetail, ImportantNote } from '@/lib/types/budget';",
    "import { Budget, BudgetItem } from '@/lib/types/budget';"
  );
  c = c.replace(/^import \{ getTourById \} from '@\/lib\/tours-data';\r?\n/m, '');
  c = c.replace(
    "import { getTourById } from '@/lib/tours-data';",
    "import type { Tour } from '@/lib/tours-data';"
  );
  if (!c.includes("import type { Tour }")) {
    c = c.replace(
      "import { TourSelector } from '@/components/TourSelector';",
      "import { TourSelector } from '@/components/TourSelector';\nimport type { Tour } from '@/lib/tours-data';"
    );
  }

  c = c.replace(
    '  const [selectedTour, setSelectedTour] = useState<any>(null);',
    `  interface TourSelection {
    state?: string;
    city?: string;
    tour?: Tour;
  }

  const [selectedTour, setSelectedTour] = useState<TourSelection | null>(null);`
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
        setBudget(existing);
      }
    }
  }, [router.query]);

  useEffect(() => {
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
    /  const handleTourSelect = \(selection: any\) =>/,
    '  const handleTourSelect = (selection: TourSelection) =>'
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
    '<img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover rounded-lg" />',
    `{/* eslint-disable-next-line @next/next/no-img-element -- preview URL from upload */}
                        <img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover rounded-lg" />`
  );

  if (!c.includes('Image as ImageIcon')) {
    c = c.replace(/\bImage,/g, 'Image as ImageIcon,');
  }

  write(rel, c);
}

fixPagamentos('pages/pagamentos.tsx');
fixHotelsDebug('pages/hotels-debug.tsx');
fixPasseios('pages/cotacoes/passeios.tsx');
