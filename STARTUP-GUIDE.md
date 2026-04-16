# STARTUP-GUIDE.md

## Guia de Inicialização do Sistema RSV360

### Pré-requisitos
- Node.js v24.14.0 ou superior
- npm v11.9.0 ou superior
- Windows PowerShell

### Passos para Inicialização

1. **Confirmar Workspace**
   - Execute: `Get-Location`
   - Deve mostrar: `D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\temp-repo-fresh`
   - Execute: `Get-ChildItem -Name | Select-String -Pattern "^(package\.json|apps|backend|packages)$"`
   - Deve listar os 4 itens.

2. **Instalar Dependências**
   ```powershell
   npm install
   ```
   - Aguarde a conclusão (cerca de 14 segundos).

3. **Verificar Arquivos .env**
   - Raiz: .env ✅
   - backend: .env ❌ (criar se necessário)
   - apps/site-publico: .env ✅
   - apps/turismo: .env ❌ (criar se necessário)

4. **Iniciar Serviços Individuais**

   **Backend:**
   ```powershell
   cd backend
   npm run dev
   ```
   - Porta: 3001
   - Status esperado: "RSV360 PMS running on port 3001"

   **Site-Publico:**
   ```powershell
   cd apps/site-publico
   npm run dev
   ```
   - Porta: 3000
   - URL: http://localhost:3000
   - ⚠️ Pode mostrar warning SWC (ignorar, é não-bloqueante).

   **Turismo:**
   ```powershell
   cd apps/turismo
   npm run dev
   ```
   - Porta: 3005
   - URL: http://localhost:3005
   - ⚠️ Mesmo warning SWC.

5. **Iniciar Tudo de Uma Vez (Opcional)**
   ```powershell
   npm run dev
   ```
   - Inicia backend e todos os apps simultaneamente.

### URLs de Acesso
- Site Público: http://localhost:3000
- Turismo: http://localhost:3005
- Backend API: http://localhost:3001

### Troubleshooting
- **Erro SWC**: Ignorar, usa fallback WASM.
- **Vulnerabilidades**: Execute `npm audit fix` para correções automáticas.
- **Arquivos .env faltantes**: Copie de .env.example ou consulte documentação.

### Comandos Úteis
- Parar tudo: `npm run stop` (se configurado)
- Reiniciar: Execute novamente os comandos de dev.
- Logs: Verifique console de cada terminal.

### Status Atual
✅ Todos os serviços iniciam com sucesso.
⚠️ Warnings não críticos presentes.</content>
<parameter name="filePath">d:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\temp-repo-fresh\STARTUP-GUIDE.md