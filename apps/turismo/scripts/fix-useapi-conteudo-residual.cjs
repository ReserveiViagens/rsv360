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

function fixConteudo(rel) {
  let c = read(rel);

  c = c.replace(/^import React, \{ useState, useEffect \} from 'react';/m, "import React, { useState } from 'react';");
  c = c.replace(
    /  Image, \r?\n/,
    '  Image as ImageIcon,\n'
  );
  c = c.replace('const { user } = useAuth();', 'const { user: _user } = useAuth();');
  c = c.replace(
    /  const \[activeTab, setActiveTab\] = useState\('overview'\);\r?\n/,
    ''
  );
  c = c.replace(
    'const [selectedItem, setSelectedItem] = useState<any>(null);',
    'const [selectedItem, setSelectedItem] = useState<Content | Category | Language | null>(null);'
  );
  c = c.replace(
    /  const \[showDetails, setShowDetails\] = useState\(false\);\r?\n/,
    ''
  );
  c = c.replace(
    /  const \[showContentManager, setShowContentManager\] = useState\(false\);\r?\n/,
    ''
  );
  c = c.replace(
    'const [importPreview, setImportPreview] = useState<any>(null);',
    `interface ImportPreview {
    fileName: string;
    fileSize: string;
    format?: string;
    records: number;
    lastModified: string;
  }

  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);`
  );
  c = c.replace('const [exportHistory, setExportHistory] = useState<any[]>([]);', 'const [exportHistory, setExportHistory] = useState<Record<string, unknown>[]>([]);');
  c = c.replace('const [importHistory, setImportHistory] = useState<any[]>([]);', 'const [importHistory, setImportHistory] = useState<Record<string, unknown>[]>([]);');

  c = c.replace(
    /\r?\n  const handleBackToDashboard = \(\) => \{\r?\n    router\.push\('\/dashboard'\);\r?\n  \};\r?\n/,
    '\n'
  );
  c = c.replace(
    /\r?\n  const handleExportDataSimple = \(\) => \{[\s\S]*?  \};\r?\n\r?\n  const handleImportDataSimple/,
    '\n\n  const handleImportDataSimple'
  );
  c = c.replace(
    /\r?\n  const handleImportDataSimple = \(\) => \{[\s\S]*?  \};\r?\n\r?\n  const handleExportFormChange/,
    '\n\n  const handleExportFormChange'
  );

  c = c.replace(
    'const handleExportFormChange = (field: string, value: any) =>',
    'const handleExportFormChange = (field: string, value: unknown) =>'
  );
  c = c.replace(
    'const handleImportFormChange = (field: string, value: any) =>',
    'const handleImportFormChange = (field: string, value: unknown) =>'
  );
  c = c.replace(
    "case 'image': return <Image className=\"w-5 h-5\" />;",
    "case 'image': return <ImageIcon className=\"w-5 h-5\" aria-hidden />;"
  );

  write(rel, c);
}

fixConteudo('pages/conteudo.tsx');
fixConteudo('src/pages/conteudo.tsx');
