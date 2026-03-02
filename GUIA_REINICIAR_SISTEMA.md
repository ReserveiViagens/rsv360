# 🔄 GUIA: REINICIAR SISTEMA COMPLETO

## 📋 Visão Geral

O script `Reiniciar Sistema Completo.ps1` realiza um **reinício completo e limpo** do sistema, garantindo que tudo seja reiniciado do zero com cache limpo.

## 🎯 O Que o Script Faz

### FASE 1: Parar Serviços
- ✅ Para todos os microserviços (portas 6000-6031)
- ✅ Para Dashboard Turismo (porta 3005)
- ✅ Para Site Público (porta 3000)
- ✅ Aguarda processos finalizarem

### FASE 2: Limpar Portas
- ✅ Limpa portas 3000 e 3005
- ✅ Limpa portas dos microserviços (6000-6031)
- ✅ Garante que nenhuma porta fique ocupada

### FASE 3: Limpar Cache do Next.js
- ✅ Limpa cache do Site Público (`.next`)
- ✅ Limpa cache do Dashboard Turismo (`.next`)
- ✅ Limpa cache do `node_modules/.cache`
- ✅ **Garante que CSS será recompilado do zero**

### FASE 4: Fechar Janelas PowerShell
- ✅ Identifica janelas PowerShell relacionadas ao sistema
- ✅ Fecha janelas de processos Node.js
- ✅ Fecha janelas órfãs
- ✅ Limpa ambiente visual

### FASE 5: Reiniciar Sistema
- ✅ Chama `Iniciar Sistema Completo.ps1`
- ✅ Inicia todos os serviços novamente
- ✅ CSS será recompilado automaticamente

## 🚀 Como Usar

### Uso Básico (com confirmação)
```powershell
.\Reiniciar Sistema Completo.ps1
```
O script pedirá confirmação antes de reiniciar.

### Uso com Forçar (sem confirmação)
```powershell
.\Reiniciar Sistema Completo.ps1 -Forcar
```
Reinicia automaticamente sem pedir confirmação.

### Ver Ajuda
```powershell
.\Reiniciar Sistema Completo.ps1 -Ajuda
```

## ⏱️ Tempo Estimado

- **Parar serviços:** ~5-10 segundos
- **Limpar portas:** ~2-3 segundos
- **Limpar cache:** ~2-5 segundos
- **Fechar janelas:** ~2-3 segundos
- **Reiniciar:** ~30-60 segundos (iniciar processos)
- **Compilação Next.js:** ~2-5 minutos (primeira vez)

**Total:** ~3-6 minutos para reinício completo

## ✅ Garantias

1. **Cache sempre limpo:**
   - CSS será sempre recompilado do zero
   - Não há risco de CSS desatualizado

2. **Portas sempre livres:**
   - Todas as portas são limpas antes de reiniciar
   - Não há risco de conflito de portas

3. **Ambiente limpo:**
   - Janelas antigas são fechadas
   - Novas janelas são criadas
   - Ambiente visual organizado

4. **Processos finalizados:**
   - Todos os processos são parados corretamente
   - Não há processos órfãos

## 📊 Comparação com Outros Scripts

| Script | Para Serviços | Limpa Portas | Limpa Cache | Fecha Janelas | Reinicia |
|--------|---------------|--------------|-------------|---------------|----------|
| **Reiniciar Sistema Completo** | ✅ | ✅ | ✅ | ✅ | ✅ |
| Parar Sistema Completo | ✅ | ❌ | Opcional | ❌ | ❌ |
| Iniciar Sistema Completo | ❌ | ✅ | ✅ | ❌ | ✅ |

## 🎯 Quando Usar

### Use `Reiniciar Sistema Completo.ps1` quando:
- ✅ Quiser reiniciar tudo do zero
- ✅ CSS não está carregando
- ✅ Páginas não estão carregando
- ✅ Mudou configurações do Next.js/Tailwind
- ✅ Sistema está com problemas
- ✅ Quer garantir ambiente limpo

### Use `Parar Sistema Completo.ps1` quando:
- ✅ Apenas quiser parar o sistema
- ✅ Não quiser reiniciar

### Use `Iniciar Sistema Completo.ps1` quando:
- ✅ Sistema já está parado
- ✅ Quer iniciar sem parar primeiro

## 🔍 Verificação Pós-Reinício

Após executar o script, verifique:

1. **Servidor está rodando:**
   ```powershell
   Get-NetTCPConnection -LocalPort 3000,3005 -ErrorAction SilentlyContinue
   ```

2. **CSS está compilado:**
   ```powershell
   Test-Path "apps\site-publico\.next\static\css\app\layout.css"
   ```

3. **Acesse no navegador:**
   - Site Público: http://localhost:3000
   - Dashboard Turismo: http://localhost:3005/dashboard

4. **Limpe cache do navegador:**
   - Ctrl+Shift+Delete → Limpar cache
   - Ou Ctrl+F5 (hard refresh)
   - Ou abra em aba anônima

## ⚠️ Importante

- **Aguarde a compilação:** O Next.js precisa de 2-5 minutos para compilar na primeira vez
- **Limpe cache do navegador:** Sempre limpe o cache do navegador após reiniciar
- **Verifique logs:** As janelas do PowerShell mostrarão os logs de compilação
- **Não feche janelas:** Não feche as janelas do PowerShell durante a compilação

## 🐛 Troubleshooting

### Script não fecha todas as janelas
- Algumas janelas podem não ser identificadas corretamente
- Feche manualmente as janelas restantes
- Isso não afeta o funcionamento do sistema

### Portas ainda ocupadas
- Execute `.\scripts\KILL-PORTS.ps1` manualmente
- Verifique se há processos órfãos: `Get-Process node`

### CSS ainda não carrega
- Execute `.\scripts\CORRIGIR-CSS-NAO-CARREGA.ps1`
- Limpe cache do navegador
- Verifique DevTools (F12) → Network → CSS

## 📝 Exemplo de Uso Completo

```powershell
# 1. Reiniciar sistema completo
.\Reiniciar Sistema Completo.ps1 -Forcar

# 2. Aguardar 3-5 minutos para compilação

# 3. Verificar se está rodando
Get-NetTCPConnection -LocalPort 3000,3005

# 4. Acessar no navegador
# http://localhost:3000
# http://localhost:3005/dashboard

# 5. Limpar cache do navegador (Ctrl+F5)
```

## 🎉 Resultado Esperado

Após executar o script:
- ✅ Todos os serviços reiniciados
- ✅ Cache limpo
- ✅ CSS recompilado
- ✅ Janelas antigas fechadas
- ✅ Sistema funcionando perfeitamente

