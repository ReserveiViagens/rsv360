# Integracao ao Plano - Indice Executivo

## 1. Panorama

O repositorio RSV360 combina quatro apps front-end, um backend modular,
schema Drizzle, infraestrutura em Docker e um volume alto de documentacao
operacional.

### Resumo numerico

| Dimensao | Valor | Leitura |
| --- | --- | --- |
| Arquivos totais | 4244 | Base ampla com docs, apps e infra |
| Markdown | 862 | Forte concentracao de relatorios e analises |
| Apps front-end | 4 | site-publico, turismo, admin e guest |
| Rotas backend | 12 | Modulos por dominio em API v1 |
| Schemas Drizzle | 11 | Estrutura centralizada no backend |
| Backlog declarado | 87 | Itens numerados BL-001..BL-087 |

## 2. Componentes concluidos

- Arquitetura modular consolidada.
- Frontends separados por dominio de uso.
- Backend organizado por modulos REST.
- Banco em PostgreSQL com Drizzle.
- Infra base em Docker Compose.
- Testes unitarios com boa cobertura.

## 3. Lacunas

- PRD consolidado e ADRs.
- Diagramas de arquitetura e sequencia.
- Runbook, rollback e disaster recovery.
- Integracoes externas formalizadas.
- Warnings de build e divergencia de Next.js.
- E2E e validacao de check-in ainda parciais.
- Microservicos clonados sem boot validado.

## 4. Estimativa de progresso

| Visao | Estimativa | Motivo |
| --- | --- | --- |
| Funcional central | 80-85% | Apps, backend e schema ja existem |
| Prontidao para producao | 60-70% | Falta endurecimento, testes e governanca |

## 5.3 Resumo executivo

- A plataforma tem fundacao tecnica forte.
- O risco principal e a combinacao de drift, warnings e lacunas de governanca.
- Os proximos 30 dias devem priorizar reservas, pagamentos e autenticacao.
- Tambem entram notificacoes, testes e fechamento de lacunas.
- A decisao critica e aprovar ADRs, isolar microservicos e alinhar a stack.

## 5.4 Onda 1.5

1. Inventariar os 32 microservicos clonados.
2. Subir cada servico com healthcheck verde.
3. Documentar contratos entre monolito e servicos.
4. Criar pipeline proprio por servico.
5. Alinhar Next.js nos quatro apps.
6. Fechar o mock bloqueador do check-in.

## 6. Update Technology Versions

| Tecnologia | Alvo | Risco | Nota |
| --- | --- | --- | --- |
| Node.js | 22 LTS | Baixo | Validar nativos e Dockerfiles |
| TypeScript | 5.8+ | Baixo | Revisar tipos e configuracao |
| React | 19 | Medio | Checar compatibilidade de libs |
| Next.js | 15 | Medio | Unificar versao em todos os apps |
| Express | 5 | Medio | Revisar middlewares e erros |
| Drizzle | latest estavel | Baixo | Validar migrations e journal |
| TanStack Query + Zod | v5 + v3 | Baixo | Padronizar fetch e validacao |
| ESLint | 9 | Baixo | Flat config e regras unificadas |
| Vitest | 2 | Baixo | Runner consistente por workspace |

## 7. Saidas esperadas

- PRD consolidado.
- ADRs de arquitetura e banco.
- ROUTE-CONTRACTS por modulo.
- DEPLOYMENT com bootstrap e rollback.
- MICROSERVICES com inventario e owners.
- Backlog BL-001..BL-087 importado.
- PR de governanca.
- PR de upgrade baseline.

## 8. Checklist imediato

- Validar e priorizar o backlog.
- Aprovar ADR-001.
- Abrir branches de segredos, porta e CI.
- Iniciar a onda 1.5.
- Agendar a fase A do upgrade.
