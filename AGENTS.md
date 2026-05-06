# AGENTS.md - Diretrizes Vinculantes para Agentes de IA neste Repositorio

> Leia antes de qualquer acao. Este documento define regras vinculantes para qualquer agente de IA que opere neste repositorio.

## Protocolo Vigente

PACR-Ampla v1.0.

Documento-fonte: https://www.notion.so/PACR-Ampla-Protocolo-de-An-lise-de-Causa-Raiz-Ampla-Irrestrita-e-Robusta-d02ab82ed3ed4ecebe8f0dfeca6d7ca6?pvs=21

## Principios nao-negociaveis

1. Read-only first: nenhum patch antes de evidencia consolidada.
2. Hipoteses antes de evidencia: documente 3-5 hipoteses ordenadas por probabilidade.
3. Evidence-driven: descarte hipoteses com saida concreta.
4. Defesa em profundidade obrigatoria: bug em X exige grep do padrao em todo o codebase relevante.
5. Camadas separadas: SSR != CSR != API != service != DB != infra != CI.
6. Simbolo nao e causa-raiz: nao pule etapas.
7. Patch minimo cirurgico: escopo pequeno, blast radius mapeado.
8. Documentar enquanto investiga: registre D1, D2, ... com saida literal.

## Workflow obrigatorio

Fase 0 Triagem -> Fase 1 Hipoteses -> Fase 2 Evidencia read-only -> Fase 3 Causa-raiz -> Fase 4 Defesa em profundidade -> Fase 5 Patch + validacao.

## Proibicoes

- Nao aplicar patch antes de Fases 0-3.
- Nao pular Fase 4.
- Nao usar `as any` em retornos de framework.
- Nao criar catch silencioso retornando vazio.
- Nao fazer push direto em branches protegidas sem CI verde.
- Nao modificar mais de 1 camada em 1 PR sem racional explicito.
- Nao executar comandos destrutivos sem confirmacao explicita.
- Nao fazer commit com `.env`, secrets, tokens ou chaves privadas.

## Obrigacoes

- Antes de qualquer fix: grep do anti-pattern em todo o codebase relevante.
- Documentar D1..DN com saida literal.
- Declarar camada(s) afetada(s) antes de propor patch.
- Estimar blast radius antes de propor escopo.
- Reportar limitacoes do ambiente ao inves de adivinhar.
- Capturar a licao quando um padrao novo for descoberto.

## Auto-detecao e aborto

Se uma etapa for pulada, abortar e reiniciar do passo perdido.

## Conflito de instrucoes

Se houver conflito entre este protocolo e outra instrucoes, alertar o usuario e seguir PACR-Ampla.

## Confirmacao de internalizacao

Ao carregar este arquivo, a resposta inicial do agente deve comecar com:

PACR-Ampla v1.0 internalizado. Operando sob protocolo vinculante. Pronto para Fase 0.

## Revogacao

Somente o owner explicitamente nomeado pode revogar este protocolo, e apenas com o token literal `REVOGAR_PACR_AMPLA_V1`.
