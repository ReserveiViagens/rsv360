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

function fixSidebar(rel) {
  let c = read(rel);
  c = c.replace(
    /import Link from 'next\/link';\r?\nimport \{\r?\n  AnimatePresence \} from 'framer-motion';/,
    `import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';`
  );
  c = c.replace(/^  Menu,\r?\n/m, '');
  write(rel, c);
}

function fixCustomersRsv(rel) {
  let c = read(rel);

  c = c.replace(
    /^import React, \{ useState, useEffect \} from 'react';\r?\nimport \{/m,
    `import React, { useState, useMemo } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Link from 'next/link';
import {
  Plus,`
  );

  const mockMatch = c.match(
    /  \/\/ Dados simulados - em produção viriam da API\r?\n  useEffect\(\(\) => \{\r?\n    const mockCustomers: Customer\[\] = (\[[\s\S]*?\]);\r?\n\r?\n    setCustomers\(mockCustomers\);\r?\n    setFilteredCustomers\(mockCustomers\);\r?\n  \}, \[\]\);\r?\n/
  );
  if (!mockMatch) throw new Error('mockCustomers block not found');
  const mockArray = mockMatch[1];
  const mockConst = `const MOCK_CUSTOMERS: Customer[] = ${mockArray};\n\n`;
  c = c.replace(mockMatch[0], '');

  c = c.replace(
    /export default function CustomersRSV\(\) \{\r?\n  const \{ user \} = useAuth\(\);\r?\n  const router = useRouter\(\);\r?\n  const \[customers, setCustomers\] = useState<Customer\[\]>\(\[\]\);\r?\n  const \[filteredCustomers, setFilteredCustomers\] = useState<Customer\[\]>\(\[\]\);/,
    `export default function CustomersRSV() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);`
  );

  c = c.replace(
    /  \/\/ Filtros e busca\r?\n  useEffect\(\(\) => \{\r?\n    const filtered = customers\.filter\(customer => \{[\s\S]*?    setFilteredCustomers\(filtered\);\r?\n  \}, \[customers, searchTerm, statusFilter, sortBy, sortOrder\]\);\r?\n/,
    `  const filteredCustomers = useMemo(() => {
    const filtered = customers.filter(customer => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      let aValue = a[sortBy as keyof Customer];
      let bValue = b[sortBy as keyof Customer];

      if (sortBy === 'totalSpent' || sortBy === 'totalBookings') {
        const aNum = Number(aValue) || 0;
        const bNum = Number(bValue) || 0;
        return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
      }

      const aStr = String(aValue ?? '').toLowerCase();
      const bStr = String(bValue ?? '').toLowerCase();
      if (sortOrder === 'asc') {
        return aStr > bStr ? 1 : -1;
      }
      return aStr < bStr ? 1 : -1;
    });
  }, [customers, searchTerm, statusFilter, sortBy, sortOrder]);

`
  );

  c = c.replace(
    /(interface CustomerStats \{[\s\S]*?\}\r?\n\r?\n)/,
    `$1${mockConst}`
  );

  write(rel, c);
}

function fixNotificationsPage(rel) {
  let c = read(rel);
  c = c.replace(/^import \{ Badge \} from '\.\.\/components\/ui\/Badge'\r?\n/m, '');
  c = c.replace(
    '  const [quickStats, setQuickStats] = useState({',
    '  const [quickStats] = useState({'
  );
  c = c.replace(
    /const handleNotificationSent = \(notification: any\)/,
    'const handleNotificationSent = (_notification: unknown)'
  );
  c = c.replace(
    /const handleCampaignCreated = \(campaign: any\)/,
    'const handleCampaignCreated = (_campaign: unknown)'
  );
  c = c.replace(
    /const handleTemplateCreated = \(template: any\)/,
    'const handleTemplateCreated = (_template: unknown)'
  );
  c = c.replace(
    /const handleListCreated = \(list: any\)/,
    'const handleListCreated = (_list: unknown)'
  );
  c = c.replace(
    /const handleMessageSent = \(message: any\)/,
    'const handleMessageSent = (_message: unknown)'
  );
  c = c.replace(
    /const handleAgentAssigned = \(conversationId: string, agentId: string\)/,
    'const handleAgentAssigned = (_conversationId: string, _agentId: string)'
  );
  c = c.replace(
    /const handleBroadcastCreated = \(broadcast: any\)/,
    'const handleBroadcastCreated = (_broadcast: unknown)'
  );
  c = c.replace(
    /const handleSegmentCreated = \(segment: any\)/,
    'const handleSegmentCreated = (_segment: unknown)'
  );
  c = c.replace(
    'Campanha de email "Promoção de Verão" criada',
    'Campanha de email &quot;Promoção de Verão&quot; criada'
  );
  write(rel, c);
}

fixSidebar('src/components/layout/Sidebar.tsx');
fixCustomersRsv('pages/customers-rsv.tsx');
fixNotificationsPage('src/pages/NotificationsPage.tsx');
