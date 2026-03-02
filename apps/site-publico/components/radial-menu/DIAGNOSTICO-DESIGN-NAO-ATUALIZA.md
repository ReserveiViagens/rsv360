# Diagnóstico: Design do Menu Radial não atualiza

## Possíveis causas

### 1. **Service Worker / PWA (mais provável)**
O app registra um Service Worker em `/sw.js`. Ele pode estar servindo uma versão antiga em cache.

**Solução:** Desregistrar o Service Worker para teste:
1. Abra DevTools (F12)
2. Aba **Application** → **Service Workers**
3. Clique em **Unregister** no sw.js
4. Recarregue a página (Ctrl+Shift+R)

### 2. **Cache do navegador**
O navegador mantém o HTML/JS/CSS em cache.

**Solução:** 
- **Hard refresh:** Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
- Ou abra em **janela anônima/privada** (Ctrl+Shift+N)

### 3. **Cache do Next.js (.next)**
O cache pode não ter sido limpo antes de iniciar.

**Solução:**
```powershell
cd "d:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
.\scripts\LIMPAR-CACHE-NEXTJS.ps1 -Apps "site-publico"
# Depois reinicie o Site Público (mate o processo na porta 3000 e rode o script novamente)
```

### 4. **Estado inicial fechado (scale 0.1)**
O novo design abre com o menu **fechado** (scale 0.1). A tela inicial mostra:
- Fundo escuro (#0f172a)
- Botão branco central (com +)
- Controles de perfil na parte inferior

**Para ver o semi-círculo:** clique no botão **+** para abrir o menu.

### 5. **URL incorreta**
O menu radial está em: **http://localhost:3000/dashboard/radial**

Confirme se está acessando essa URL exata.

---

## Como verificar se o NOVO design está carregando

O novo design tem estas características:
- **Fundo:** Azul escuro (#0f172a)
- **Botão central:** Branco com ícone + (fechado) ou X (aberto)
- **Ao abrir:** Semi-círculo na parte inferior com módulos
- **Ao fechar:** Semi-círculo quase invisível (scale 0.1)

O design ANTIGO tinha:
- Fundo cinza claro
- Semi-círculo 180° sempre visível
- Módulos em arco fixo

---

## Checklist rápido

1. [ ] Acessar http://localhost:3000/dashboard/radial
2. [ ] Desregistrar Service Worker (DevTools → Application → Service Workers)
3. [ ] Hard refresh (Ctrl+Shift+R)
4. [ ] Clicar no botão + para abrir o menu
5. [ ] Ver semi-círculo na parte inferior?
