# SRE Agents - Agentes de IA para Monitoramento e Auto-Cura

Sistema de agentes de IA para SRE (Site Reliability Engineering) e monitoramento do RSV360. Os agentes **Monitor**, **Analista** e **Desenvolvedor** colaboram via LangGraph State Graphs para diagnosticar erros e propor correções, com aprovação humana antes da execução.

## Arquitetura

```
Monitor -> Analista -> Desenvolvedor -> [Aprovação Humana] -> Execução
                                              |
                                              v
                                    Sucesso -> Fim
                                    Falha -> Desenvolvedor (retry)
```

- **Monitor**: Filtra logs (Error, Exception, Critical) e reduz tokens enviados à IA
- **Analista**: Diagnostica causa raiz e classifica o problema (DB, rede, código, etc.)
- **Desenvolvedor**: Propõe script/comando de correção (PowerShell, npm, psql, etc.)
- **Human-in-the-loop**: O fluxo para antes de executar; você aprova ou rejeita
- **Execução**: Roda o comando via subprocess (whitelist de comandos seguros)

## Instalação

```bash
cd sre-agents
pip install -r requirements.txt
cp .env.example .env
# Edite .env com suas chaves de API (ou use Ollama para custo zero)
```

## Configuração (.env)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| LLM_PROVIDER | ollama, openai ou anthropic | ollama |
| OLLAMA_MODEL | Modelo Ollama local | llama3.1 |
| OLLAMA_BASE_URL | URL do Ollama | http://localhost:11434 |
| OPENAI_API_KEY | Chave OpenAI (se provider=openai) | - |
| OPENAI_MODEL | Modelo OpenAI | gpt-4o-mini |
| ANTHROPIC_API_KEY | Chave Anthropic (se provider=anthropic) | - |
| ANTHROPIC_MODEL | Modelo Anthropic | claude-3-5-haiku-20241022 |

### Custo Zero com Ollama

1. Instale o [Ollama](https://ollama.com)
2. Execute `ollama run llama3.1` (mantenha o Ollama rodando)
3. Configure `LLM_PROVIDER=ollama` no `.env`

**Nota**: Se o Ollama não estiver rodando, o fluxo falhará com `ConnectionRefused` na porta 11434. Inicie o Ollama antes de executar os agentes.

## Uso

### CLI - Executar com log

```bash
# Log inline
python cli.py run -l "2026-01-30 error: ECONNREFUSED database connection failed"

# Log de arquivo
python cli.py run -f ../backend/logs/combined.log

# Log via stdin
cat ../backend/logs/error.log | python cli.py run
```

### CLI - Aprovar ou Rejeitar

Após o fluxo parar na aprovação:

```bash
# Aprovar e executar a correção
python cli.py approve sre-12345

# Rejeitar
python cli.py reject sre-12345
```

### Watcher - Observar logs em tempo real

```bash
python watcher/log_watcher.py ../backend/logs/combined.log
```

O watcher dispara o fluxo automaticamente ao detectar linhas com Error, Exception, Critical, etc.

### API - Trigger via HTTP e Dashboard Web

```bash
python watcher/trigger_api.py
# Servidor em http://localhost:5050
```

**Dashboard Web**: Acesse http://localhost:5050/ para uma interface completa que permite:
- Ver status do serviço
- Colar logs e disparar análise
- Aprovar ou rejeitar correções pendentes
- Visualizar histórico de análises
- Ler arquivos de log do backend (combined.log, error.log, server_out.txt, etc.)
- Central SRE com saúde dos serviços principais (3000/5000/5002/5050)
- Ações de manutenção e auto-cura (leve e reinício completo do stack)
- Aba "Monitoramento Total" com varredura de:
  - todos os 32 microserviços (6000-6031 /health),
  - servidores principais,
  - páginas/rotas mapeadas no site-publico,
  - checks funcionais essenciais.
- Filtros na aba (categoria, busca textual e somente inconsistências).
- Exportação de relatório da varredura em JSON e CSV.
- Paginação da lista de páginas monitoradas.
- Botão de análise automática das inconsistências com IA (dispara pipeline de agentes).

```bash
# Disparar fluxo (API)
curl -X POST http://localhost:5050/trigger -H "Content-Type: application/json" \
  -d '{"log": "2026-01-30 error: EADDRINUSE port 5000 already in use"}'

# Aprovar (use o thread_id retornado)
curl -X POST http://localhost:5050/approve/api-abc123

# Rejeitar
curl -X POST http://localhost:5050/reject/api-abc123
```

## Estrutura do Projeto

```
sre-agents/
  src/sre_agents/
    state.py           # AgentState
    llm_factory.py     # Ollama / OpenAI / Anthropic
    log_filter.py      # Filtragem de logs
    graph.py           # StateGraph LangGraph
    nodes/
      monitor_node.py      # Monitor
      diagnostic_node.py   # Analista
      proposal_node.py    # Desenvolvedor
      approval_node.py    # Human-in-the-loop
      execution_node.py   # Execução
  watcher/
    log_watcher.py     # Observa arquivo de log
    trigger_api.py     # API Flask para trigger
  cli.py               # CLI principal
  main.py              # Entry point
```

## Segurança

- **Whitelist de comandos**: Apenas npm, node, psql, scripts .ps1, etc. são permitidos
- **Bloqueio**: rm, del, format, shutdown, mkfs, dd são bloqueados
- **Aprovação obrigatória**: Nenhum comando é executado sem aprovação humana

## Integração com RSV360

O sistema considera o contexto do RSV360:
- Backend Node.js na porta 5000
- Backend Admin na porta 5002
- Site público Next.js na porta 3000
- Dashboard Turismo na porta 3005
- PostgreSQL na porta 5433
- Microserviços nas portas 6000-6031
