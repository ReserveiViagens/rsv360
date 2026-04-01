# 🤝 Guia de Contribuição

Obrigado por seu interesse em contribuir com RSV360! Este documento orienta como participar do projeto.

## 📋 Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Começar](#como-começar)
3. [Processo de Contribuição](#processo-de-contribuição)
4. [Padrões de Código](#padrões-de-código)
5. [Commits](#commits)
6. [Pull Requests](#pull-requests)
7. [Reporte de Bugs](#reporte-de-bugs)

---

## 📜 Código de Conduta

Somos comprometidos com um ambiente inclusivo e respeitoso. Todos são bem-vindos, independente de:

- Background técnico
- Identidade e expressão
- Experiência
- Educação
- Status socioeconômico
- Nacionalidade
- Aparência pessoal
- Raça
- Religião
- Identidade ou orientação sexual

### Comportimento Esperado

- ✅ Use linguagem inclusiva e respeitosa
- ✅ Aceite críticas construtivas
- ✅ Foque no bem do projeto
- ✅ Mostre empatia com outros contribuidores

### Comportamento Inaceitável

- ❌ Assédio ou discriminação
- ❌ Linguagem agressiva ou insultuosa
- ❌ Ataques pessoais
- ❌ Spam ou conteúdo malicioso

---

## 🚀 Como Começar

### 1. Fork o Repositório

```bash
# Ir para https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo
# Clicar em "Fork"
```

### 2. Clonar Seu Fork

```bash
git clone https://github.com/seu-usuario/PMS-CRM-RSV360-Versao-Oficial-definitivo.git
cd "PMS-CRM-RSV360-Versao-Oficial-definitivo"
```

### 3. Adicionar Remote Upstream

```bash
git remote add upstream https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo.git
git fetch upstream
```

### 4. Criar Branch de Desenvolvimento

```bash
git checkout -b feature/minha-feature upstream/main
# ou
git checkout -b fix/meu-bug upstream/main
```

### 5. Instalar Dependências

```bash
npm install --workspaces
```

---

## 🔧 Processo de Contribuição

### Step 1: Identificar Oportunidade

- 🐛 Encontrou um bug? Abra uma issue
- ✨ Tem uma ideia? Faça uma discussão
- 📚 Quer melhorar docs? Comece direto!

### Step 2: Trabalhar em Sua Feature

```bash
# Certificar-se que está atualizado
git fetch upstream
git rebase upstream/main

# Fazer mudanças em seu editor
# Testar localmente
npm run test
npm run lint
```

### Step 3: Commit

```bash
git add .
git commit -m "feat: adicionar nova funcionalidade"
```

### Step 4: Push

```bash
git push origin feature/minha-feature
```

### Step 5: Pull Request

- Ir para o repositório original
- Clicar em "New Pull Request"
- Selecionar seu branch
- Preencher template do PR

### Step 6: Code Review

- Responder a comentários
- Fazer mudanças solicitadas
- Re-request review

### Step 7: Merge

Após aprovação, seu PR será mergeado! 🎉

---

## 📝 Padrões de Código

### TypeScript

```typescript
// ✅ Bom
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<User | null> {
  try {
    return await db.users.findById(id);
  } catch (error) {
    logger.error('Failed to get user', { userId: id, error });
    throw new UserError('User not found');
  }
}

// ❌ Ruim
async function getUser(id) {
  let user = db.users.findById(id);
  return user;
}
```

### React/Next.js

```tsx
// ✅ Bom
interface UserCardProps {
  userId: string;
  onSelect?: (id: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  userId, 
  onSelect 
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return (
    <div className="user-card">
      {user && <h2>{user.name}</h2>}
    </div>
  );
};

// ❌ Ruim
export const UserCard = (props) => {
  return <div>{props.name}</div>;
};
```

### SQL/Migrations

```sql
-- ✅ Bom
ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX idx_users_email ON users(email);

-- ❌ Ruim
ALTER TABLE users ADD created_at DATE;
```

### Estilos

- Use CSS Modules ou Tailwind
- Mobile-first responsive design
- Acessibilidade (WCAG 2.1 AA)

---

## 📌 Commits

### Formato de Commit

```
type(scope): descrição curta

corpo mais detalhado se necessário

Fixes #123
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, sem mudança lógica
- `refactor`: Refatoração de código
- `perf`: Melhorias de performance
- `test`: Testes
- `chore`: Dependências, build, etc

### Exemplos

```bash
# Feature
git commit -m "feat(auth): implementar login com google"

# Bug fix
git commit -m "fix(api): corrigir erro 500 ao buscar usuários"

# Documentation
git commit -m "docs(readme): adicionar instruções de setup"

# Refactor
git commit -m "refactor(components): simplificar logica de dropdown"
```

---

## 🔄 Pull Requests

### Template

```markdown
## Descrição
Breve descrição do que foi mudado e por quê.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Mudança na documentação

## Como foi testado?
Descreva os testes realizados.

## Checklist
- [ ] Meu código segue as guidelines do projeto
- [ ] Rodei `npm run lint` sem erros
- [ ] Rodei `npm run test` com sucesso
- [ ] Adicionar testes para novas funcionalidades
- [ ] Atualizar documentação se necessário

## Imagens/Vídeos (se aplicável)
Adicione screenshots ou GIFs mostrando as mudanças
```

### Boas Práticas

- ✅ Um PR = Uma funcionalidade
- ✅ Títulos descritivos
- ✅ Descrição clara do "por quê"
- ✅ Testes incluídos
- ✅ Sem merge de main antes de review
- ❌ Evite PRs gigantes (> 500 linhas)

---

## 🐛 Reporte de Bugs

### Antes de Abrir Issue

- Busque issues existentes
- Verifique a documentação
- Tente reproduzir em ambiente limpo

### Template de Bug

```markdown
## Descrição
Um resumo claro do bug.

## Como Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

## Comportamento Esperado
O que deveria acontecer.

## Comportamento Atual
O que aconteceu.

## Ambiente
- OS: Windows 11
- Node: 18.0.0
- navegador: Chrome 120
- Versão do projeto: main

## Logs de Erro
```
Adicione logs/stack traces aqui
```

## Screenshots
Se aplicável, adicione screenshots.
```

---

## 📚 Recursos

- [Documentação Completa](../DOCUMENTACAO_COMPLETA_SISTEMA.md)
- [README de Setup](../README-SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)

---

## ❓ Dúvidas?

- 📧 Email: dev@rsv360.com.br
- 💬 Discussions: GitHub Discussions
- 🐤 Twitter: @rsv360
- 💬 Discord: [nosso servidor]

---

**Obrigado por contribuir! 🙏**

Juntos fazemos RSV360 melhor a cada dia! 🚀
