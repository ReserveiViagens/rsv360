# 🧪 Guia de Testes - Módulo de Orçamentos Parques Hoteis e Atrações

## FASE 10 - TESTES FUNCIONAIS

### ✅ Teste 1: Criação de Orçamento a partir de Template

#### Cenários de Teste:

1. **Carregamento de Template**
   - [ ] Acessar `/cotacoes/templates`
   - [ ] Verificar se templates são carregados (deve ter 157 templates: 90 hotéis + 52 parques + 9 atrações + 6 passeios)
   - [ ] Clicar em "Usar Template" em um template de hotel
   - [ ] Verificar se redireciona para `/cotacoes/from-template/[templateId]`
   - [ ] Verificar se o template é carregado corretamente

2. **Personalização Completa**
   - [ ] Preencher nome do cliente
   - [ ] Preencher email do cliente
   - [ ] Preencher telefone do cliente
   - [ ] Editar título da cotação
   - [ ] Modificar itens (quantidade, preço)
   - [ ] Adicionar/remover fotos
   - [ ] Adicionar/remover vídeos
   - [ ] Editar destaques e benefícios
   - [ ] Adicionar notas importantes

3. **Cálculo Automático**
   - [ ] Verificar se subtotal é calculado automaticamente ao modificar itens
   - [ ] Aplicar desconto (porcentagem)
   - [ ] Verificar se desconto é aplicado corretamente
   - [ ] Aplicar taxa (porcentagem)
   - [ ] Verificar se total final está correto
   - [ ] Testar com desconto fixo e taxa fixa

4. **Salvamento**
   - [ ] Clicar em "Salvar Cotação"
   - [ ] Verificar se aparece mensagem de sucesso
   - [ ] Verificar se redireciona para `/cotacoes/[id]`
   - [ ] Verificar se orçamento aparece no dashboard

5. **Visualização**
   - [ ] Verificar se todos os dados são exibidos corretamente
   - [ ] Verificar se fotos e vídeos aparecem
   - [ ] Verificar layout profissional
   - [ ] Testar botão de impressão
   - [ ] Testar exportação PDF (se implementado)

---

### ✅ Teste 2: Criação de Template

#### Cenários de Teste:

1. **Formulário Completo**
   - [ ] Acessar `/cotacoes/templates/new`
   - [ ] Preencher nome do template
   - [ ] Selecionar categoria principal (hotel, parque, atração, passeio)
   - [ ] Selecionar subcategoria
   - [ ] Upload de thumbnail
   - [ ] Preencher descrição
   - [ ] Adicionar itens
   - [ ] Adicionar fotos
   - [ ] Adicionar destaques e benefícios
   - [ ] Adicionar notas importantes

2. **Categorização**
   - [ ] Verificar se categoria principal é salva corretamente
   - [ ] Verificar se subcategoria é salva corretamente
   - [ ] Verificar se template aparece filtrado por categoria na galeria

3. **Salvamento**
   - [ ] Clicar em "Salvar Template"
   - [ ] Verificar mensagem de sucesso
   - [ ] Verificar se template aparece na galeria
   - [ ] Verificar se pode ser usado para criar orçamento

---

### ✅ Teste 3: Edição de Orçamento

#### Cenários de Teste:

1. **8 Abas de Edição**
   - [ ] Acessar `/cotacoes/[id]/edit`
   - [ ] Verificar presença de 8 abas: Básico, Itens, Financeiro, Galeria, Vídeos, Conteúdo, Contatos, Cabeçalho
   - [ ] Navegar entre todas as abas
   - [ ] Verificar se dados são mantidos ao trocar de aba

2. **Aba Básico**
   - [ ] Editar informações do cliente
   - [ ] Editar título e descrição
   - [ ] Alterar tipo e categoria
   - [ ] Verificar se mudanças são salvas

3. **Aba Itens**
   - [ ] Adicionar novo item
   - [ ] Editar item existente
   - [ ] Remover item
   - [ ] Verificar cálculo automático de total do item
   - [ ] Verificar atualização do subtotal

4. **Aba Financeiro**
   - [ ] Aplicar desconto (porcentagem e fixo)
   - [ ] Aplicar taxa (porcentagem e fixo)
   - [ ] Verificar cálculos automáticos
   - [ ] Verificar total final

5. **Aba Galeria**
   - [ ] Adicionar foto por URL
   - [ ] Editar legenda da foto
   - [ ] Remover foto
   - [ ] Reordenar fotos (drag-drop)

6. **Aba Vídeos**
   - [ ] Adicionar vídeo YouTube (URL completa)
   - [ ] Adicionar vídeo YouTube (URL curta)
   - [ ] Adicionar vídeo YouTube (ID apenas)
   - [ ] Verificar preview do vídeo
   - [ ] Remover vídeo

7. **Aba Conteúdo**
   - [ ] Adicionar/editar destaques
   - [ ] Adicionar/editar benefícios
   - [ ] Usar templates de notas
   - [ ] Criar novo template de nota
   - [ ] Aplicar template de nota
   - [ ] Adicionar nota manualmente

8. **Aba Contatos**
   - [ ] Editar telefone
   - [ ] Editar WhatsApp
   - [ ] Editar email
   - [ ] Editar website

9. **Aba Cabeçalho**
   - [ ] Configurar logo da empresa
   - [ ] Configurar nome da empresa
   - [ ] Configurar cores
   - [ ] Configurar redes sociais

10. **Salvamento Incremental**
    - [ ] Fazer mudança em qualquer aba
    - [ ] Clicar em "Salvar"
    - [ ] Verificar se `updatedAt` é atualizado
    - [ ] Verificar se dados persistem após recarregar página

11. **Preview Atualizado**
    - [ ] Fazer mudança
    - [ ] Abrir preview
    - [ ] Verificar se mudanças aparecem no preview

---

### ✅ Teste 4: Exportação PDF

#### Cenários de Teste:

1. **Impressão Browser**
   - [ ] Acessar visualização de orçamento
   - [ ] Clicar em "Imprimir"
   - [ ] Verificar se layout está correto
   - [ ] Verificar se cores são preservadas
   - [ ] Verificar se imagens aparecem

2. **Layout A4**
   - [ ] Verificar margens A4 (2cm)
   - [ ] Verificar se conteúdo cabe em uma página
   - [ ] Verificar quebras de página inteligentes

3. **Elementos Ocultos**
   - [ ] Verificar se navegação não aparece
   - [ ] Verificar se botões de ação não aparecem
   - [ ] Verificar se apenas conteúdo relevante aparece

4. **Cabeçalho e Rodapé**
   - [ ] Verificar se cabeçalho da empresa aparece
   - [ ] Verificar se rodapé personalizado aparece
   - [ ] Verificar mensagem de validade

---

### ✅ Teste 5: Galeria de Fotos

#### Cenários de Teste:

1. **Upload**
   - [ ] Testar upload de arquivo
   - [ ] Verificar preview da imagem
   - [ ] Verificar se imagem é salva

2. **URL**
   - [ ] Adicionar foto por URL
   - [ ] Verificar se URL é validada
   - [ ] Verificar se imagem é carregada

3. **Legendas**
   - [ ] Adicionar legenda
   - [ ] Editar legenda
   - [ ] Verificar se legenda aparece na visualização

4. **Remover**
   - [ ] Remover foto
   - [ ] Verificar se foto é removida da lista

5. **Reordenar (Drag-Drop)**
   - [ ] Arrastar foto para nova posição
   - [ ] Verificar se ordem é mantida
   - [ ] Verificar se ordem é salva

6. **Estilos Customizáveis**
   - [ ] Verificar opções de estilo
   - [ ] Aplicar estilo diferente
   - [ ] Verificar se estilo é aplicado na visualização

---

### ✅ Teste 6: Galeria de Vídeos

#### Cenários de Teste:

1. **URLs YouTube - Múltiplos Formatos**
   - [ ] Adicionar: `https://www.youtube.com/watch?v=VIDEO_ID`
   - [ ] Adicionar: `https://youtu.be/VIDEO_ID`
   - [ ] Adicionar: `https://youtube.com/embed/VIDEO_ID`
   - [ ] Adicionar: `VIDEO_ID` (apenas ID)
   - [ ] Verificar se todos os formatos são aceitos

2. **Extração de ID**
   - [ ] Verificar se ID é extraído corretamente de cada formato
   - [ ] Verificar se ID é usado para embed

3. **Preview**
   - [ ] Verificar se preview mostra vídeo corretamente
   - [ ] Verificar se vídeo é embedável

4. **Remover**
   - [ ] Remover vídeo
   - [ ] Verificar se vídeo é removido da lista

---

### ✅ Teste 7: Templates de Notas

#### Cenários de Teste:

1. **Criar Template**
   - [ ] Acessar aba "Conteúdo" na edição
   - [ ] Clicar em "Criar Template"
   - [ ] Preencher nome
   - [ ] Preencher conteúdo
   - [ ] Salvar
   - [ ] Verificar se template aparece na lista

2. **Editar Template**
   - [ ] Clicar em editar template
   - [ ] Modificar conteúdo
   - [ ] Salvar
   - [ ] Verificar se mudanças foram salvas

3. **Excluir Template**
   - [ ] Excluir template
   - [ ] Confirmar exclusão
   - [ ] Verificar se template foi removido

4. **Aplicar Template**
   - [ ] Selecionar template
   - [ ] Clicar em "Aplicar"
   - [ ] Verificar se conteúdo foi adicionado às notas importantes
   - [ ] Verificar se pode editar nota após aplicar

---

## FASE 11 - VALIDAÇÃO TÉCNICA

### ✅ Validação TypeScript

```bash
cd frontend
npx tsc --noEmit
```

- [ ] Verificar se não há erros de tipo
- [ ] Corrigir todos os erros encontrados

### ✅ Validação localStorage

1. **Limites de Armazenamento**
   - [ ] Verificar se localStorage tem espaço suficiente
   - [ ] Testar com 5MB de dados
   - [ ] Testar com 10MB de dados
   - [ ] Verificar tratamento de erro quando excede limite

2. **Persistência de Dados**
   - [ ] Criar orçamento
   - [ ] Recarregar página
   - [ ] Verificar se orçamento persiste
   - [ ] Limpar localStorage
   - [ ] Recarregar página
   - [ ] Verificar se templates padrão são recarregados

3. **Versionamento de Templates**
   - [ ] Verificar versão inicial (1.0.0)
   - [ ] Modificar versão em `default-templates.ts`
   - [ ] Recarregar página
   - [ ] Verificar se templates são atualizados

### ✅ Validação Responsividade

1. **Mobile (640px)**
   - [ ] Testar dashboard em mobile
   - [ ] Testar criação de orçamento em mobile
   - [ ] Testar edição em mobile
   - [ ] Verificar se sidebar vira drawer
   - [ ] Verificar touch targets (mínimo 44px)

2. **Tablet (768px)**
   - [ ] Testar layout em tablet
   - [ ] Verificar se elementos estão bem distribuídos
   - [ ] Verificar se formulários são usáveis

3. **Desktop (1024px+)**
   - [ ] Testar layout em desktop
   - [ ] Verificar se sidebar funciona corretamente
   - [ ] Verificar se há espaço suficiente

---

## Checklist Rápido

- [ ] Templates são carregados na inicialização
- [ ] Orçamento pode ser criado a partir de template
- [ ] Orçamento pode ser criado do zero
- [ ] Cálculos automáticos funcionam
- [ ] Galeria de fotos funciona
- [ ] Galeria de vídeos funciona
- [ ] Templates de notas funcionam
- [ ] Edição funciona em todas as 8 abas
- [ ] Salvamento persiste dados
- [ ] Visualização está correta
- [ ] Impressão/PDF funciona
- [ ] Responsividade funciona em todos os dispositivos
- [ ] TypeScript não apresenta erros
- [ ] localStorage funciona corretamente

---

## Notas de Teste

Data: ___________
Testador: ___________
Versão Testada: ___________

### Problemas Encontrados:

1. 
2. 
3. 

### Observações:

- 

