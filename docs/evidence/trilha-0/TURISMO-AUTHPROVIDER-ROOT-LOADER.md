# Turismo — AuthProvider no root (loader infinito em `/`)

**Data:** 2026-06-13  
**Branch:** `fix/turismo-authprovider-root-loader`  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**Base:** `main` @ `05d2e3499` (T0.14 plan #307 mergeada)

## Problema

`http://127.0.0.1:3005/` ficava preso em **"Carregando RSV 360°..."** indefinidamente.

## Causa raiz

- `pages/index.tsx` usa `useAuth()` e redireciona quando `!isLoading`.
- `pages/_app.tsx` **não** envolvia a árvore com `AuthProvider`.
- `useAuth()` caía no fallback com `isLoading: true` permanente → redirect nunca executava.

## Correção

Arquivo: `apps/turismo/pages/_app.tsx`

- Importar `AuthProvider` de `../src/context/AuthContext`.
- Envolver `<Component {...pageProps} />` com `<AuthProvider>`.

**Escopo:** 1 arquivo de app + evidência. Sem alteração de dependências, Dockerfile, TS6 ou outros apps.

## Validação técnica

| Gate | Resultado |
|------|-----------|
| type-check turismo | **PASS** |
| build turismo | **PASS** |
| `GET /login` | **200** |
| Docker health | **healthy** |

Artefatos: [logs/TURISMO-AUTHPROVIDER-TYPECHECK.log](./logs/TURISMO-AUTHPROVIDER-TYPECHECK.log), [logs/TURISMO-AUTHPROVIDER-BUILD.log](./logs/TURISMO-AUTHPROVIDER-BUILD.log), [logs/TURISMO-AUTHPROVIDER-DOCKER.tsv](./logs/TURISMO-AUTHPROVIDER-DOCKER.tsv)

## Validação funcional (navegador — prova principal)

| Check | Resultado |
|-------|-----------|
| Abrir `/` | Redirect client-side para **`/login`** |
| Loader infinito | **Ausente** após hidratação |
| Formulário login | Email + Senha visíveis |
| Botão **Entrar** | **Habilitado** (não preso em loading) |

Artefato: [logs/TURISMO-AUTHPROVIDER-BROWSER.tsv](./logs/TURISMO-AUTHPROVIDER-BROWSER.tsv)

**Nota:** `curl` em `/` pode retornar HTML inicial com spinner — o redirect é **client-side** após hidratação React. Prova válida = navegador/Playwright pós-hidratação.

## Veredito

**GO** — bugfix isolado; pronto para PR separada do T0.14 / TS6 site-publico.

## Rollback

- Reverter PR ou restaurar `_app.tsx` anterior
- `docker compose -p rsv360 up -d --build turismo`
