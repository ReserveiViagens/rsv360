/**
 * Ingere docs/instrutor/*.md em agente_conhecimento (pgvector).
 * Uso: node backend/scripts/agentes/ingerir-guias.mjs
 * Requer: OPENAI_API_KEY, DATABASE_URL
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

function loadEnvFiles() {
  const candidates = [
    path.join(REPO_ROOT, '.env'),
    path.join(REPO_ROOT, 'backend', '.env'),
    path.join(
      process.env.USERPROFILE || '',
      'Documents',
      'Sistema Reservei Viagens com todos os Servidores',
      '.env',
    ),
  ];
  for (const f of candidates) {
    if (f && fs.existsSync(f)) dotenv.config({ path: f, override: false });
  }
}

loadEnvFiles();

const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const MAX_CHARS = 2000; // ~500 tokens

function parseYamlLite(raw) {
  const out = {};
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
    val = val.replace(/\s+#.*$/, '').trim();
    out[key] = val;
  }
  return out;
}

function parseGuia(slug, raw) {
  const m = raw.match(FRONT_MATTER_RE);
  if (!m) throw new Error(`Front-matter inválido: ${slug}`);
  const meta = parseYamlLite(m[1]);
  const required = ['id', 'titulo', 'papel', 'rotas', 'versao_base'];
  for (const k of required) {
    if (meta[k] == null || meta[k] === '') {
      throw new Error(`Front-matter sem ${k}: ${slug}`);
    }
  }
  return {
    slug,
    id: String(meta.id),
    titulo: String(meta.titulo),
    papel: String(meta.papel),
    rotas: Array.isArray(meta.rotas) ? meta.rotas.map(String) : [],
    versao_base: String(meta.versao_base),
    corpo: m[2].trim(),
  };
}

function chunkBySection(corpo) {
  const parts = corpo.split(/\n(?=## )/);
  const chunks = [];
  for (const part of parts) {
    const text = part.trim();
    if (!text) continue;
    if (text.length <= MAX_CHARS) {
      chunks.push(text);
      continue;
    }
    let i = 0;
    while (i < text.length) {
      chunks.push(text.slice(i, i + MAX_CHARS));
      i += MAX_CHARS;
    }
  }
  return chunks.length ? chunks : [corpo.slice(0, MAX_CHARS)];
}

function vectorLiteral(embedding) {
  return `[${embedding.join(',')}]`;
}

async function main() {
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.trim()) {
    console.error('OPENAI_API_KEY ausente. Adicione no .env e tente de novo.');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL ausente.');
    process.exit(1);
  }

  const guiasDir = path.join(REPO_ROOT, 'docs', 'instrutor');
  if (!fs.existsSync(guiasDir)) {
    console.error(`Pasta não encontrada: ${guiasDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(guiasDir)
    .filter((f) => /^\d{2}-.+\.md$/i.test(f) && !f.startsWith('00-'))
    .sort();

  if (files.length === 0) {
    console.error('Nenhum guia 01–10 encontrado.');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const modeloEmb = process.env.AGENTES_MODELO_EMBEDDING || 'text-embedding-3-small';
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  let totalChunks = 0;
  let totalTokens = 0;

  try {
    for (const file of files) {
      const slug = file.replace(/\.md$/i, '');
      const raw = fs.readFileSync(path.join(guiasDir, file), 'utf8');
      const guia = parseGuia(slug, raw);
      const chunks = chunkBySection(guia.corpo);

      for (let i = 0; i < chunks.length; i++) {
        const conteudo = `# ${guia.titulo}\n\n${chunks[i]}`;
        const emb = await openai.embeddings.create({
          model: modeloEmb,
          input: conteudo,
        });
        const embedding = emb.data[0].embedding;
        const tokens = emb.usage?.total_tokens || 0;
        totalTokens += tokens;

        await pool.query(
          `INSERT INTO agente_conhecimento
            (agente, doc_slug, chunk_ordem, papel, rotas, conteudo, embedding, versao_base)
           VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7::vector, $8)
           ON CONFLICT (agente, doc_slug, chunk_ordem, versao_base)
           DO UPDATE SET
             papel = EXCLUDED.papel,
             rotas = EXCLUDED.rotas,
             conteudo = EXCLUDED.conteudo,
             embedding = EXCLUDED.embedding,
             criado_em = now()`,
          [
            'instrutor',
            slug,
            i,
            guia.papel,
            JSON.stringify(guia.rotas),
            conteudo,
            vectorLiteral(embedding),
            guia.versao_base,
          ],
        );
        totalChunks += 1;
      }
      console.log(`OK ${file}: ${chunks.length} chunk(s)`);
    }

    // estimado text-embedding-3-small ~ US$ 0.02 / 1M tokens
    const custoUsd = (totalTokens / 1_000_000) * 0.02;
    console.log(
      JSON.stringify(
        {
          guias: files.length,
          chunks: totalChunks,
          tokens_embedding: totalTokens,
          custo_estimado_usd: Number(custoUsd.toFixed(6)),
        },
        null,
        2,
      ),
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
