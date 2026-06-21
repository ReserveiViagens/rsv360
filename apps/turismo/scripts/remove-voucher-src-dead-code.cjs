const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/voucher-editor.tsx');
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

function cutUntil(startMarker, keepMarker) {
  const start = content.indexOf(startMarker);
  if (start === -1) return false;
  const keep = content.indexOf(keepMarker, start + startMarker.length);
  if (keep === -1) throw new Error(`Keep not found after: ${startMarker.slice(0, 60)}`);
  content = content.slice(0, start) + content.slice(keep);
  console.log(`Removed block before ${keepMarker.slice(0, 40)}`);
  return true;
}

cutUntil('interface VoucherData {\n', '// ===== Stable');
cutUntil('interface VoucherData {\n', 'interface VoucherElement');
cutUntil(
  '  const [voucherData, setVoucherData] = useState<VoucherData | null>(null);\n',
  '  const [selectedTemplate, setSelectedTemplate]'
);
cutUntil(
  '  const [showLogoUpload, setShowLogoUpload] = useState(false);\n',
  '  const [selectedElement, setSelectedElement]'
);
cutUntil(
  '  const [editMode, setEditMode] = useState',
  '  const [showHeaderEditor, setShowHeaderEditor]'
);
cutUntil(
  '  const [activeSection, setActiveSection] = useState',
  '  const [showHeaderEditor, setShowHeaderEditor]'
);
cutUntil(
  '  const [showLinksEditor, setShowLinksEditor] = useState(false);\n',
  '  const [headerSaved, setHeaderSaved]'
);
cutUntil(
  '  const handleTemplateSelect = (template: VoucherTemplate) => {\n',
  '  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {'
);
cutUntil(
  '  const handleElementEdit = (element: VoucherElement) => {\n',
  '  const handleElementUpdate = (updatedElement: VoucherElement) => {'
);
cutUntil(
  '  const handleElementUpdate = (updatedElement: VoucherElement) => {\n',
  '  const handleSaveVoucher = () => {'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done src. Lines:', content.split('\n').length);
