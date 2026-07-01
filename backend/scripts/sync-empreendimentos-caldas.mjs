#!/usr/bin/env node
/**
 * PR 22B — sync empreendimentos Caldas (catálogo ~60 ou CSV).
 * Uso: cd backend && node scripts/sync-empreendimentos-caldas.mjs
 */
import 'dotenv/config';
import { syncEmpreendimentosCaldas } from '../../server/modules/acomodacoes/sync/sync-empreendimentos.ts';

const result = await syncEmpreendimentosCaldas();
console.log('[sync-empreendimentos-caldas]', result);
process.exit(0);
