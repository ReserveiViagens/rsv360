const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src', 'components', 'performance');

function replaceRechartsImport(content, replacement) {
  const marker = "from 'recharts'";
  const idx = content.indexOf(marker);
  if (idx === -1) return content;
  const start = content.lastIndexOf('import {', idx);
  const end = idx + marker.length;
  return content.slice(0, start) + replacement + content.slice(end);
}

const files = [
  'CacheManager.tsx',
  'DatabaseOptimizer.tsx',
  'LoadBalancer.tsx',
  'MetricsDashboard.tsx',
  'PerformanceCenter.tsx',
];

const rechartsByFile = {
  'CacheManager.tsx': `import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Bar,
  PieChart,
  Cell,
  Pie,
  ComposedChart
} from 'recharts'`,
  'DatabaseOptimizer.tsx': `import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Bar,
  PieChart,
  Cell,
  Pie,
  ComposedChart
} from 'recharts'`,
  'LoadBalancer.tsx': `import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Cell,
  Pie
} from 'recharts'`,
  'MetricsDashboard.tsx': `import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Cell,
  Pie,
  ComposedChart
} from 'recharts'`,
  'PerformanceCenter.tsx': `import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Bar,
  BarChart,
  ComposedChart
} from 'recharts'`,
};

for (const file of files) {
  const filePath = path.join(root, file);
  let content = fs.readFileSync(filePath, 'utf8');

  content = replaceRechartsImport(content, rechartsByFile[file]);

  content = content.replace(
    /^import \{ Textarea \} from '@\/components\/ui\/Textarea'\n/m,
    ''
  );

  if (file === 'MetricsDashboard.tsx') {
    content = content.replace(
      /^import \{ Input \} from '@\/components\/ui\/Input'\n/m,
      ''
    );
  }

  if (file === 'LoadBalancer.tsx') {
    content = content.replace(
      /(  Archive\n)(} from 'lucide-react';)/,
      '$1  History,\n$2'
    );
  }

  content = content.replace(
    /  const \[selected(?:Instance|Database|Balancer|Dashboard|Metric), setSelected(?:Instance|Database|Balancer|Dashboard|Metric)\] = useState<[^>]+>\(null\)\n/g,
    ''
  );

  if (file === 'CacheManager.tsx') {
    content = content.replace(
      /interface CacheAnalytics \{[\s\S]*?\}\n\n/,
      ''
    );
  }

  if (file === 'LoadBalancer.tsx') {
    content = content.replace(
      /\n  const formatBytes = \(bytes: number\) => \{\n    if \(bytes === 0\) return '0 B'\n    const k = 1024\n    const sizes = \['B', 'KB', 'MB', 'GB', 'TB'\]\n    const i = Math\.floor\(Math\.log\(bytes\) \/ Math\.log\(k\)\)\n    return parseFloat\(\(bytes \/ Math\.pow\(k, i\)\)\.toFixed\(2\)\) \+ ' ' \+ sizes\[i\]\n  \}\n/,
      '\n'
    );
    content = content.replace(
      /lb\.targets\.map\(\(target, index\) =>/,
      'lb.targets.map((target, _index) =>'
    );
  }

  if (file === 'MetricsDashboard.tsx') {
    content = content.replace(
      /\n  const getWidgetTypeIcon = \(type: string\) => \{\n    switch \(type\) \{\n      case 'kpi': return Target\n      case 'line_chart': return TrendingUp\n      case 'bar_chart': return BarChart3\n      case 'pie_chart': return Activity\n      case 'gauge': return Gauge\n      case 'table': return FileText\n      default: return Activity\n    \}\n  \}\n/,
      '\n'
    );
    content = content.replace(
      /dashboard\.alerts\.rules\.map\(\(alert, index\) =>/,
      'dashboard.alerts.rules.map((alert, _index) =>'
    );
  }

  if (file === 'PerformanceCenter.tsx') {
    content = content.replace(
      /\n  const formatPercentage = \(num: number\) => \{\n    return `\$\{num\.toFixed\(1\)\}%`\n  \}\n/,
      '\n'
    );
  }

  if (file === 'DatabaseOptimizer.tsx') {
    content = content.replace(
      /const getDbTypeIcon = \(type: string\)/,
      'const getDbTypeIcon = (_type: string)'
    );
  }

  content = content.replace(/Record<string, any>/g, 'Record<string, unknown>');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`fixed ${file}`);
}
