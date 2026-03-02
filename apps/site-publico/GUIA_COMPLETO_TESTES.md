# 🧪 GUIA COMPLETO DE TESTES - SISTEMA RSV 360

**Data:** 02/12/2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para Execução

---

## 🚀 PASSO 1: INICIAR O SISTEMA

### Comando PowerShell:
```powershell
cd "D:\servidor RSV"
.\iniciarsistemacrmesite.ps1
```

### Serviços que serão iniciados:
1. **Sistema (Dashboard)** - Porta 3001
2. **CRM e Site** - Porta 3000
3. **Backend Principal** - Porta 5000
4. **Backend Admin APIs** - Porta 5002

---

## 📋 PASSO 2: LISTA COMPLETA DE PÁGINAS PARA TESTAR

### 🏠 PÁGINAS PÚBLICAS (Site)

#### Página Inicial
- **URL:** `http://localhost:3000/`
- **Descrição:** Homepage do site
- **O que verificar:**
  - ✅ Carrega sem erros
  - ✅ Imagens carregam corretamente
  - ✅ Navegação funciona
  - ✅ Sem erros no console

#### Hotéis
- **URL:** `http://localhost:3000/hoteis`
- **Descrição:** Listagem de hotéis
- **O que verificar:**
  - ✅ Lista de hotéis carrega
  - ✅ Filtros funcionam
  - ✅ Cards de hotéis exibem corretamente
  - ✅ Mapas funcionam (se aplicável)
  - ✅ Sem erros de ícones

#### Detalhes do Hotel
- **URL:** `http://localhost:3000/hoteis/[id]`
- **Exemplo:** `http://localhost:3000/hoteis/1`
- **Descrição:** Página de detalhes de um hotel específico
- **O que verificar:**
  - ✅ Informações do hotel carregam
  - ✅ Galeria de imagens funciona
  - ✅ Formulário de reserva funciona
  - ✅ Mapas interativos funcionam

#### Promoções
- **URL:** `http://localhost:3000/promocoes`
- **Descrição:** Listagem de promoções
- **O que verificar:**
  - ✅ Lista de promoções carrega
  - ✅ Cards de promoções exibem corretamente
  - ✅ Filtros funcionam

#### Atrações
- **URL:** `http://localhost:3000/atracoes`
- **Descrição:** Listagem de atrações
- **O que verificar:**
  - ✅ Lista de atrações carrega
  - ✅ Cards de atrações exibem corretamente
  - ✅ Filtros funcionam

#### Ingressos
- **URL:** `http://localhost:3000/ingressos`
- **Descrição:** Listagem de ingressos
- **O que verificar:**
  - ✅ Lista de ingressos carrega
  - ✅ Cards de ingressos exibem corretamente

#### Buscar
- **URL:** `http://localhost:3000/buscar`
- **Descrição:** Página de busca
- **O que verificar:**
  - ✅ Campo de busca funciona
  - ✅ Resultados exibem corretamente

#### Contato
- **URL:** `http://localhost:3000/contato`
- **Descrição:** Página de contato
- **O que verificar:**
  - ✅ Formulário de contato funciona
  - ✅ Campos validam corretamente

#### Política de Privacidade
- **URL:** `http://localhost:3000/politica-privacidade`
- **Descrição:** Política de privacidade
- **O que verificar:**
  - ✅ Conteúdo carrega corretamente

---

### 🔐 PÁGINAS DE AUTENTICAÇÃO

#### Login
- **URL:** `http://localhost:3000/login`
- **Descrição:** Página de login
- **O que verificar:**
  - ✅ Formulário de login funciona
  - ✅ Validação de campos funciona
  - ✅ Redirecionamento após login

#### Recuperar Senha
- **URL:** `http://localhost:3000/recuperar-senha`
- **Descrição:** Recuperação de senha
- **O que verificar:**
  - ✅ Formulário funciona
  - ✅ Validação de email funciona

#### Redefinir Senha
- **URL:** `http://localhost:3000/redefinir-senha`
- **Descrição:** Redefinição de senha
- **O que verificar:**
  - ✅ Formulário funciona
  - ✅ Validação de senha funciona

---

### 👤 PÁGINAS DO USUÁRIO (Requer Login)

#### Dashboard
- **URL:** `http://localhost:3000/dashboard`
- **Descrição:** Dashboard do usuário
- **O que verificar:**
  - ✅ Métricas carregam
  - ✅ Gráficos exibem corretamente
  - ✅ Navegação funciona

#### Perfil
- **URL:** `http://localhost:3000/perfil`
- **Descrição:** Perfil do usuário
- **O que verificar:**
  - ✅ Informações do usuário carregam
  - ✅ Formulário de edição funciona

#### Minhas Reservas
- **URL:** `http://localhost:3000/minhas-reservas`
- **Descrição:** Lista de reservas do usuário
- **O que verificar:**
  - ✅ Lista de reservas carrega
  - ✅ Filtros funcionam
  - ✅ Detalhes de reserva funcionam

#### Mensagens
- **URL:** `http://localhost:3000/mensagens`
- **Descrição:** Mensagens do usuário
- **O que verificar:**
  - ✅ Lista de mensagens carrega
  - ✅ Envio de mensagens funciona

#### Notificações
- **URL:** `http://localhost:3000/notificacoes`
- **Descrição:** Notificações do usuário
- **O que verificar:**
  - ✅ Lista de notificações carrega
  - ✅ Marcar como lida funciona

#### Avaliações
- **URL:** `http://localhost:3000/avaliacoes`
- **Descrição:** Avaliações do usuário
- **O que verificar:**
  - ✅ Lista de avaliações carrega
  - ✅ Formulário de avaliação funciona

#### Wishlists
- **URL:** `http://localhost:3000/wishlists`
- **Descrição:** Listas de desejos
- **O que verificar:**
  - ✅ Lista de wishlists carrega
  - ✅ Criar/editar wishlist funciona

#### Cupons
- **URL:** `http://localhost:3000/cupons`
- **Descrição:** Cupons do usuário
- **O que verificar:**
  - ✅ Lista de cupons carrega
  - ✅ Aplicar cupom funciona

#### Fidelidade
- **URL:** `http://localhost:3000/fidelidade`
- **Descrição:** Programa de fidelidade
- **O que verificar:**
  - ✅ Pontos carregam
  - ✅ Histórico de pontos funciona

---

### 🛠️ PÁGINAS ADMINISTRATIVAS (Requer Login Admin)

#### Login Admin
- **URL:** `http://localhost:3000/admin/login`
- **Credenciais:** 
  - Email: `admin@example.com` (ou conforme configurado)
  - Senha: `admin123` (ou conforme configurado)
- **Cookie:** `admin_token=admin-token-123`
- **O que verificar:**
  - ✅ Login funciona
  - ✅ Redirecionamento após login

#### CMS Dashboard
- **URL:** `http://localhost:3000/admin/cms`
- **Descrição:** Painel de gerenciamento de conteúdo
- **O que verificar:**
  - ✅ Dashboard carrega sem erros
  - ✅ Todos os ícones exibem corretamente
  - ✅ Navegação entre seções funciona
  - ✅ Sem erros no console
  - ✅ Sem erros de ChunkLoadError

#### Admin Dashboard
- **URL:** `http://localhost:3000/admin/dashboard`
- **Descrição:** Dashboard administrativo
- **O que verificar:**
  - ✅ Métricas carregam
  - ✅ Gráficos exibem corretamente

#### Admin Profile
- **URL:** `http://localhost:3000/admin/profile`
- **Descrição:** Perfil do administrador
- **O que verificar:**
  - ✅ Informações carregam
  - ✅ Formulário de edição funciona

#### Admin Uploads
- **URL:** `http://localhost:3000/admin/uploads`
- **Descrição:** Gerenciamento de uploads
- **O que verificar:**
  - ✅ Lista de uploads carrega
  - ✅ Upload de arquivos funciona

#### Admin Health
- **URL:** `http://localhost:3000/admin/health`
- **Descrição:** Status de saúde do sistema
- **O que verificar:**
  - ✅ Status do sistema exibe corretamente

#### Admin Analytics
- **URL:** `http://localhost:3000/admin/analytics/advanced`
- **Descrição:** Analytics avançado
- **O que verificar:**
  - ✅ Gráficos carregam
  - ✅ Métricas exibem corretamente

#### Admin Chat
- **URL:** `http://localhost:3000/admin/chat`
- **Descrição:** Chat administrativo
- **O que verificar:**
  - ✅ Chat carrega
  - ✅ Envio de mensagens funciona

---

### 📊 OUTRAS PÁGINAS

#### Dashboard Estatísticas
- **URL:** `http://localhost:3000/dashboard-estatisticas`
- **Descrição:** Dashboard de estatísticas
- **O que verificar:**
  - ✅ Estatísticas carregam
  - ✅ Gráficos exibem corretamente

#### Dashboard RSV
- **URL:** `http://localhost:3000/dashboard-rsv`
- **Descrição:** Dashboard RSV
- **O que verificar:**
  - ✅ Dashboard carrega
  - ✅ Métricas exibem corretamente

#### Trips
- **URL:** `http://localhost:3000/trips`
- **Descrição:** Lista de viagens
- **O que verificar:**
  - ✅ Lista de viagens carrega
  - ✅ Criar viagem funciona

#### Insurance
- **URL:** `http://localhost:3000/insurance`
- **Descrição:** Seguros
- **O que verificar:**
  - ✅ Página carrega
  - ✅ Formulário funciona

#### Check-in
- **URL:** `http://localhost:3000/checkin`
- **Descrição:** Check-in
- **O que verificar:**
  - ✅ Formulário de check-in funciona

#### Onboarding
- **URL:** `http://localhost:3000/onboarding`
- **Descrição:** Onboarding de novos usuários
- **O que verificar:**
  - ✅ Fluxo de onboarding funciona

#### Verification
- **URL:** `http://localhost:3000/verification`
- **Descrição:** Verificação de identidade
- **O que verificar:**
  - ✅ Formulário de verificação funciona

---

## ✅ CHECKLIST DE VERIFICAÇÃO DE ERROS

### Console do Navegador
Para cada página, verificar:

- [ ] **Sem erros de ChunkLoadError**
- [ ] **Sem erros de ícones não encontrados**
- [ ] **Sem erros de `Cannot read properties of undefined`**
- [ ] **Sem erros de `require is not defined`**
- [ ] **Sem erros de imagens não configuradas**
- [ ] **Sem erros de módulos não encontrados**
- [ ] **Sem warnings críticos**

### Funcionalidades
Para cada página, verificar:

- [ ] **Página carrega completamente**
- [ ] **Todos os ícones exibem corretamente**
- [ ] **Imagens carregam corretamente**
- [ ] **Formulários funcionam**
- [ ] **Navegação funciona**
- [ ] **Filtros funcionam (se aplicável)**
- [ ] **Botões funcionam**
- [ ] **Links funcionam**

### Performance
- [ ] **Tempo de carregamento aceitável (< 3s)**
- [ ] **Sem travamentos**
- [ ] **Animações suaves**
- [ ] **Transições funcionam**

---

## 🔍 VERIFICAÇÃO ESPECÍFICA - CORREÇÕES APLICADAS

### 1. ChunkLoadError
**Verificar em:**
- `http://localhost:3000/admin/cms`
- `http://localhost:3000/hoteis`
- Qualquer página que use ícones do lucide-react

**O que verificar:**
- ✅ Não deve aparecer erro `ChunkLoadError`
- ✅ Todos os ícones devem carregar
- ✅ Console sem erros relacionados a chunks

### 2. Ícones
**Verificar em:**
- Todas as páginas admin
- Páginas com mapas
- Páginas com formulários

**O que verificar:**
- ✅ Todos os ícones exibem corretamente
- ✅ Não há ícones quebrados
- ✅ Não há erros de `is not exported`

### 3. Imagens
**Verificar em:**
- Páginas com imagens de hotéis
- Páginas com galerias
- Páginas com avatares

**O que verificar:**
- ✅ Imagens carregam de Vercel Blob Storage
- ✅ Não há erros de `hostname not configured`
- ✅ Imagens exibem corretamente

---

## 📝 TEMPLATE DE RELATÓRIO DE TESTE

Para cada página testada, preencher:

```
PÁGINA: [URL]
DATA: [Data/Hora]
STATUS: ✅ PASSOU / ❌ FALHOU

ERROS ENCONTRADOS:
- [Lista de erros]

OBSERVAÇÕES:
- [Observações]

SCREENSHOTS:
- [Links para screenshots se necessário]
```

---

## 🎯 PRIORIDADE DE TESTES

### 🔴 ALTA PRIORIDADE (Testar Primeiro)
1. `http://localhost:3000/admin/cms` - CMS Dashboard
2. `http://localhost:3000/hoteis` - Página de hotéis
3. `http://localhost:3000/` - Homepage
4. `http://localhost:3000/admin/login` - Login admin

### 🟡 MÉDIA PRIORIDADE
5. `http://localhost:3000/promocoes` - Promoções
6. `http://localhost:3000/atracoes` - Atrações
7. `http://localhost:3000/ingressos` - Ingressos
8. `http://localhost:3000/dashboard` - Dashboard usuário

### 🟢 BAIXA PRIORIDADE
9. Outras páginas conforme necessário

---

## 🚨 AÇÕES EM CASO DE ERRO

### Se encontrar ChunkLoadError:
1. Parar o servidor (Ctrl+C)
2. Limpar cache: `Remove-Item -Recurse -Force .next`
3. Reiniciar servidor
4. Testar novamente

### Se encontrar erro de ícone:
1. Verificar se o ícone está no barrel file
2. Adicionar ao barrel file se necessário
3. Reiniciar servidor
4. Testar novamente

### Se encontrar erro de imagem:
1. Verificar `next.config.mjs`
2. Adicionar hostname aos `remotePatterns` se necessário
3. Reiniciar servidor
4. Testar novamente

---

**Versão:** 1.0  
**Data:** 02/12/2025  
**Status:** ✅ Pronto para uso

