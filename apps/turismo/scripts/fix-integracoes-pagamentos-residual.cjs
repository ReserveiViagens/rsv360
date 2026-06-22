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

function fixIntegracoesAutomacao(rel) {
  let c = read(rel);

  c = c.replace(
    /^import React, \{ useState, useEffect \} from 'react';/m,
    "import React, { useState } from 'react';"
  );
  c = c.replace(/^import \{ Input \} from '@\/components\/ui\/Input';\r?\n/m, '');
  c = c.replace(/^import \{ Label \} from '@\/components\/ui\/Label';\r?\n/m, '');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea';\r?\n/m, '');
  c = c.replace(/^import \{ Switch \} from '@\/components\/ui\/Switch';\r?\n/m, '');

  c = c.replace(
    /  const \[selectedTemplate, setSelectedTemplate\] = useState<AutomationTemplate \| null>\(null\);\r?\n/,
    ''
  );
  c = c.replace(
    /  const \[isCreating, setIsCreating\] = useState\(false\);\r?\n/,
    '  const [, setIsCreating] = useState(false);\n'
  );
  c = c.replace(
    /  const \[filterCategory, setFilterCategory\] = useState\('all'\);\r?\n/,
    ''
  );

  c = c.replace(/Record<string, any>/g, 'Record<string, unknown>');
  c = c.replace(/value: any;/g, 'value: unknown;');
  c = c.replace(
    /interface AutomationTemplate \{[\s\S]*?  category: 'booking' \| 'customer' \| 'payment' \| 'marketing' \| 'support';[\s\S]*?  popularity: number;\r?\n  trigger: any;\r?\n  conditions: any\[\];\r?\n  actions: any\[\];/,
    `interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'booking' | 'customer' | 'payment' | 'marketing' | 'support';
  popularity: number;
  trigger: AutomationRule['trigger'];
  conditions: AutomationRule['conditions'];
  actions: AutomationRule['actions'];`
  );

  c = c.replace(
    'id: Date.now().toString(),',
    "id: `rule-${template.id}-${rules.length + 1}`,"
  );

  write(rel, c);
}

function fixPagamentos(rel) {
  let c = read(rel);

  c = c.replace(/^import NavigationButtons from[^\n]+\n/m, '');

  c = c.replace('const [showNewPaymentModal, setShowNewPaymentModal]', 'const [, setShowNewPaymentModal]');
  c = c.replace('const [showEditPaymentModal, setShowEditPaymentModal]', 'const [, setShowEditPaymentModal]');
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
        '    // Dados mockados de pagamentos\n    const mockPayments: Payment[] = [',
        'const MOCK_PAYMENTS: Payment[] = ['
      )
      .replace(/^    /gm, '');
    c = c.replace(mockMatch[0], '    useEffect');
    c = c.replace(
      'interface PaymentCategory {',
      `${mocks}\n${PAYMENT_PERIODS_BLOCK}\ninterface PaymentCategory {`
    );
  }

  c = c.replace(/mockPayments/g, 'MOCK_PAYMENTS');

  c = c.replace(
    '        loadPayments();\n    }, []);',
    "        loadPayments();\n    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only mock load\n    }, []);"
  );

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

function fixIntegracoesServicos(rel) {
  let c = read(rel);

  c = c.replace(
    /^import React, \{ useState, useEffect \} from 'react';/m,
    "import React, { useState } from 'react';"
  );
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea';\r?\n/m, '');
  c = c.replace(/^import \{ Switch \} from '@\/components\/ui\/Switch';\r?\n/m, '');

  c = c.replace(
    /  const \[showCredentials, setShowCredentials\] = useState\(false\);\r?\n/,
    ''
  );

  c = c.replace(/Record<string, any>/g, 'Record<string, unknown>');
  c = c.replace(
    'category: selectedTemplate.category as any,',
    "category: selectedTemplate.category as ExternalService['category'],"
  );
  c = c.replace('(configData: Record<string, any>)', '(configData: Record<string, unknown>)');
  c = c.replace('} catch (error) {', '} catch (_error) {');

  c = c.replace(
    /  const getUsageColor = \(percentage: number\) => \{[\s\S]*?  \};\r?\n\r?\n  const getTotalMonthlyCost/,
    '  const getTotalMonthlyCost'
  );

  write(rel, c);
}

fixIntegracoesAutomacao('src/pages/integracoes-automacao.tsx');
fixPagamentos('src/pages/pagamentos.tsx');
fixIntegracoesServicos('src/pages/integracoes-servicos.tsx');
