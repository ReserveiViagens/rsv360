#!/usr/bin/env node
import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseArquivo } from '../../server/modules/acomodacoes/import/parse.ts';
import { normalizarLote } from '../../server/modules/acomodacoes/import/normalizar.ts';

const csvPath =
  process.env.INVENTARIO_CALDAS_CSV ||
  resolve(process.cwd(), '../data/cotacao/inventario-caldas-fixture.csv');

const buffer = readFileSync(csvPath);
const linhas = await parseArquivo(buffer, csvPath);
const { validos, erros, ignorados } = await normalizarLote(linhas);

let publicado = 0;
let rascunho = 0;
const rascunhoMotivos = { sem_preco: 0, empreendimento_nao_resolvido: 0, ambos: 0 };

for (const dto of validos) {
  const semPreco = dto.precoDiaria == null;
  const naoResolvido = !dto.empreendimentoResolvido;
  if (!semPreco && !naoResolvido) {
    publicado += 1;
  } else {
    rascunho += 1;
    if (semPreco && naoResolvido) rascunhoMotivos.ambos += 1;
    else if (semPreco) rascunhoMotivos.sem_preco += 1;
    else rascunhoMotivos.empreendimento_nao_resolvido += 1;
  }
}

const naoResolvidoNomes = [...new Set(validos.filter((d) => !d.empreendimentoResolvido).map((d) => d.empreendimento))];

const report = {
  csvPath,
  resumo: {
    total_linhas_arquivo: linhas.length,
    ignorados: ignorados.length,
    erros_normalizacao: erros.length,
    validos: validos.length,
    total_contabilizado: ignorados.length + erros.length + validos.length,
  },
  errosNormalizacao: erros,
  ignorados_predio: ignorados,
  breakdown_commit: {
    publicado_esperado: publicado,
    rascunho_esperado: rascunho,
    rascunho_motivos: rascunhoMotivos,
    quartos_zero: validos.filter((d) => d.quartos === 0).length,
    sem_preco: validos.filter((d) => d.precoDiaria == null).length,
    empreendimento_nao_resolvido: validos.filter((d) => !d.empreendimentoResolvido).length,
  },
  empreendimentos_nao_resolvidos: naoResolvidoNomes,
};

console.log(JSON.stringify(report, null, 2));
