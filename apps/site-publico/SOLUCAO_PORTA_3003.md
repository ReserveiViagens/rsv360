# 🔧 SOLUÇÃO - Servidor na Porta 3003

**Problema:** O servidor está rodando na porta 3003 em vez de 3000

---

## 🐛 CAUSA

As portas 3000, 3001 e 3002 estão em uso por outros processos, então o Next.js automaticamente usou a porta 3003.

---

## ✅ SOLUÇÃO

### **Opção 1: Usar a Porta 3003** (Mais Rápido)

Simplesmente acesse a URL correta:

**http://localhost:3003/properties/1/calendar**

### **Opção 2: Liberar a Porta 3000** (Recomendado)

1. **Pare o servidor atual** (Ctrl + C no terminal)

2. **Pare os processos usando as portas:**
   ```powershell
   # Parar processo na porta 3000
   $process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess
   if ($process) { Stop-Process -Id $process -Force }
   
   # Parar processo na porta 3001
   $process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess
   if ($process) { Stop-Process -Id $process -Force }
   
   # Parar processo na porta 3002
   $process = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess
   if ($process) { Stop-Process -Id $process -Force }
   ```

3. **Reinicie o servidor:**
   ```powershell
   npm run dev
   ```

4. **Agora deve usar a porta 3000:**
   - http://localhost:3000/properties/1/calendar

---

## 🔧 CORREÇÃO DO next.config.mjs

O erro sobre `experimental.serverActions` foi corrigido. No Next.js 15, `serverActions` já está habilitado por padrão, então não precisa estar em `experimental`.

---

## 📋 CHECKLIST

- [x] Erro do `next.config.mjs` corrigido
- [ ] Servidor reiniciado
- [ ] Porta 3000 liberada (ou usando porta 3003)
- [ ] Acessando URL correta

---

## 🧪 TESTE AGORA

**Opção A - Usar porta 3003:**
- http://localhost:3003/properties/1/calendar

**Opção B - Liberar porta 3000:**
1. Pare os processos nas portas 3000-3002
2. Reinicie o servidor
3. Acesse: http://localhost:3000/properties/1/calendar

---

**A correção do `next.config.mjs` foi aplicada!** ✅

**Agora use a porta 3003 ou libere a porta 3000!** 🚀

