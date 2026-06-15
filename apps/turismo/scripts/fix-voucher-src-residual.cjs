const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/voucher-editor.tsx');
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

if (!content.includes('import Image from')) {
  content = content.replace(
    "import React, { useState, useEffect, useRef, useCallback } from 'react';",
    "import React, { useState, useRef, useCallback } from 'react';\nimport Image from 'next/image';"
  );
}

const templatesStart = '  const defaultTemplates: VoucherTemplate[] = [';
const templatesEnd =
  '  ];\n\n  useEffect(() => {\n    // Carregar template padrão\n    setSelectedTemplate(defaultTemplates[0]);\n  }, []);\n\n';

const start = content.indexOf(templatesStart);
const end = content.indexOf(templatesEnd, start);
if (start === -1 || end === -1) throw new Error('templates block not found');

const arrayBody = content.slice(start + templatesStart.length, end);
const hoisted = `\nconst VOUCHER_DEFAULT_TEMPLATES: VoucherTemplate[] = [${arrayBody}];\n`;

const insertAt = content.indexOf('export default function VoucherEditor()');
content = content.slice(0, start) + content.slice(end + templatesEnd.length);
content = content.slice(0, insertAt) + hoisted + content.slice(insertAt);

content = content.replace(
  'const [selectedTemplate, setSelectedTemplate] = useState<VoucherTemplate | null>(null);',
  'const [selectedTemplate, setSelectedTemplate] = useState<VoucherTemplate | null>(() => VOUCHER_DEFAULT_TEMPLATES[0]);'
);

content = content.replace(
  'onChange={(e) => handleSocialMediaUpdate(social.id, { platform: e.target.value as any })}',
  "onChange={(e) => handleSocialMediaUpdate(social.id, { platform: e.target.value as SocialMedia['platform'] })}"
);

content = content.replace(
  'onChange={(e) => setQrCodeErrorLevel(e.target.value as any)}',
  "onChange={(e) => setQrCodeErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}"
);

content = content.replace(
  `<img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="border border-gray-300 rounded-lg"
              />`,
  `<Image
                src={qrCodeUrl}
                alt="QR Code"
                width={200}
                height={200}
                unoptimized
                className="border border-gray-300 rounded-lg"
              />`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done src');
