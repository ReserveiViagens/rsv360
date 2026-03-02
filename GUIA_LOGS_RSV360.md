# Guia de Logs - RSV360

Onde coletar logs de erro e monitoramento do sistema. **Cobertura total** com o Coletor SRE.

---

## 1. Dashboard Agentes SRE (principal)

**URL:** http://localhost:5050

O dashboard centraliza a visualização de logs e permite:

- **Visualizar logs** – Selecione arquivos de qualquer serviço (backend, microserviços, frontends).
- **Coletor Automático** – Inicie o monitoramento em tempo real; erros são detectados automaticamente.
- **Disparar análise** – Cole um trecho de log ou clique em "Analisar" em erros detectados.
- **Histórico** – Veja análises anteriores e correções propostas.

---

## 2. Estrutura de logs (cobertura total)

Ao usar **Iniciar Sistema Completo.ps1**, todos os serviços redirecionam stdout/stderr para arquivos:

| Serviço | Arquivo de log |
|---------|----------------|
| Backend Principal (5000) | `backend/logs/backend-5000.log` |
| Backend Admin/CMS (5002) | `backend/logs/backend-5002.log` |
| Winston (quando LOG_TO_FILE=true) | `backend/logs/combined.log`, `backend/logs/error.log` |
| 32 Microserviços | `backend/logs/microservices/{nome}.log` (ex: `core-api.log`) |
| Dashboard Turismo (3005) | `apps/turismo/logs/dev.log` |
| Site Público (3000) | `apps/site-publico/logs/dev.log` |
| Outros | `backend/server_out.txt`, `backend/server_err.txt`, `logs/npm-install.log` |

---

## 3. Descoberta dinâmica

O Coletor SRE escaneia automaticamente:

- `backend/logs/` (inclui `microservices/`)
- `apps/turismo/logs/`
- `apps/site-publico/logs/`
- `logs/` (raiz do projeto)

Arquivos `*.log` e `*.txt` em até 2 níveis de profundidade são incluídos.

---

## 4. Configuração opcional (COLLECTOR_LOG_PATHS)

Para adicionar pastas extras ao Coletor, edite `sre-agents/.env`:

```
COLLECTOR_LOG_PATHS=backend/logs,apps/turismo/logs,apps/site-publico/logs
```

---

## 5. Terminais (PowerShell)

Cada serviço abre em uma janela própria. Os logs aparecem **na janela e no arquivo** (Tee-Object):

- Backend Principal (5000)
- Backend Admin/CMS (5002)
- 32 Microserviços
- Dashboard Turismo (3005)
- Site Público (3000)
- Agentes SRE (5050)

---

## 6. Resumo rápido

| Onde | Como acessar |
|------|--------------|
| **Dashboard SRE** | http://localhost:5050 |
| **Aba Logs** | Selecione arquivo na lista |
| **Aba Coletor Automático** | Inicie para monitorar em tempo real |
| **Arquivos** | `backend/logs/`, `apps/*/logs/` |

---

## 7. LOG_TO_FILE (backend)

O backend usa Winston e grava em `combined.log` e `error.log` quando:

- `NODE_ENV=production`, ou
- `LOG_TO_FILE=true`

O script **Iniciar Sistema Completo.ps1** e **iniciar-backend.ps1** definem `LOG_TO_FILE=true` automaticamente ao iniciar o backend.

---

## 8. Considerações

- **Impacto em performance:** Negligível. A leitura de ~40 arquivos a cada 3 segundos pelo Coletor é leve.
- **Tamanho dos logs:** Os arquivos crescem com o tempo. Considerar rotação de logs em versão futura (ex: logrotate ou winston-daily-rotate-file).
- **Primeira execução:** Os arquivos de log são criados na primeira execução do **Iniciar Sistema Completo.ps1** após as alterações.
