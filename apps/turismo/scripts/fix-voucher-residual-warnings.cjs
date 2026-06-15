const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../pages/voucher-editor.tsx');
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

const templatesStart = '  // Templates pré-definidos\n  const defaultTemplates: VoucherTemplate[] = [';
const templatesEnd =
  '  ];\n\n  useEffect(() => {\n    // Carregar template padrão\n    setSelectedTemplate(defaultTemplates[0]);\n  }, []);\n\n';

const start = content.indexOf(templatesStart);
const end = content.indexOf(templatesEnd, start);
if (start === -1 || end === -1) throw new Error('templates block not found');

const arrayBody = content.slice(
  start + '  // Templates pré-definidos\n  const defaultTemplates: VoucherTemplate[] = '.length,
  end
);
const hoisted = `const VOUCHER_DEFAULT_TEMPLATES: VoucherTemplate[] = [${arrayBody}];\n\n`;

const insertAt = content.indexOf('function QRCodeGeneratorPanel');
content =
  content.slice(0, start) + content.slice(end + templatesEnd.length);
content = content.slice(0, insertAt) + hoisted + content.slice(insertAt);

content = content.replace(
  'const [selectedTemplate, setSelectedTemplate] = useState<VoucherTemplate | null>(null);',
  'const [selectedTemplate, setSelectedTemplate] = useState<VoucherTemplate | null>(() => VOUCHER_DEFAULT_TEMPLATES[0]);'
);

const lsEffect =
  '  // Carregar dados salvos do localStorage ao montar o componente\n  useEffect(() => {\n    try {\n      const savedData = localStorage.getItem(\'voucher-editor-data\');\n      if (savedData) {\n        const parsed = JSON.parse(savedData);\n        if (parsed.header) {\n          setHeaderData(parsed.header);\n        }\n        if (parsed.body) {\n          setBodyData(parsed.body);\n        }\n        if (parsed.footer) {\n          setFooterData(parsed.footer);\n        }\n      }\n    } catch (error) {\n      console.error(\'Erro ao carregar dados salvos:\', error);\n    }\n  }, []);\n\n';
content = content.replace(lsEffect, '');

content = content.replace(
  '  const [headerData, setHeaderData] = useState<VoucherHeader>({',
  '  const [headerData, setHeaderData] = useState<VoucherHeader>(() => ({'
);
content = content.replace(
  `        isActive: true
      }
    ]
  });

  // Estados para Body
  const [bodyData, setBodyData] = useState<VoucherBody>({`,
  `        isActive: true
      }
    ],
    ...loadPersistedVoucherSection('header'),
  }));

  // Estados para Body
  const [bodyData, setBodyData] = useState<VoucherBody>(() => ({`
);

content = content.replace(
  `    shadowOffsetX: 0,
    shadowOffsetY: 4
  });

  // Estados para Footer
  const [footerData, setFooterData] = useState<VoucherFooter>({`,
  `    shadowOffsetX: 0,
    shadowOffsetY: 4,
    ...loadPersistedVoucherSection('body'),
  }));

  // Estados para Footer
  const [footerData, setFooterData] = useState<VoucherFooter>(() => ({`
);

content = content.replace(
  `    borderTopWidth: 1,
    borderTopStyle: 'solid'
  });

  // Funções para Header`,
  `    borderTopWidth: 1,
    borderTopStyle: 'solid',
    ...loadPersistedVoucherSection('footer'),
  }));

  // Funções para Header`
);

const qrStart = '  // Componente para gerar QR Code\n  const QRCodeGenerator = () => (';
const qrEnd = '  return (\n    <div className="min-h-screen bg-gray-50">';
const qrS = content.indexOf(qrStart);
const qrE = content.indexOf(qrEnd, qrS);
if (qrS === -1 || qrE === -1) throw new Error('QRCodeGenerator block not found');
content = content.slice(0, qrS) + content.slice(qrE);

content = content.replace(
  '<QRCodeGenerator />',
  `<QRCodeGeneratorPanel
              qrCodeData={qrCodeData}
              onQrCodeDataChange={setQrCodeData}
              qrCodeSize={qrCodeSize}
              onQrCodeSizeChange={setQrCodeSize}
              qrCodeErrorLevel={qrCodeErrorLevel}
              onQrCodeErrorLevelChange={setQrCodeErrorLevel}
              qrCodeColor={qrCodeColor}
              onQrCodeColorChange={setQrCodeColor}
              qrCodeBgColor={qrCodeBgColor}
              onQrCodeBgColorChange={setQrCodeBgColor}
              qrCodeUrl={qrCodeUrl}
              onClose={() => setShowQrCodeModal(false)}
              onGenerate={handleGenerateQRCode}
              onDownload={handleDownloadQRCode}
              onCopy={handleCopyQRCode}
              onAddToVoucher={handleAddQRCodeToVoucher}
            />`
);

content = content.replace(
  'onUpdate(social.id, { platform: e.target.value as any });',
  "onUpdate(social.id, { platform: e.target.value as SocialMedia['platform'] });"
);

content = content.replace(
  `<img
                          src={headerData.logo}
                          alt="Logo da Empresa"
                          className="object-contain max-w-full max-h-32 rounded-lg border border-gray-200"
                          style={{ width: '120px', height: '120px' }}
                        />`,
  `<Image
                          src={headerData.logo}
                          alt="Logo da Empresa"
                          width={120}
                          height={120}
                          unoptimized
                          className="object-contain max-w-full max-h-32 rounded-lg border border-gray-200"
                        />`
);

content = content.replace(
  `<img
                          src={headerData.logo}
                          alt="Logo da Empresa"
                          className="object-contain max-w-full max-h-20 rounded-lg"
                          style={{ width: '80px', height: '80px' }}
                        />`,
  `<Image
                          src={headerData.logo}
                          alt="Logo da Empresa"
                          width={80}
                          height={80}
                          unoptimized
                          className="object-contain max-w-full max-h-20 rounded-lg"
                        />`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done');
