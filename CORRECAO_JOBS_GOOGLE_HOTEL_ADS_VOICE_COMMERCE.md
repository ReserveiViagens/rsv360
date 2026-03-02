# Correção: Jobs Google Hotel Ads e Voice Commerce

## Problema

Os jobs **Google Hotel Ads** e **Voice Commerce** falhavam na inicialização do backend com o erro:

```
⚠️ Google Hotel Ads jobs initialization failed, but server will continue
⚠️ Voice Commerce jobs initialization failed, but server will continue
```

## Causa Raiz

**Erro de sintaxe JavaScript em comentários JSDoc.**

Nos comentários em bloco `/* ... */`, a sequência `*/` fecha o comentário prematuramente. Quando a expressão cron `*/30 * * * *` (a cada 30 minutos) ou `0 */6 * * *` (a cada 6 horas) aparecia dentro de um comentário, o `*/` era interpretado como fim do bloco, gerando:

```
SyntaxError: Unexpected token '*'
```

## Arquivos Corrigidos

### 1. `backend/src/jobs/voice-commerce.js`
- **Linha 34:** `* Cron: */30 * * * * (a cada 30 minutos)` → `* Cron: a cada 30 minutos`

### 2. `backend/src/jobs/google-hotel-ads.js`
- **Linha 76:** `* Cron: */30 * * * * (a cada 30 minutos)` → `* Cron: a cada 30 minutos`
- **Linha 119:** `* Cron: 0 */6 * * * (a cada 6 horas)` → `* Cron: a cada 6 horas`

## Solução Aplicada

As expressões cron foram removidas dos comentários e substituídas por descrições em texto, evitando a sequência `*/` dentro de blocos `/* ... */`.

## Verificação

Após a correção, ambos os jobs carregam corretamente:

```
Voice Commerce OK
Google Hotel Ads OK
Todos os jobs carregaram com sucesso!
```

## Reiniciar o Backend

Para aplicar as alterações, reinicie o backend:

```powershell
cd "RSV360 Versao Oficial\backend"
npm run dev
```

Os logs devem exibir:

```
✅ Google Hotel Ads jobs started
✅ Voice Commerce jobs started
```
