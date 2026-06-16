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

function fixHotels(rel) {
  let c = read(rel);

  const mockMatch = c.match(
    /  \/\/ Dados mockados para hotéis\r?\n  const mockHotels: Hotel\[\] = \[[\s\S]*?  \];\r?\n\r?\n  useEffect/
  );
  if (mockMatch) {
    let mocks = mockMatch[0].replace(/  useEffect$/, '');
    mocks = mocks
      .replace(
        /  \/\/ Dados mockados para hotéis\r?\n  const mockHotels: Hotel\[\] = \[/,
        'const MOCK_HOTELS: Hotel[] = ['
      )
      .replace(/^  /gm, '');
    c = c.replace(mockMatch[0], '  useEffect');
    c = c.replace(
      /(\}\r?\n\r?\nexport default function Hotels\(\))/,
      `}\n\n${mocks}\nexport default function Hotels()`
    );
  }

  c = c.replace(/mockHotels/g, 'MOCK_HOTELS');

  c = c.replace(
    /\r?\n  const getStatisticLabel = \(type: string\) => \{[\s\S]*?  \};\r?\n\r?\n  const filteredHotels/,
    '\r\n\r\n  const filteredHotels'
  );

  write(rel, c);
}

function fixUsers(rel) {
  let c = read(rel);

  if (c.includes('useEffect(() => {\n        setUsers(MOCK_USERS)')) {
    c = c.replace(/^import React, \{ useState, useEffect \} from 'react';/m, "import React, { useState } from 'react';");
    c = c.replace(
      /export default function UsersPage\(\) \{\r?\n    const \[users, setUsers\] = useState<User\[\]>\(\[\]\);\r?\n    const \[roles, setRoles\] = useState<Role\[\]>\(\[\]\);\r?\n    const \[departments, setDepartments\] = useState<Department\[\]>\(\[\]\);\r?\n    const MOCK_USERS/,
      'const MOCK_USERS'
    );
    c = c.replace(
      /\r?\n    useEffect\(\(\) => \{[\s\S]*?    \}, \[\]\);\r?\n\r?\n\r?\n    const getRoleByName/,
      '\n\nexport default function UsersPage() {\n    const [users] = useState<User[]>(MOCK_USERS);\n    const [roles] = useState<Role[]>(MOCK_ROLES);\n    const [departments] = useState<Department[]>(MOCK_DEPARTMENTS);\n\n    const getRoleByName'
    );
  }

  write(rel, c);
}

fixHotels('pages/hotels.tsx');
fixHotels('src/pages/hotels.tsx');
fixUsers('src/pages/users.tsx');
