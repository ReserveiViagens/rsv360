# 🔧 SOLUÇÃO - Erro 404 nos arquivos do Webpack

**Problema:** Erros 404 para `webpack.js`, `react-refresh.js`, `main.js`, etc.

---

## 🐛 CAUSA

Os erros 404 geralmente ocorrem quando:
1. **Cache do navegador desatualizado** - Navegador tentando carregar arquivos antigos
2. **Servidor não foi reiniciado** após mudanças
3. **Build do Next.js corrompido** - Pasta `.next` precisa ser reconstruída

---

## ✅ SOLUÇÃO RÁPIDA

### **Opção 1: Hard Refresh no Navegador** (Mais Rápido)

1. **Feche todas as abas** do localhost:3000
2. **Pressione `Ctrl + Shift + Delete`**
3. **Marque "Imagens e arquivos em cache"**
4. **Clique em "Limpar dados"**
5. **Abra novamente:** http://localhost:3000/properties/1/calendar

### **Opção 2: Limpar Cache e Reiniciar Servidor** (Recomendado)

1. **Pare o servidor** (pressione `Ctrl + C` no terminal onde está rodando)

2. **Execute o script de limpeza:**
   ```powershell
   cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
   .\scripts\reiniciar-servidor.ps1
   ```

3. **Ou manualmente:**
   ```powershell
   # Limpar cache
   Remove-Item -Recurse -Force .next
   
   # Reiniciar servidor
   npm run dev
   ```

4. **Aguarde o servidor iniciar** (você verá "Ready" no terminal)

5. **Limpe o cache do navegador:**
   - `Ctrl + Shift + Delete` → Limpar cache
   - Ou `Ctrl + Shift + R` (hard refresh)

6. **Acesse:** http://localhost:3000/properties/1/calendar

---

## 🔍 VERIFICAÇÃO

Após reiniciar, verifique:

1. **No terminal do servidor**, você deve ver:
   ```
   ▲ Next.js 15.2.4
   - Local:        http://localhost:3000
   - Ready in Xs
   ```

2. **No navegador**, abra o console (`F12`) e verifique:
   - ✅ Não deve haver mais erros 404
   - ✅ Os arquivos devem carregar corretamente

---

## 📋 CHECKLIST

- [ ] Servidor foi parado e reiniciado
- [ ] Pasta `.next` foi removida
- [ ] Cache do navegador foi limpo
- [ ] Hard refresh foi feito (`Ctrl + Shift + R`)
- [ ] Console não mostra mais erros 404

---

## 🚨 SE AINDA NÃO FUNCIONAR

1. **Verifique se o servidor está rodando:**
   ```powershell
   # Teste se o servidor responde
   Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
   ```

2. **Verifique a porta:**
   - Certifique-se de que nenhum outro processo está usando a porta 3000
   - Se necessário, mude a porta: `npm run dev -- -p 3001`

3. **Reinstale dependências:**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   npm run dev
   ```

---

**Execute o script de reinicialização e me diga se resolveu!** 🚀

