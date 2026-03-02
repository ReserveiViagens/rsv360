# 📋 INSTRUÇÕES: Como Executar o Script Corretamente

## ✅ CONFIRMADO: O Comando Funciona!

O script de teste `TESTE_INICIAR_BACKEND.ps1` criou **3 janelas PowerShell com sucesso**, confirmando que:
- ✅ O comando `Start-Process powershell` funciona
- ✅ As janelas são criadas corretamente
- ✅ O problema está no script principal não executando essas linhas

---

## 🔍 PROBLEMA IDENTIFICADO

O script principal `Iniciar Sistema Completo.ps1` pode estar:
1. **Falhando silenciosamente** antes de chegar nas partes que criam janelas
2. **Sendo executado em background** e não mostrando erros
3. **Tendo algum problema de execução** que impede a criação das janelas

---

## 🚀 SOLUÇÃO: Execute o Script Diretamente (Não em Background)

### **Opção 1: Executar no PowerShell Normal**

1. Abra o PowerShell normalmente (não como administrador)
2. Navegue até o diretório:
   ```powershell
   cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial definitivo"
   ```
3. Execute o script:
   ```powershell
   .\Iniciar Sistema Completo.ps1
   ```

### **Opção 2: Executar com Logs Visíveis**

Execute o script e veja os logs em tempo real:
```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial definitivo"
.\Iniciar Sistema Completo.ps1 | Tee-Object -FilePath "execucao.log"
```

### **Opção 3: Executar o Script de Teste Primeiro**

Para verificar se as janelas estão sendo criadas:
```powershell
.\TESTE_INICIAR_BACKEND.ps1
```

Se o script de teste criar as janelas, então o problema está no script principal.

---

## 📊 STATUS ATUAL

- ✅ **Script de teste:** Funciona perfeitamente (3 janelas criadas)
- ⚠️ **Script principal:** Pode estar falhando silenciosamente
- ✅ **Comando Start-Process:** Funciona corretamente

---

## 🔧 PRÓXIMOS PASSOS

1. **Execute o script principal diretamente** no PowerShell (não em background)
2. **Observe os logs** que aparecem no console
3. **Verifique se há erros** antes das partes que criam janelas
4. **Confirme se as janelas aparecem** após alguns segundos

---

## ⚠️ SE AS JANELAS AINDA NÃO APARECEREM

1. Verifique a política de execução:
   ```powershell
   Get-ExecutionPolicy
   ```
   Se for `Restricted`, execute:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. Execute como Administrador:
   - Clique com botão direito no PowerShell
   - Selecione "Executar como administrador"
   - Execute o script novamente

3. Verifique se há erros no console do script principal

---

**Status:** ✅ Comando funciona, problema está no script principal  
**Solução:** Execute o script diretamente no PowerShell para ver os logs
