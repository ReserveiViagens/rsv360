---
name: Dependency Audit Update
about: Planejar e acompanhar atualizações de dependências sinalizadas pelo `npm audit`.
title: '[Audit] '
labels: audit, dependencies
assignees: ''
---

## Contexto
- Dependência(s) com vulnerabilidade: <!-- ex.: next, nodemailer, jspdf -->
- Vulnerabilidades reportadas e links do audit: <!-- cole o trecho relevante -->
- Breaking change previsto com `npm audit fix --force`: <!-- sim/não e o que muda -->

## Plano de atualização
- [ ] Documentei no README/planos como a mudança impacta o stack.
- [ ] Identifiquei arquivos/componentes afetados (rotas, mailers, PDF, build).
- [ ] Testei localmente (`npm run dev`, `npm run test`, qualquer script específico).
- [ ] Atualizei o `package-lock.json` e ciclone reproduzido.
- [ ] Fiz rollback caso a atualização quebre comportamentos críticos.

## Validação
- [ ] `npm audit` deixa de reportar a vulnerabilidade alvo.
- [ ] Todos os testes relevantes passam (`npm run test`, Playwright se houver).
- [ ] Documentei na base de conhecimento (docs/guest-admin-plan ou similar) qualquer ação adicional.

## Observações
- Dependências alternativas consideradas ou notas adicionais.
