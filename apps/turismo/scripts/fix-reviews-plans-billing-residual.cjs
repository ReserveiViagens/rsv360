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

function fixModalAndStatus(file, entity, setter) {
  let c = read(file);
  c = c.replace(
    /  const \[showModal, setShowModal\] = useState\(false\);\r?\n  const \[showCreateModal, setShowCreateModal\] = useState\(false\);\r?\n/,
    '  const [showModal, setShowModal] = useState(false);\r\n'
  );
  c = c.replace(/setShowCreateModal/g, 'setShowModal');
  c = c.replace(
    new RegExp(
      `\\r?\\n  const handleStatusChange = \\(${entity}Id: string, newStatus: ${entity}\\['status'\\]\\) => \\{\\r?\\n    ${setter}\\(prev => prev\\.map\\([a-z] => \\r?\\n      [a-z]\\.id === ${entity}Id \\? \\{ \\.\\.\\.[a-z], status: newStatus \\} : [a-z]\\r?\\n    \\)\\);\\r?\\n  \\};\\r?\\n`,
      'g'
    ),
    '\r\n'
  );
  write(file, c);
}

// pages/plans.tsx
{
  let c = read('pages/plans.tsx');
  c = c.replace(
    /  const \[showModal, setShowModal\] = useState\(false\);\r?\n  const \[showCreateModal, setShowCreateModal\] = useState\(false\);\r?\n/,
    '  const [showModal, setShowModal] = useState(false);\r\n'
  );
  c = c.replace(/setShowCreateModal/g, 'setShowModal');
  c = c.replace(
    /\r?\n  const priorityColors = \{\r?\n    low: 'bg-gray-100 text-gray-800',\r?\n    medium: 'bg-yellow-100 text-yellow-800',\r?\n    high: 'bg-red-100 text-red-800'\r?\n  \};\r?\n/,
    '\r\n'
  );
  c = c.replace(
    /\r?\n  const handleStatusChange = \(planId: string, newStatus: Plan\['status'\]\) => \{\r?\n    setPlans\(prev => prev\.map\(p => \r?\n      p\.id === planId \? \{ \.\.\.p, status: newStatus \} : p\r?\n    \)\);\r?\n  \};\r?\n/,
    '\r\n'
  );
  c = c.replace(
    '  const [plans, setPlans] = useState<Plan[]>([',
    '  const [plans] = useState<Plan[]>(['
  );
  write('pages/plans.tsx', c);
}

for (const file of ['pages/billing.tsx', 'src/pages/billing.tsx']) {
  let c = read(file);
  c = c.replace(
    /  const \[showModal, setShowModal\] = useState\(false\);\r?\n  const \[showCreateModal, setShowCreateModal\] = useState\(false\);\r?\n/,
    '  const [showModal, setShowModal] = useState(false);\r\n'
  );
  c = c.replace(/setShowCreateModal/g, 'setShowModal');
  c = c.replace(
    /\r?\n  const handleStatusChange = \(billingId: string, newStatus: Billing\['status'\]\) => \{\r?\n    setBillings\(prev => prev\.map\(b => \r?\n      b\.id === billingId \? \{ \.\.\.b, status: newStatus \} : b\r?\n    \)\);\r?\n  \};\r?\n/,
    '\r\n'
  );
  c = c.replace(
    '  const [billings, setBillings] = useState<Billing[]>([',
    '  const [billings] = useState<Billing[]>(['
  );
  write(file, c);
}

// pages/reviews.tsx
{
  let c = read('pages/reviews.tsx');
  c = c.replace(/  const \{ user \} = useAuth\(\);\r?\n  const router = useRouter\(\);\r?\n/, '');
  c = c.replace(/  const \[isLoading, setIsLoading\] = useState\(false\);\r?\n/, '');
  c = c.replace('const handleCardClick = (cardId: string)', 'const handleCardClick = (_cardId: string)');
  c = c.replace('const handleQuickAction = (action: string)', 'const handleQuickAction = (_action: string)');
  write('pages/reviews.tsx', c);
}
