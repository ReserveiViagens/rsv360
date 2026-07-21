/**
 * PR-05a — safe sanitizer for Next API 500 responses that leak error.message.
 * Constraints: JSON object body must be flat (no nested `}`); max ~500 chars.
 *   node scripts/pr05a-sanitize-500-errors.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'apps', 'site-publico', 'app', 'api');
const IMPORT_LINE = "import { jsonInternalError } from '@/lib/api-error';";

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else if (ent.isFile() && ent.name === 'route.ts') acc.push(full);
  }
  return acc;
}

function ensureImport(src) {
  if (src.includes("from '@/lib/api-error'") || src.includes('from "@/lib/api-error"')) {
    return src;
  }
  const lines = src.split('\n');
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) lastImport = i;
  }
  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, IMPORT_LINE);
    return lines.join('\n');
  }
  return `${IMPORT_LINE}\n${src}`;
}

function replaceLeaks(src) {
  let out = src;
  let replacements = 0;
  const bump = (v) => {
    replacements += 1;
    return `return jsonInternalError(${v})`;
  };

  // Flat object: error: var.message || '...'
  out = out.replace(
    /return\s+NextResponse\.json\(\s*\{\s*(?:success\s*:\s*false\s*,\s*)?error\s*:\s*([a-zA-Z_][\w]*)\.message(?:\s*\|\|\s*'[^']*')?\s*(?:,\s*data\s*:\s*\[\s*\])?\s*\}\s*,\s*\{\s*status\s*:\s*500\s*,?\s*\}\s*\)/g,
    (_m, v) => bump(v),
  );

  // Template: error: `...${var.message}`
  out = out.replace(
    /return\s+NextResponse\.json\(\s*\{\s*(?:success\s*:\s*false\s*,\s*)?error\s*:\s*`[^`]*\$\{([a-zA-Z_][\w]*)\.message\}[^`]*`\s*(?:,\s*data\s*:\s*\[\s*\])?\s*\}\s*,\s*\{\s*status\s*:\s*500\s*,?\s*\}\s*\)/g,
    (_m, v) => bump(v),
  );

  // (error as Error).message
  out = out.replace(
    /return\s+NextResponse\.json\(\s*\{\s*success\s*:\s*false\s*,\s*error\s*:\s*\(([a-zA-Z_][\w]*)\s+as\s+Error\)\.message(?:\s*\|\|\s*'[^']*')?\s*\}\s*,\s*\{\s*status\s*:\s*500\s*,?\s*\}\s*\)/g,
    (_m, v) => bump(v),
  );

  // Multline flat with error.message || '...' (and optional data: [])
  out = out.replace(
    /return\s+NextResponse\.json\(\s*\{\s*success\s*:\s*false\s*,\s*error\s*:\s*([a-zA-Z_][\w]*)\.message\s*\|\|\s*'[^']*'\s*(?:,\s*data\s*:\s*\[\s*\])?\s*,?\s*\}\s*,\s*\{\s*status\s*:\s*500\s*,?\s*\}\s*\)/g,
    (_m, v) => bump(v),
  );

  // details: error.message (webhooks / header / socket)
  out = out.replace(
    /return\s+NextResponse\.json\(\s*\{\s*success\s*:\s*false\s*,\s*error\s*:\s*'[^']*'\s*,\s*details\s*:\s*([a-zA-Z_][\w]*)\.message\s*\}\s*,\s*\{\s*status\s*:\s*500\s*,?\s*\}\s*\)/g,
    (_m, v) => bump(v),
  );

  // (error as Error).message in details
  out = out.replace(
    /return\s+NextResponse\.json\(\s*\{\s*success\s*:\s*false\s*,\s*error\s*:\s*'[^']*'\s*,\s*details\s*:\s*\(([a-zA-Z_][\w]*)\s+as\s+Error\)\.message\s*\}\s*,\s*\{\s*status\s*:\s*500\s*,?\s*\}\s*\)/g,
    (_m, v) => bump(v),
  );

  // message: var.message field on 500
  out = out.replace(
    /return\s+NextResponse\.json\(\s*\{\s*error\s*:\s*'[^']*'\s*,\s*message\s*:\s*([a-zA-Z_][\w]*) instanceof Error \? \1\.message : '[^']*'\s*\}\s*,\s*\{\s*status\s*:\s*500\s*,?\s*\}\s*\)/g,
    (_m, v) => bump(v),
  );

  // success:false, message: error.message
  out = out.replace(
    /return\s+NextResponse\.json\(\s*\{\s*success\s*:\s*false\s*,\s*message\s*:\s*([a-zA-Z_][\w]*)\.message(?:\s*\|\|\s*'[^']*')?\s*\}\s*,\s*\{\s*status\s*:\s*500\s*,?\s*\}\s*\)/g,
    (_m, v) => bump(v),
  );

  // const message = X instanceof Error ? X.message : '...'; return ... error: message
  out = out.replace(
    /const message = ([a-zA-Z_][\w]*) instanceof Error \? \1\.message : '[^']*';\s*(?:console\.error\([^;]*;\s*)?return NextResponse\.json\(\{\s*success:\s*false,\s*error:\s*message\s*\},\s*\{\s*status:\s*500\s*\}\);/g,
    (_m, v) => {
      replacements += 1;
      return `return jsonInternalError(${v});`;
    },
  );

  // metrics-style: message: error instanceof Error ? error.message
  out = out.replace(
    /return\s+NextResponse\.json\(\s*\{\s*[^}]{0,300}?message\s*:\s*([a-zA-Z_][\w]*) instanceof Error \? \1\.message : '[^']*'[^}]{0,100}\}\s*,\s*\{\s*status\s*:\s*500\s*,?\s*\}\s*\)/g,
    (_m, v) => bump(v),
  );

  return { out, replacements };
}

function main() {
  const files = walk(ROOT);
  let filesTouched = 0;
  let totalReplacements = 0;

  for (const file of files) {
    if (file.includes('implementa')) continue;
    const original = fs.readFileSync(file, 'utf8');
    const { out: replaced, replacements } = replaceLeaks(original);
    if (replacements === 0) continue;

    // Safety: never shrink a file by more than 40% (catastrophic match)
    if (replaced.length < original.length * 0.6) {
      console.error(`SKIP unsafe shrink: ${path.relative(process.cwd(), file)}`);
      continue;
    }

    fs.writeFileSync(file, ensureImport(replaced), 'utf8');
    filesTouched += 1;
    totalReplacements += replacements;
    console.log(`OK ${path.relative(process.cwd(), file)} (+${replacements})`);
  }

  console.log(`\nDone: ${filesTouched} files, ${totalReplacements} replacements`);
}

main();
