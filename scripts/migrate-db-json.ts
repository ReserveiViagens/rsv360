/**
 * Migra dados do Sistema A (Crm-RSV-360 data/db.json) para PostgreSQL (Sistema B).
 *
 * Uso: npm run migrate:db-json
 * Requer DATABASE_URL no ambiente (.env na raiz do monorepo).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { travel } from '../backend/src/db/schema/travel.js';
import { passageiros, passageiroExcursao } from '../backend/src/db/schema/passageiros.js';
import { orcamentos, orcamentoItens } from '../backend/src/db/schema/orcamentos.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbJsonPath = path.join(rootDir, 'data', 'db.json');

type DbJson = Record<string, unknown>;

interface ExcursaoJson {
  id: string;
  nome: string;
  dataIda?: string;
  dataVolta?: string;
  destino?: string;
  localSaida?: string;
  capacidade?: number;
  veiculoTipo?: string;
  status?: string;
  precoAdulto?: number;
  precoInfantil?: number;
  categoria?: string;
  imagem?: string;
  rating?: number;
  avaliacoes?: number;
  slug?: string;
  descricao?: string;
  inclui?: string[];
  vagasOcupadas?: number;
  wizard?: {
    quem?: {
      passageiros?: Array<{ nome: string; contato: string; rg?: string; cpf?: string }>;
    };
  };
}

function loadEnvFromDotenv(): void {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

async function main(): Promise<void> {
  loadEnvFromDotenv();

  if (!fs.existsSync(dbJsonPath)) {
    console.log(`[migrate:db-json] ${dbJsonPath} não encontrado — nada a migrar (exit 0).`);
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('[migrate:db-json] DATABASE_URL é obrigatório');
  }

  const raw = fs.readFileSync(dbJsonPath, 'utf8');
  const db: DbJson = JSON.parse(raw);

  const pool = new Pool({ connectionString });
  const drizzleDb = drizzle(pool);

  const excursaoStore = asArray<ExcursaoJson>(db.excursaoStore);
  console.log(`[migrate:db-json] excursaoStore: ${excursaoStore.length} registro(s)`);

  for (const exc of excursaoStore) {
    const [pkg] = await drizzleDb
      .insert(travel)
      .values({
        title: exc.nome,
        slug: exc.slug ?? `excursao-${exc.id}`,
        description: exc.descricao ?? null,
        type: 'excursao',
        origin: exc.localSaida ?? null,
        destination: exc.destino ?? 'Caldas Novas',
        departureDate: exc.dataIda ?? null,
        returnDate: exc.dataVolta ?? null,
        pricePerPerson: String(exc.precoAdulto ?? 0),
        priceChild: exc.precoInfantil != null ? String(exc.precoInfantil) : null,
        maxPassengers: exc.capacidade ?? null,
        currentPassengers: exc.vagasOcupadas ?? 0,
        includes: exc.inclui ? JSON.stringify(exc.inclui) : null,
        imageUrl: exc.imagem ?? null,
        rating: exc.rating != null ? String(exc.rating) : null,
        totalReviews: exc.avaliacoes ?? 0,
        isActive: exc.status !== 'fechada',
      })
      .returning({ id: travel.id });

    const passageirosWizard = exc.wizard?.quem?.passageiros ?? [];
    for (const p of passageirosWizard) {
      const [pass] = await drizzleDb
        .insert(passageiros)
        .values({
          nome: p.nome,
          telefone: p.contato,
          cpf: p.cpf ?? null,
          rg: p.rg ?? null,
        })
        .returning({ id: passageiros.id });

      await drizzleDb.insert(passageiroExcursao).values({
        passageiroId: pass.id,
        travelPackageId: pkg.id,
        status: 'reservado',
      });
    }
  }

  const budgets = asArray<Record<string, unknown>>(db.budgetStore ?? db.budgets ?? db.orcamentos);
  console.log(`[migrate:db-json] orçamentos/cotações: ${budgets.length} registro(s)`);

  for (const budget of budgets) {
    const items = asArray<Record<string, unknown>>(budget.items);
    const [orc] = await drizzleDb
      .insert(orcamentos)
      .values({
        titulo: String(budget.title ?? budget.titulo ?? 'Orçamento migrado'),
        clienteNome: String(budget.clientName ?? budget.clienteNome ?? 'Cliente'),
        clienteEmail: budget.clientEmail ? String(budget.clientEmail) : null,
        clienteTelefone: budget.clientPhone ? String(budget.clientPhone) : null,
        tipo: String(budget.type ?? budget.tipo ?? 'personalizado'),
        status: String(budget.status ?? 'draft'),
        subtotal: String(budget.subtotal ?? 0),
        desconto: String(budget.discount ?? budget.desconto ?? 0),
        impostos: String(budget.taxes ?? budget.impostos ?? 0),
        total: String(budget.total ?? 0),
        moeda: String(budget.currency ?? 'BRL'),
        metadata: budget as Record<string, unknown>,
      })
      .returning({ id: orcamentos.id });

    for (const [index, item] of items.entries()) {
      await drizzleDb.insert(orcamentoItens).values({
        orcamentoId: orc.id,
        nome: String(item.name ?? item.nome ?? 'Item'),
        descricao: item.description ? String(item.description) : null,
        categoria: item.category ? String(item.category) : null,
        quantidade: Number(item.quantity ?? item.quantidade ?? 1),
        precoUnitario: String(item.unitPrice ?? item.precoUnitario ?? 0),
        precoTotal: String(item.totalPrice ?? item.precoTotal ?? 0),
        detalhes: item.details ?? item.detalhes ?? null,
        ordem: index,
      });
    }
  }

  await pool.end();
  console.log('[migrate:db-json] migração concluída.');
}

main().catch((error) => {
  console.error('[migrate:db-json] falhou');
  console.error(error);
  process.exit(1);
});
