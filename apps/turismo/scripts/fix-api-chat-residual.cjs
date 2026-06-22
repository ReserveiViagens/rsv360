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

function applyStaticDates(text) {
  const replacements = [
    [/new Date\(Date\.now\(\) - 1000 \* 60 \* 60 \* 2 \+ 1000 \* 60 \* 15\)/g, "new Date('2025-06-02T10:15:00')"],
    [/new Date\(Date\.now\(\) - 1000 \* 60 \* 60 \* 2 \+ 1000 \* 60 \* 10\)/g, "new Date('2025-06-02T10:10:00')"],
    [/new Date\(Date\.now\(\) - 1000 \* 60 \* 60 \* 2 \+ 1000 \* 60 \* 5\)/g, "new Date('2025-06-02T10:05:00')"],
    [/new Date\(Date\.now\(\) - 1000 \* 60 \* 60 \* 24 \* 2\)/g, "new Date('2025-05-31T12:00:00')"],
    [/new Date\(Date\.now\(\) - 1000 \* 60 \* 60 \* 24\)/g, "new Date('2025-06-01T12:00:00')"],
    [/new Date\(Date\.now\(\) - 1000 \* 60 \* 60 \* 5\)/g, "new Date('2025-06-02T07:00:00')"],
    [/new Date\(Date\.now\(\) - 1000 \* 60 \* 60 \* 2\)/g, "new Date('2025-06-02T10:00:00')"],
    [/new Date\(Date\.now\(\) - 1000 \* 60 \* 25\)/g, "new Date('2025-06-02T11:35:00')"],
    [/new Date\(Date\.now\(\) - 1000 \* 60 \* 30\)/g, "new Date('2025-06-02T11:30:00')"],
  ];
  let out = text;
  for (const [pattern, replacement] of replacements) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function fixChat(rel) {
  let c = read(rel);

  c = c.replace(/^import \{ useAuth \} from[^\n]+\n/m, '');
  c = c.replace(/^import \{ useRouter \} from 'next\/router';\r?\n/m, '');
  c = c.replace(/    const \{ user \} = useAuth\(\);\r?\n    const router = useRouter\(\);\r?\n/, '');

  c = c.replace(
    'const [showNewConversation, setShowNewConversation]',
    'const [, setShowNewConversation]'
  );
  c = c.replace('const [showSettings, setShowSettings]', 'const [, setShowSettings]');
  c = c.replace('const [isTyping, setIsTyping]', 'const [isTyping]');

  c = c.replace(/^  Image,/m, '  Image as ImageIcon,');
  c = c.replace(/<Image className/g, '<ImageIcon className');

  const mockMatch = c.match(
    /    \/\/ Mock data para conversas[\s\S]*?    \];\r?\n\r?\n    useEffect\(\(\) => \{/
  );
  if (mockMatch) {
    let mocks = mockMatch[0].replace(/    useEffect\(\(\) => \{$/, '');
    mocks = applyStaticDates(mocks);
    mocks = mocks
      .replace('    // Mock data para conversas\n    const mockConversations', 'const MOCK_CONVERSATIONS')
      .replace('    // Mock data para mensagens\n    const mockMessages', 'const MOCK_MESSAGES')
      .replace(/^    /gm, '');
    c = c.replace(mockMatch[0], '    useEffect(() => {');
    c = c.replace('export default function Chat()', `${mocks}\nexport default function Chat()`);
  }

  c = c.replace(/mockConversations/g, 'MOCK_CONVERSATIONS');
  c = c.replace(/mockMessages/g, 'MOCK_MESSAGES');

  c = c.replace(
    /(const messagesEndRef = useRef<HTMLDivElement>\(null\);\r?\n\r?\n)(    useEffect)/,
    '$1    const scrollToBottom = () => {\n        messagesEndRef.current?.scrollIntoView({ behavior: \'smooth\' });\n    };\n\n$2'
  );
  c = c.replace(
    /\r?\n    const scrollToBottom = \(\) => \{\r?\n        messagesEndRef\.current\?\.scrollIntoView\(\{ behavior: 'smooth' \}\);\r?\n    \};\r?\n\r?\n    const handleSendMessage/,
    '\n\n    const handleSendMessage'
  );

  c = c.replace(
    /    useEffect\(\(\) => \{\r?\n        if \(selectedConversation\) \{\r?\n            setMessages\(MOCK_MESSAGES\);/,
    "    useEffect(() => {\n        if (selectedConversation) {\n            // eslint-disable-next-line react-hooks/set-state-in-effect -- demo mock load on conversation select\n            setMessages(MOCK_MESSAGES);"
  );

  write(rel, c);
}

// api.ts
{
  let c = read('src/services/api.ts');
  c = c.replace('catch (refreshError)', 'catch (_refreshError)');
  c = c.replace(/params\?: any/g, 'params?: Record<string, string>');
  c = c.replace(/metadata: any/g, 'metadata: Record<string, string>');
  c = c.replace(/: any/g, ': unknown');
  c = c.replace(
    /export const handleApiError = \(error: unknown\) => \{[\s\S]*?\};/,
    `export const handleApiError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('401')) {
    window.location.href = '/login';
  } else if (message.includes('403')) {
    console.error('Acesso negado:', error);
  } else if (message.includes('500')) {
    console.error('Erro interno do servidor:', error);
  } else {
    console.error('Erro da API:', error);
  }

  return {
    success: false,
    error: message,
  };
};`
  );
  c = c.replace(/\};\r?\n\};\r?\n\r?\n\/\/ Interceptor/, '};\n\n// Interceptor');
  write('src/services/api.ts', c);
}

fixChat('pages/chat.tsx');
fixChat('src/pages/chat.tsx');
