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

// ServiceDiscovery.tsx
{
  let c = read('src/components/integrations/ServiceDiscovery.tsx');
  c = c.replace(/^import \{ Input \} from '@\/components\/ui\/Input'\r?\n/m, '');
  c = c.replace(/^import \{ Select \} from '@\/components\/ui\/Select'\r?\n/m, '');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  BarChart, \r?\n/m, '');
  c = c.replace(/^  Bar, \r?\n/m, '');
  c = c.replace(
    /  Pie,\r?\n  RadialBarChart,\r?\n  RadialBar,\r?\n  ScatterChart,\r?\n  Scatter\r?\n\} from 'recharts'/,
    "  Pie\r\n} from 'recharts'"
  );
  c = c.replace(/Record<string, any>/g, 'Record<string, unknown>');
  c = c.replace(
    /interface ServiceMesh \{[\s\S]*?\}\r?\n\r?\ninterface LoadBalancer/,
    'interface LoadBalancer'
  );
  c = c.replace(
    /interface CircuitBreaker \{[\s\S]*?\}\r?\n\r?\nconst ServiceDiscovery/,
    'const ServiceDiscovery'
  );
  c = c.replace(
    /  const \[selectedService, setSelectedService\] = useState<ServiceInstance \| null>\(null\)\r?\n/,
    ''
  );
  c = c.replace('.map((zone, index) => {', '.map((zone) => {');
  write('src/components/integrations/ServiceDiscovery.tsx', c);
}

// MicroservicesManager.tsx
{
  let c = read('src/components/integrations/MicroservicesManager.tsx');
  c = c.replace(/^import \{ Input \} from '@\/components\/ui\/Input'\r?\n/m, '');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  Database,\r?\n/m, '');
  c = c.replace(/^  AreaChart, \r?\n/m, '');
  c = c.replace(/^  Area, \r?\n/m, '');
  c = c.replace(
    /  Pie,\r?\n  RadialBarChart,\r?\n  RadialBar\r?\n\} from 'recharts'/,
    "  Pie\r\n} from 'recharts'"
  );
  c = c.replace(/Record<string, any>/g, 'Record<string, unknown>');
  c = c.replace(
    /interface ServiceMetrics \{[\s\S]*?\}\r?\n\r?\ninterface DeploymentConfig \{[\s\S]*?\}\r?\n\r?\ninterface ServiceTopology \{[\s\S]*?\}\r?\n\r?\nconst MicroservicesManager/,
    'const MicroservicesManager'
  );
  c = c.replace(
    /  const \[selectedService, setSelectedService\] = useState<Microservice \| null>\(null\)\r?\n/,
    ''
  );
  write('src/components/integrations/MicroservicesManager.tsx', c);
}

// OnboardingWizard.tsx
{
  let c = read('src/components/training/OnboardingWizard.tsx');
  c = c.replace(/^import \{ Textarea \} from '@\/components\/ui\/Textarea'\r?\n/m, '');
  c = c.replace(/^  Download,\r?\n/m, '  Download,\r\n  Edit,\r\n');
  c = c.replace(
    /  const \[profile, setProfile\] = useState<Partial<OnboardingProfile>>\(\{\}\)\r?\n/,
    ''
  );
  c = c.replace(/Record<string, any>/g, 'Record<string, unknown>');
  c = c.replace(/value\?: any/g, 'value?: unknown');
  c = c.replace('(componentId: string, value: any)', '(componentId: string, value: unknown)');
  c = c.replace(
    /\r?\n  const formatDateTime = \(dateString: string\) => \{\r?\n    return new Date\(dateString\)\.toLocaleDateString\('pt-BR'\)\r?\n  \}\r?\n/,
    '\r\n'
  );
  write('src/components/training/OnboardingWizard.tsx', c);
}
