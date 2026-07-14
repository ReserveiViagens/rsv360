import fs from 'fs';
import path from 'path';
import type { GuiaCarregado, GuiaFrontMatter, InstrutorPapel } from './tipos';

const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseYamlLite(raw: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        out[key] = JSON.parse(val.replace(/'/g, '"'));
      } catch {
        out[key] = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      }
      continue;
    }
    // strip inline comments after value
    val = val.replace(/\s+#.*$/, '').trim();
    out[key] = val;
  }
  return out;
}

export function parseGuiaMarkdown(slug: string, raw: string): GuiaCarregado | null {
  const m = raw.match(FRONT_MATTER_RE);
  if (!m) return null;
  const meta = parseYamlLite(m[1]);
  const papelRaw = String(meta.papel || '').toLowerCase();
  const papel: InstrutorPapel =
    papelRaw === 'anfitriao' || papelRaw === 'ambos' || papelRaw === 'staff'
      ? (papelRaw as InstrutorPapel)
      : 'staff';
  const rotas = Array.isArray(meta.rotas)
    ? meta.rotas.map(String)
    : typeof meta.rotas === 'string'
      ? [meta.rotas]
      : [];
  const fm: GuiaFrontMatter = {
    id: String(meta.id || slug),
    titulo: String(meta.titulo || slug),
    papel,
    rotas,
    versao_base: String(meta.versao_base || '2026-07-13'),
  };
  const corpo = m[2].trim();
  return {
    ...fm,
    slug,
    corpo,
    emConstrucao: /🚧/.test(corpo) || /em construção/i.test(corpo),
  };
}

export function resolveGuiasDir(): string {
  const candidates = [
    path.resolve(process.cwd(), 'docs/instrutor'),
    path.resolve(process.cwd(), '../docs/instrutor'),
    path.resolve(__dirname, '../../../../docs/instrutor'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

let cache: GuiaCarregado[] | null = null;

export function loadGuiasInstrutor(force = false): GuiaCarregado[] {
  if (cache && !force) return cache;
  const dir = resolveGuiasDir();
  if (!fs.existsSync(dir)) {
    cache = [];
    return cache;
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^\d{2}-.+\.md$/i.test(f) && !f.startsWith('00-'))
    .sort();
  const guias: GuiaCarregado[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const slug = file.replace(/\.md$/i, '');
    const g = parseGuiaMarkdown(slug, raw);
    if (g) guias.push(g);
  }
  cache = guias;
  return guias;
}

export function __resetGuiasCacheForTests(): void {
  cache = null;
}
