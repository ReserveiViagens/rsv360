/**
 * Second-pass leftover 500 leaks (cotacao BFF, metrics, dashboard).
 */
'use strict';

const fs = require('fs');

const IMPORT = "import { jsonInternalError } from '@/lib/api-error';";

const files = [
  'apps/site-publico/app/api/analytics/dashboard/route.ts',
  'apps/site-publico/app/api/cotacao/acomodacoes/disponiveis/route.ts',
  'apps/site-publico/app/api/cotacao/acomodacoes/import/route.ts',
  'apps/site-publico/app/api/cotacao/addons/route.ts',
  'apps/site-publico/app/api/cotacao/disponibilidade/route.ts',
  'apps/site-publico/app/api/cotacao/gerar-proposta/route.ts',
  'apps/site-publico/app/api/cotacao/lead-abandono/route.ts',
  'apps/site-publico/app/api/cotacao/p/[token]/route.ts',
  'apps/site-publico/app/api/cotacao/proposta/[token]/aceitar/route.ts',
  'apps/site-publico/app/api/cotacao/proposta/[token]/validade/route.ts',
  'apps/site-publico/app/api/cotacao/roteiro/[token]/analytics/route.ts',
  'apps/site-publico/app/api/cotacao/roteiro/[token]/evento/route.ts',
  'apps/site-publico/app/api/cotacao/roteiro/[token]/pontos/route.ts',
  'apps/site-publico/app/api/cotacao/roteiro/[token]/route.ts',
  'apps/site-publico/app/api/cotacao/roteiro-atracoes/route.ts',
  'apps/site-publico/app/api/metrics/route.ts',
  'apps/site-publico/app/api/propostas/[token]/eventos/route.ts',
  'apps/site-publico/app/api/identity/verify/route.ts',
  'apps/site-publico/app/api/checkin/documents/route.ts',
];

function ensureImport(src) {
  if (src.includes('api-error')) return src;
  const lines = src.split('\n');
  let li = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) li = i;
  }
  if (li >= 0) {
    lines.splice(li + 1, 0, IMPORT);
    return lines.join('\n');
  }
  return `${IMPORT}\n${src}`;
}

for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  const o = s;

  s = s.replace(
    /const message = (error|err) instanceof Error \? \1\.message : '[^']*';\s*(?:console\.error\([^;]*;\s*)?return NextResponse\.json\(\s*\{\s*success:\s*false,\s*error:\s*message\s*\}\s*,\s*\{\s*status:\s*500\s*\}\s*\);?/g,
    (_m, v) => `return jsonInternalError(${v});`,
  );

  s = s.replace(
    /return\s+NextResponse\.json\(\s*\{\s*success:\s*false,\s*error:\s*\((error|err)\s+as\s+Error\)\.message(?:\s*\|\|\s*'[^']*')?\s*\}\s*,\s*\{\s*status:\s*500\s*,?\s*\}\s*\);?/g,
    (_m, v) => `return jsonInternalError(${v});`,
  );

  s = s.replace(
    /return\s+NextResponse\.json\(\s*\{\s*error:\s*'[^']*',\s*message:\s*(error|err) instanceof Error \? \1\.message : '[^']*',?\s*\}\s*,\s*\{\s*status:\s*500[^}]*\}\s*\);?/g,
    (_m, v) => `return jsonInternalError(${v});`,
  );

  s = s.replace(
    /return\s+NextResponse\.json\(\s*\{\s*error:\s*'Internal Server Error'\s*\}\s*,\s*\{\s*status:\s*500\s*\}\s*\);?/g,
    'return jsonInternalError(error);',
  );

  if (s !== o) {
    fs.writeFileSync(f, ensureImport(s));
    console.log('fixed', f);
  } else {
    console.log('noop', f);
  }
}
