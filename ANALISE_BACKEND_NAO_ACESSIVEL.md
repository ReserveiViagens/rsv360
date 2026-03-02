# Análise: "Backend Principal pode não estar acessível"

## O que acontece

O script `Iniciar Sistema Completo.ps1` chama `iniciar-backend.ps1`, que:

1. Inicia o backend com `npm run dev` (nodemon)
2. Aguarda **15 segundos**
3. Tenta acessar `http://localhost:5000/health` até **15 vezes** (intervalo de 2s)
4. **Tempo máximo de espera:** 15 + (15×2) = **45 segundos**

Se o backend não responder em 45 segundos, aparece o aviso.

---

## Possíveis causas

| Causa | Explicação |
|-------|------------|
| **1. Inicialização lenta** | O backend carrega ~50 rotas, conecta ao PostgreSQL, inicia jobs (leilões, flash deals, OTA, etc.). Em máquinas mais lentas ou no primeiro start, pode levar 30–60s. |
| **2. Conexão com PostgreSQL** | Se o banco estiver em Docker ou demorar para aceitar conexões, o `connectDatabase()` pode atrasar. O servidor **só começa a escutar** depois que a conexão com o DB é estabelecida (ou falha). |
| **3. Redis** | Com `REDIS_ENABLED=false` (seu .env), o Redis é ignorado. Se estivesse habilitado e o Redis não respondesse, poderia atrasar a inicialização. |
| **4. Janela de tempo curta** | 45 segundos pode ser pouco em cold start ou com muitos módulos. |

---

## Verificação rápida

O backend **costuma estar funcionando** mesmo com o aviso. Teste:

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
```

Se retornar 200, o backend está OK. O aviso indica apenas que ele não respondeu dentro da janela de 45s.

---

## Correções aplicadas

1. **Aumentar tempo de espera** no `iniciar-backend.ps1`
2. **Timeout de conexão** no knex para evitar travamento no banco
