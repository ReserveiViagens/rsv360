const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../pages/voucher-editor.tsx');
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

/** Remove text from startMarker through the character before keepMarker. */
function cutUntil(startMarker, keepMarker) {
  const start = content.indexOf(startMarker);
  if (start === -1) throw new Error(`Start not found: ${JSON.stringify(startMarker.slice(0, 80))}`);
  const keep = content.indexOf(keepMarker, start + startMarker.length);
  if (keep === -1) throw new Error(`Keep not found after: ${JSON.stringify(startMarker.slice(0, 80))}`);
  console.log(`Removed ${keep - start} chars (${startMarker.slice(0, 40).replace(/\n/g, '\\n')}...)`);
  content = content.slice(0, start) + content.slice(keep);
}

cutUntil('interface VoucherData {\n', '// ===== Stable, top-level helper inputs');
cutUntil(
  '  const [selectedElement, setSelectedElement] = useState<VoucherElement | null>(null);\n',
  '  const [showHeaderEditor, setShowHeaderEditor] = useState(false);'
);
cutUntil(
  '  // Handlers específicos para campos do Header - memoizados para evitar perda de foco\n',
  '  const handleHeaderLinkAdd = () => {'
);
cutUntil(
  '  // Handlers específicos para campos do Body - memoizados para evitar perda de foco\n',
  '  const handleBenefitAdd = () => {'
);
cutUntil(
  '  // Handlers específicos para campos do Footer - memoizados para evitar perda de foco\n',
  '  const handleSocialMediaAdd = () => {'
);
cutUntil(
  '  const handleTemplateSelect = (template: VoucherTemplate) => {\n',
  '  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {'
);
cutUntil(
  '  const handleElementEdit = (element: VoucherElement) => {\n',
  '  const handleSaveVoucher = () => {'
);
cutUntil(
  '  // Componente helper memoizado para inputs de links\n  const LinkInput = React.memo',
  '  // Componente para gerar QR Code\n  const QRCodeGenerator = () => ('
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done. Lines:', content.split('\n').length);
