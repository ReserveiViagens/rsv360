/**
 * Pass 3 — trailing-comma / nested-headers leftovers.
 */
'use strict';

const fs = require('fs');

const IMPORT = "import { jsonInternalError } from '@/lib/api-error';";

const files = [
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

  // (error as Error).message — allow trailing comma after status object
  s = s.replace(
    /return\s+NextResponse\.json\(\s*\{\s*success:\s*false,\s*error:\s*\((error|err)\s+as\s+Error\)\.message(?:\s*\|\|\s*'[^']*')?\s*\}\s*,\s*\{\s*status:\s*500\s*,?\s*\}\s*,?\s*\);?/g,
    (_m, v) => `return jsonInternalError(${v});`,
  );

  // metrics: nested headers after status
  s = s.replace(
    /return\s+NextResponse\.json\(\s*\{\s*error:\s*'[^']*',\s*message:\s*(error|err) instanceof Error \? \1\.message : '[^']*',?\s*\}\s*,\s*\{[\s\S]*?status:\s*500[\s\S]*?\}\s*\);?/g,
    (_m, v) => {
      // Guard: only if match is short
      if (_m.length > 400) return _m;
      return `return jsonInternalError(${v});`;
    },
  );

  if (s !== o) {
    fs.writeFileSync(f, ensureImport(s));
    console.log('fixed', f);
  } else {
    console.log('noop', f);
  }
}
