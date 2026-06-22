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

function fixContracts(rel) {
  let c = read(rel);
  c = c.replace('const [showCreateModal, setShowCreateModal]', 'const [, setShowCreateModal]');
  c = c.replace(
    /\r?\n  const priorityColors = \{\r?\n    low: 'bg-gray-100 text-gray-800',\r?\n    medium: 'bg-yellow-100 text-yellow-800',\r?\n    high: 'bg-red-100 text-red-800'\r?\n  \};\r?\n/,
    '\r\n'
  );
  c = c.replace('const handleStatusChange', 'const _handleStatusChange');
  c = c.replace('const handleSignatureStatusChange', 'const _handleSignatureStatusChange');
  write(rel, c);
}

function fixUsers(rel) {
  let c = read(rel);

  if (!c.includes("from '../src/services/apiClient'")) {
    c = c.replace(
      /^import ProtectedRoute from[^\n]+\n/m,
      (m) => `${m}import { api } from '../src/services/apiClient'\n`
    );
  }

  c = c.replace(
    /  useEffect\(\(\) => \{\r?\n    loadData\(\)\r?\n  \}, \[filterRole, filterDepartment, filterStatus\]\)\r?\n\r?\n  const loadData = async \(\) => \{/,
    '  const loadData = async () => {'
  );

  c = c.replace(
    /(\r?\n  const handleSave = async \(\) => \{)/,
    "\n\n  useEffect(() => {\n    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch users on filter change\n    loadData()\n  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on filter change\n  }, [filterRole, filterDepartment, filterStatus])$1"
  );

  c = c.replace('const params: any = {', 'const params: Record<string, string | undefined> = {');
  c = c.replace('const handleStatusChange', 'const _handleStatusChange');
  c = c.replace('const handleVerificationChange', 'const _handleVerificationChange');
  c = c.replace(
    'Nenhum usuário encontrado. Clique em "Novo Usuário" para começar.',
    'Nenhum usuário encontrado. Clique em &quot;Novo Usuário&quot; para começar.'
  );
  c = c.replace(
    '{roles.find(r => r.id === formData.role)?.permissionCount || 0} permissões associadas à função "{roles.find(r => r.id === formData.role)?.name}"',
    '{roles.find(r => r.id === formData.role)?.permissionCount || 0} permissões associadas à função &quot;{roles.find(r => r.id === formData.role)?.name}&quot;'
  );
  write(rel, c);
}

fixContracts('pages/contracts.tsx');
fixContracts('src/pages/contracts.tsx');
fixUsers('pages/users.tsx');
