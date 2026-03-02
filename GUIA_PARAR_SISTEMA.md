# 🛑 Guia: Parar Sistema Completo RSV360

**Data:** 2025-01-05

---

## 📋 Visão Geral

O script `Parar Sistema Completo.ps1` é uma ferramenta completa para parar todos os serviços do sistema RSV360, incluindo microserviços, dashboard de turismo e site público, além de limpar processos órfãos e fechar janelas relacionadas.

---

## 🚀 Como Usar

### Uso Básico (com confirmação)

```powershell
.\Parar Sistema Completo.ps1
```

O script solicitará confirmação antes de parar os serviços.

---

### Uso Forçado (sem confirmação)

```powershell
.\Parar Sistema Completo.ps1 -Forcar
```

Para todos os serviços imediatamente, sem solicitar confirmação.

---

### Uso com Limpar Cache

```powershell
.\Parar Sistema Completo.ps1 -LimparCache
```

Para os serviços e limpa o cache do Next.js após parar.

---

### Uso Completo (Forçar + Limpar Cache)

```powershell
.\Parar Sistema Completo.ps1 -Forcar -LimparCache
```

Combina ambas as opções: força o encerramento e limpa o cache.

---

### Ver Ajuda

```powershell
.\Parar Sistema Completo.ps1 -Ajuda
```

Exibe informações de uso e opções disponíveis.

---

## ⚙️ O que o Script Faz

### 1. Para Todos os Serviços

#### Microserviços (portas 6000-6031)
- Identifica processos rodando nas portas 6000-6031
- Para cada processo encontrado
- Conta quantos microserviços foram parados

#### Dashboard Turismo (porta 3005)
- Identifica processo na porta 3005
- Para o processo do dashboard de turismo
- Informa o PID do processo parado

#### Site Público (porta 3000)
- Identifica processo na porta 3000
- Para o processo do site público
- Informa o PID do processo parado

---

### 2. Limpa Processos Órfãos

- Identifica processos Node.js que não estão mais usando as portas do sistema
- Para processos órfãos automaticamente
- Garante que não há processos Node.js abandonados

---

### 3. Fecha Janelas do PowerShell

#### Identificação de Janelas Relacionadas

O script identifica janelas relacionadas ao sistema através de:

**Por título da janela:**
- Contém "npm", "node", "dev", "start"
- Contém "site-publico", "turismo", "microservice"
- Contém "RSV360"
- Contém números de porta: "3000", "3005", "6000"

**Por processos filhos:**
- Verifica se o processo PowerShell tem processos Node.js filhos

**Por caminho do processo:**
- Verifica se o processo está rodando na pasta do projeto RSV360

#### Fechamento de Janelas

1. **Tentativa graciosa:** Tenta fechar a janela normalmente
2. **Forçar se necessário:** Se a janela não fechar, força o encerramento
3. **Contagem:** Informa quantas janelas foram fechadas

---

### 4. Limpa Cache (Opcional)

Se usar a opção `-LimparCache`:

- Limpa cache do Next.js para:
  - `site-publico`
  - `turismo`
- Remove pastas `.next` e cache de build
- **Nota:** O CSS será recompilado na próxima inicialização

---

## 📊 Saída do Script

### Durante a Execução

O script exibe informações em tempo real:

```
========================================
PARANDO SISTEMA COMPLETO RSV360
========================================

1. Parando Microserviços (portas 6000-6031)...
  [OK] X microserviços parados

2. Parando Dashboard Turismo (porta 3005)...
  [OK] Dashboard Turismo parado (PID: XXXX)

3. Parando Site Público (porta 3000)...
  [OK] Site Público parado (PID: XXXX)

4. Limpando processos Node.js órfãos...
  [OK] X processos órfãos parados

5. Fechando janelas do PowerShell relacionadas...
  Fechando: [Título da Janela] (PID: XXXX)
  [OK] X janelas fechadas

5. Limpando cache do Next.js... (se -LimparCache)
  [OK] Cache do Next.js limpo
```

### Resumo Final

```
========================================
[OK] SISTEMA COMPLETO PARADO!
========================================

Resumo:
  - Processos parados: X
  - Janelas fechadas: X
  - Cache limpo: Sim/Não

Para reiniciar, execute:
  .\Iniciar Sistema Completo.ps1
  .\Reiniciar Sistema Completo.ps1
```

---

## 🔍 Verificações

### Verificar se os Serviços Foram Parados

Após executar o script, você pode verificar:

```powershell
# Verificar portas em uso
Get-NetTCPConnection -LocalPort 3000,3005,6000-6031 -ErrorAction SilentlyContinue

# Verificar processos Node.js
Get-Process node -ErrorAction SilentlyContinue
```

Se tudo foi parado corretamente:
- Nenhuma conexão nas portas 3000, 3005, 6000-6031
- Nenhum processo Node.js rodando (ou apenas processos não relacionados)

---

## ⚠️ Avisos Importantes

### 1. Confirmação

- **Sem `-Forcar`:** O script solicita confirmação antes de parar
- **Com `-Forcar`:** Para imediatamente sem confirmação

### 2. Janelas do PowerShell

- O script fecha apenas janelas relacionadas ao sistema
- Janelas de outros projetos não serão fechadas
- A janela atual pode ser fechada se estiver relacionada

### 3. Cache do Next.js

- **Com `-LimparCache`:** O cache é limpo, mas a próxima inicialização será mais lenta
- **Sem `-LimparCache`:** O cache é mantido, inicialização mais rápida

### 4. Processos Órfãos

- O script identifica processos órfãos automaticamente
- Apenas processos não relacionados às portas do sistema são considerados órfãos

---

## 🐛 Solução de Problemas

### Problema: Processos não param

**Solução:**
```powershell
# Usar -Forcar para forçar o encerramento
.\Parar Sistema Completo.ps1 -Forcar
```

### Problema: Janelas não fecham

**Solução:**
- O script tenta fechar graciosamente primeiro
- Se não funcionar, força o encerramento automaticamente
- Verifique se você tem permissões adequadas

### Problema: Cache não é limpo

**Solução:**
- Verifique se o script `LIMPAR-CACHE-NEXTJS.ps1` existe em `scripts/`
- Execute manualmente se necessário:
```powershell
.\scripts\LIMPAR-CACHE-NEXTJS.ps1 -Apps @("site-publico", "turismo")
```

### Problema: Portas ainda em uso

**Solução:**
```powershell
# Verificar processos específicos
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Parar manualmente se necessário
Stop-Process -Id [PID] -Force
```

---

## 📝 Exemplos de Uso

### Exemplo 1: Parar com Confirmação

```powershell
PS> .\Parar Sistema Completo.ps1

Tem certeza que deseja parar todos os serviços? (S/N)
S

[Script executa e para todos os serviços]
```

### Exemplo 2: Parar Forçado

```powershell
PS> .\Parar Sistema Completo.ps1 -Forcar

[Script executa imediatamente sem confirmação]
```

### Exemplo 3: Parar e Limpar Cache

```powershell
PS> .\Parar Sistema Completo.ps1 -LimparCache

[Script para serviços e limpa cache]
```

### Exemplo 4: Parar Forçado e Limpar Cache

```powershell
PS> .\Parar Sistema Completo.ps1 -Forcar -LimparCache

[Script executa tudo imediatamente]
```

---

## 🔗 Scripts Relacionados

- **`Iniciar Sistema Completo.ps1`** - Inicia todos os serviços
- **`Reiniciar Sistema Completo.ps1`** - Reinicia todos os serviços
- **`scripts/LIMPAR-CACHE-NEXTJS.ps1`** - Limpa cache do Next.js

---

## 📌 Notas Técnicas

### Portas Monitoradas

- **3000:** Site Público
- **3005:** Dashboard Turismo
- **6000-6031:** Microserviços (32 portas)

### Processos Identificados

- **Node.js:** Processos `node.exe`
- **PowerShell:** Processos `powershell.exe` com janelas relacionadas

### Cache Limpo

- **`.next`:** Cache de build do Next.js
- **`node_modules/.cache`:** Cache de dependências (se existir)

---

## ✅ Checklist de Uso

- [ ] Confirmar que deseja parar os serviços (ou usar `-Forcar`)
- [ ] Verificar se há trabalho não salvo
- [ ] Executar o script
- [ ] Verificar resumo final
- [ ] Confirmar que portas estão livres
- [ ] (Opcional) Limpar cache se necessário

---

**Última atualização:** 2025-01-05
