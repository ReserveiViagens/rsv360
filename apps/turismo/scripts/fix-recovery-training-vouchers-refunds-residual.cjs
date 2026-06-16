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

// src/pages/refunds.tsx — espelha pages/refunds (#397)
{
  let c = read('src/pages/refunds.tsx');
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
  write('src/pages/refunds.tsx', c);
}

// RecoveryTesting.tsx — espelha DisasterRecovery residual
{
  let c = read('src/components/backup/RecoveryTesting.tsx');
  c = c.replace(/^import \{ Input \} from '@\/components\/ui\/Input'\r?\n/m, '');
  c = c.replace(/^import \{ Select \} from '@\/components\/ui\/Select'\r?\n/m, '');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  LineChart, \r?\n/m, '');
  c = c.replace(
    /  Pie,\r?\n  RadialBarChart,\r?\n  RadialBar,\r?\n  ScatterChart,\r?\n  Scatter,\r?\n  ComposedChart,\r?\n  RechartsTooltip\r?\n\} from 'recharts'/,
    "  Pie,\r\n  ComposedChart\r\n} from 'recharts'"
  );
  c = c.replace(
    /  const \[selectedTest, setSelectedTest\] = useState<RecoveryTest \| null>\(null\)\r?\n/,
    ''
  );
  c = c.replace(
    /  const \[isRunningTest, setIsRunningTest\] = useState\(false\)\r?\n/,
    ''
  );
  write('src/components/backup/RecoveryTesting.tsx', c);
}

// src/pages/vouchers.tsx
{
  let c = read('src/pages/vouchers.tsx');
  c = c.replace(/  const router = useRouter\(\);\r?\n/, '');
  c = c.replace(/  const \[loading, setLoading\] = useState\(false\);\r?\n/, '');
  c = c.replace(
    '  Globe2\n} from \'lucide-react\';',
    "  Globe2,\n  CreditCard\n} from 'lucide-react';"
  );
  c = c.replace(
    /  useEffect\(\(\) => \{\r?\n    setVouchers\(mockVouchers\);\r?\n    calcularEstatisticas\(mockVouchers\);\r?\n  \}, \[\]\);\r?\n\r?\n  const calcularEstatisticas = \(vouchersList: Voucher\[\]\) => \{/,
    `  const calcularEstatisticas = (vouchersList: Voucher[]) => {`
  );
  c = c.replace(
    /(\n  \};\r?\n\r?\n  const generateId)/,
    `$1`
  );
  // Re-insert effect after calcularEstatisticas closes - find closing of calcularEstatisticas
  c = c.replace(
    /(    setStats\(\{[\s\S]*?\}\);\r?\n  \};\r?\n)(\r?\n  const generateId)/,
    `$1\r\n  // eslint-disable-next-line react-hooks/set-state-in-effect -- mock bootstrap\r\n  useEffect(() => {\r\n    setVouchers(mockVouchers);\r\n    calcularEstatisticas(mockVouchers);\r\n  }, []);\r\n$2`
  );
  c = c.replace(
    'const importedArray: any[] = Array.isArray(parsed)',
    `const importedArray: unknown[] = Array.isArray(parsed)`
  );
  c = c.replace(
    ": Array.isArray(parsed?.vouchers)\n          ? parsed.vouchers",
    ": Array.isArray((parsed as { vouchers?: unknown[] })?.vouchers)\n          ? (parsed as { vouchers: unknown[] }).vouchers"
  );
  c = c.replace(
    'const normalized: Voucher[] = importedArray.map((item, index) => ({',
    'const normalized: Voucher[] = importedArray.map((raw, index) => {\n        const item = raw as Record<string, unknown>;\n        return ({'
  );
  c = c.replace(
    /        categoria: item\.categoria \|\| 'hotel'\r?\n      \}\)\);/,
    "        categoria: (item.categoria as Voucher['categoria']) || 'hotel'\n      });});"
  );
  c = c.replace(
    '} catch (error: any) {\n      setImportStatus({ type: \'error\', message: `Falha ao importar vouchers: ${error.message || \'Erro desconhecido.\'}` });',
    "} catch (error: unknown) {\n      const message = error instanceof Error ? error.message : 'Erro desconhecido.';\n      setImportStatus({ type: 'error', message: `Falha ao importar vouchers: ${message}` });"
  );
  c = c.replace(
    '    let aValue: any, bValue: any;',
    '    let aValue: string | number | Date;\n    let bValue: string | number | Date;'
  );
  c = c.replace(
    '<img src={qrUrl}',
    '{/* eslint-disable-next-line @next/next/no-img-element -- external QR API */}\n                            <img src={qrUrl}'
  );
  write('src/pages/vouchers.tsx', c);
}
