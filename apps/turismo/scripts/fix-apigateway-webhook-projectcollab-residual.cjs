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

// APIGateway.tsx
{
  let c = read('src/components/integrations/APIGateway.tsx');
  c = c.replace(/^import \{ Input \} from '@\/components\/ui\/Input'\r?\n/m, '');
  c = c.replace(/^import \{ Select \} from '@\/components\/ui\/Select'\r?\n/m, '');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  AreaChart, \r?\n/m, '');
  c = c.replace(/^  Area, \r?\n/m, '');
  c = c.replace(/^  RadialBarChart,\r?\n/m, '');
  c = c.replace(/^  RadialBar\r?\n/m, '');
  c = c.replace(
    /  PieChart, \r?\n  Cell,\r?\n\} from 'recharts'/,
    "  PieChart,\n  Pie,\n  Cell\n} from 'recharts'"
  );
  c = c.replace(
    /interface APIRoute \{[\s\S]*?\}\r?\n\r?\ninterface ExternalService/,
    'interface ExternalService'
  );
  c = c.replace(
    /  const \[selectedEndpoint, setSelectedEndpoint\] = useState<APIEndpoint \| null>\(null\)\r?\n/,
    ''
  );
  write('src/components/integrations/APIGateway.tsx', c);
}

// WebhookManager.tsx
{
  let c = read('src/components/integrations/WebhookManager.tsx');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  LineChart, \r?\n/m, '');
  c = c.replace(/^  Line, \r?\n/m, '');
  c = c.replace(/Record<string, any>/g, 'Record<string, unknown>');
  c = c.replace(
    /interface WebhookDelivery \{[\s\S]*?\}\r?\n\r?\ninterface WebhookSubscription/,
    'interface WebhookSubscription'
  );
  c = c.replace(
    /interface WebhookSubscription \{[\s\S]*?\}\r?\n\r?\nconst WebhookManager/,
    'const WebhookManager'
  );
  c = c.replace(
    /  const \[selectedEndpoint, setSelectedEndpoint\] = useState<WebhookEndpoint \| null>\(null\)\r?\n/,
    ''
  );
  c = c.replace(
    /\r?\n  const formatBytes = \(bytes: number\) => \{[\s\S]*?  \}\r?\n/,
    '\r\n'
  );
  write('src/components/integrations/WebhookManager.tsx', c);
}

// ProjectCollaboration.tsx
{
  let c = read('src/components/projects/ProjectCollaboration.tsx');
  c = c.replace(
    "import { Card, Button, Input, Badge, Tabs, Select, Avatar, Progress, Textarea, Switch } from '@/components/ui';",
    "import { Card, Button, Input, Badge, Tabs, Select, Avatar, Textarea } from '@/components/ui';"
  );
  c = c.replace(
    'export default function ProjectCollaboration({ onCommentSelect, onUpdateSelect, onChatSelect }: ProjectCollaborationProps) {',
    'export default function ProjectCollaboration({ onCommentSelect: _onCommentSelect, onUpdateSelect, onChatSelect }: ProjectCollaborationProps) {'
  );
  c = c.replace('const [chats, setChats]', 'const [chats]');
  c = c.replace(
    "import { Plus, Settings, Edit, Trash2, Users, Calendar, Target, Clock, CheckCircle, AlertCircle, XCircle, Eye, Copy, Filter, Search, Star, User, Tag, Mail, Phone, MapPin, Award, TrendingUp, MessageSquare, FileText, Image, Video, Link, ThumbsUp, Share2, MoreVertical, Send, Paperclip, Smile, AtSign } from 'lucide-react';",
    "import { Plus, Users, Target, Eye, MessageSquare, FileText, Image as ImageIcon, Video, ThumbsUp, Share2, MoreVertical, AtSign, Download } from 'lucide-react';"
  );
  c = c.replace(
    "case 'image': return <Image className=\"w-4 h-4\" />;",
    "case 'image': return <ImageIcon className=\"w-4 h-4\" aria-hidden />;"
  );
  c = c.replace('(value: any) => setActiveTab(value)', '(value: string) => setActiveTab(value)');
  c = c.replace(
    '(value: any) => setNewComment({...newComment, projectId: value})',
    '(value: string) => setNewComment({...newComment, projectId: value})'
  );
  c = c.replace(
    '(value: any) => setNewUpdate({...newUpdate, type: value})',
    "(value: ProjectUpdate['type']) => setNewUpdate({...newUpdate, type: value})"
  );
  c = c.replace(
    '(value: any) => setNewUpdate({...newUpdate, priority: value})',
    "(value: ProjectUpdate['priority']) => setNewUpdate({...newUpdate, priority: value})"
  );
  write('src/components/projects/ProjectCollaboration.tsx', c);
}
