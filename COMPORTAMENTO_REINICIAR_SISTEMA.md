# 📋 COMPORTAMENTO DO SCRIPT DE REINICIAR SISTEMA

**Data:** 2026-01-02  
**Script:** `Reiniciar Sistema Completo.ps1`

---

## ⚠️ COMPORTAMENTO ATUAL

### **O que o script faz:**

1. **Para os processos Node.js** que estão rodando nas portas:
   - Microserviços (6000-6031)
   - Dashboard Turismo (3005)
   - Site Público (3000)

2. **Tenta fechar janelas PowerShell órfãs** (vazias, sem processos Node.js filhos)

3. **Cria NOVAS janelas PowerShell** para reiniciar os serviços

### **Resultado:**

- ❌ **NÃO reutiliza** as janelas PowerShell existentes
- ✅ **Fecha** as janelas órfãs (quando possível)
- ✅ **Cria novas janelas** para os serviços reiniciados

---

## 🔍 POR QUE NÃO REUTILIZA AS JANELAS?

**Limitações técnicas do PowerShell:**

1. **Não há API nativa** para enviar comandos a janelas PowerShell existentes
2. **Cada janela é um processo independente** - não há comunicação direta entre elas
3. **Identificar qual janela** está associada a qual serviço é complexo e não confiável

---

## ✅ SOLUÇÕES DISPONÍVEIS

### **Opção 1: Usar o script atual (Recomendado)**
- O script tenta fechar janelas órfãs automaticamente
- Cria novas janelas limpas
- **Vantagem:** Funciona de forma confiável
- **Desvantagem:** Pode deixar algumas janelas antigas abertas

### **Opção 2: Fechar manualmente antes de reiniciar**
```powershell
# 1. Fechar janelas PowerShell antigas manualmente
# 2. Executar o script de reiniciar
.\Reiniciar Sistema Completo.ps1
```

### **Opção 3: Usar Parar + Iniciar separadamente**
```powershell
# 1. Parar tudo (fecha processos, mas não janelas)
.\Parar Sistema Completo.ps1

# 2. Fechar janelas PowerShell manualmente (se necessário)

# 3. Iniciar novamente
.\Iniciar Sistema Completo.ps1
```

---

## 🎯 RECOMENDAÇÃO

**Para evitar janelas duplicadas:**

1. **Antes de reiniciar:** Feche manualmente as janelas PowerShell antigas (opcional)
2. **Execute o script:** `.\Reiniciar Sistema Completo.ps1`
3. **O script tentará fechar** janelas órfãs automaticamente
4. **Novas janelas serão criadas** para os serviços reiniciados

---

## 📝 NOTAS TÉCNICAS

### **Como o script identifica janelas órfãs:**

1. Encontra processos Node.js nas portas
2. Tenta identificar o processo PowerShell pai
3. Verifica se o PowerShell pai não tem mais processos Node.js filhos
4. Fecha o PowerShell órfão

### **Limitações:**

- ⚠️ Nem sempre consegue identificar corretamente qual janela pertence a qual serviço
- ⚠️ Pode deixar algumas janelas abertas se houver múltiplas janelas PowerShell
- ⚠️ Janelas PowerShell que não foram criadas pelo script não serão fechadas

---

## 🔄 ALTERNATIVA FUTURA

Para uma solução mais robusta, seria necessário:

1. **Usar um gerenciador de processos** como PM2 ou nodemon
2. **Criar um serviço Windows** para gerenciar os processos
3. **Usar Docker** para isolar e gerenciar os serviços

---

**Última Atualização:** 2026-01-02  
**Status:** ✅ Script melhorado - Tenta fechar janelas órfãs automaticamente

