import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { MemorySaver } from '@langchain/langgraph-checkpoint';
import type { InstrutorPapel, InstrutorResposta } from './tipos';
import { triagemT0 } from './triagem';
import { executarT1 } from './instrutor-t1';

/**
 * Checkpointer: PostgresSaver no schema `langgraph` (criado pela lib em setup()).
 * Tabelas do LangGraph NÃO entram no journal Drizzle — ver migration 0039 e README.
 */
const InstrutorState = Annotation.Root({
  pergunta: Annotation<string>,
  papel: Annotation<Exclude<InstrutorPapel, 'ambos'>>,
  resposta: Annotation<string>,
  tier: Annotation<'t0' | 't1'>,
  cacheHit: Annotation<'exact' | 'semantic' | 'none'>,
  status: Annotation<200 | 503>,
  entradaHash: Annotation<string | null>,
  tokensIn: Annotation<number | null>,
  tokensOut: Annotation<number | null>,
  modelo: Annotation<string | null>,
  destino: Annotation<'t0' | 't1'>,
});

type GraphState = typeof InstrutorState.State;

async function noTriagem(state: GraphState): Promise<Partial<GraphState>> {
  const r = triagemT0(state.pergunta, state.papel);
  if (r.destino === 't0') {
    return {
      destino: 't0',
      resposta: r.resposta,
      tier: 't0',
      cacheHit: 'none',
      status: 200,
      entradaHash: null,
      tokensIn: null,
      tokensOut: null,
      modelo: null,
    };
  }
  return { destino: 't1' };
}

async function noInstrutor(state: GraphState): Promise<Partial<GraphState>> {
  const r = await executarT1(state.pergunta, state.papel);
  return {
    resposta: r.resposta,
    tier: r.tier,
    cacheHit: r.cacheHit,
    status: r.status,
    entradaHash: r.entradaHash,
    tokensIn: r.tokensIn ?? null,
    tokensOut: r.tokensOut ?? null,
    modelo: r.modelo ?? null,
  };
}

let compiled: Awaited<ReturnType<typeof buildCompiled>> | null = null;
let checkpointerReady = false;

async function getCheckpointer() {
  const url = process.env.DATABASE_URL;
  if (!url || process.env.AGENTES_LANGGRAPH_MEMORY === 'true') {
    return new MemorySaver();
  }
  try {
    const { PostgresSaver } = await import('@langchain/langgraph-checkpoint-postgres');
    const saver = PostgresSaver.fromConnString(url, { schema: 'langgraph' });
    if (!checkpointerReady) {
      await saver.setup();
      checkpointerReady = true;
    }
    return saver;
  } catch (err) {
    console.warn(
      '[instrutor] PostgresSaver indisponível, usando MemorySaver:',
      (err as Error).message,
    );
    return new MemorySaver();
  }
}

async function buildCompiled() {
  const checkpointer = await getCheckpointer();
  const graph = new StateGraph(InstrutorState)
    .addNode('triagem', noTriagem)
    .addNode('instrutor', noInstrutor)
    .addEdge(START, 'triagem')
    .addConditionalEdges('triagem', (state: GraphState) =>
      state.destino === 't0' ? END : 'instrutor',
    )
    .addEdge('instrutor', END);

  return graph.compile({ checkpointer });
}

export async function getInstrutorGraph() {
  if (compiled) return compiled;
  compiled = await buildCompiled();
  return compiled;
}

export function __resetInstrutorGraphForTests(): void {
  compiled = null;
  checkpointerReady = false;
}

export async function runInstrutorGraph(
  pergunta: string,
  papel: Exclude<InstrutorPapel, 'ambos'>,
  threadId?: string,
): Promise<
  InstrutorResposta & {
    entradaHash: string | null;
    tokensIn: number | null;
    tokensOut: number | null;
    modelo: string | null;
  }
> {
  const app = await getInstrutorGraph();
  const result = await app.invoke(
    {
      pergunta,
      papel,
      resposta: '',
      tier: 't0',
      cacheHit: 'none',
      status: 200,
      entradaHash: null,
      tokensIn: null,
      tokensOut: null,
      modelo: null,
      destino: 't1',
    },
    {
      configurable: {
        thread_id: threadId || `instrutor:${papel}:${Date.now()}`,
      },
    },
  );

  return {
    resposta: result.resposta,
    tier: result.tier,
    cacheHit: result.cacheHit,
    status: result.status,
    entradaHash: result.entradaHash,
    tokensIn: result.tokensIn,
    tokensOut: result.tokensOut,
    modelo: result.modelo,
  };
}
