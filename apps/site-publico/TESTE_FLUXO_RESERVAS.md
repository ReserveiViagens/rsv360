# 🧪 TESTE DO FLUXO COMPLETO DE RESERVAS

## 📋 Checklist de Testes

### ✅ 1. Preparação
- [ ] Banco de dados configurado
- [ ] Tabelas criadas (bookings, payments, users)
- [ ] Variáveis de ambiente configuradas (.env.local)
- [ ] Servidor Next.js rodando (`npm run dev`)

---

### ✅ 2. Teste de Busca

**URL:** http://localhost:3000/buscar

**Ações:**
1. [ ] Página carrega corretamente
2. [ ] Campo de busca funciona
3. [ ] Filtros (tipo, preço, hóspedes) funcionam
4. [ ] Lista de hotéis é exibida
5. [ ] Botão "Ver Detalhes" funciona
6. [ ] Botão "RESERVAR AGORA" funciona

**Resultado esperado:** Lista de hotéis com opções de filtro funcionando.

---

### ✅ 3. Teste de Detalhes do Hotel

**URL:** http://localhost:3000/hoteis/[id]

**Ações:**
1. [ ] Página carrega com dados do hotel
2. [ ] Galeria de imagens funciona
3. [ ] Informações do hotel são exibidas
4. [ ] Seletor de datas funciona
5. [ ] Seletor de hóspedes funciona
6. [ ] Cálculo de preço está correto
7. [ ] Botão "Reservar" funciona

**Resultado esperado:** Página de detalhes completa com opções de reserva.

---

### ✅ 4. Teste de Formulário de Reserva

**URL:** http://localhost:3000/reservar/[id]

**Ações:**
1. [ ] Formulário carrega com dados pré-preenchidos
2. [ ] Campos obrigatórios são validados
3. [ ] Seleção de método de pagamento funciona
4. [ ] Desconto PIX é aplicado corretamente
5. [ ] Resumo de preços está correto
6. [ ] Checkbox de termos funciona
7. [ ] Botão "Confirmar Reserva" funciona

**Resultado esperado:** Formulário completo e funcional.

---

### ✅ 5. Teste de Criação de Reserva (API)

**Endpoint:** POST /api/bookings

**Teste via Postman/Insomnia ou pelo formulário:**

```json
{
  "booking_type": "hotel",
  "item_id": 1,
  "item_name": "Hotel Teste",
  "check_in": "2025-12-20",
  "check_out": "2025-12-23",
  "adults": 2,
  "children": 0,
  "infants": 0,
  "customer": {
    "name": "João Silva",
    "email": "joao@teste.com",
    "phone": "(64) 99999-9999",
    "document": "123.456.789-00"
  },
  "prices": {
    "subtotal": 1000,
    "discount": 50,
    "taxes": 0,
    "service_fee": 0,
    "total": 950
  },
  "payment_method": "pix"
}
```

**Resultado esperado:**
- Status 201 Created
- Código de reserva gerado
- Dados salvos no banco
- QR Code PIX gerado (se método for PIX)

---

### ✅ 6. Teste de Página de Confirmação

**URL:** http://localhost:3000/reservar/[id]/confirmacao?code=RSV-...

**Ações:**
1. [ ] Página carrega com dados da reserva
2. [ ] Código de reserva é exibido
3. [ ] Informações do hotel são exibidas
4. [ ] Datas e hóspedes são exibidos
5. [ ] QR Code PIX é exibido (se método for PIX)
6. [ ] Código PIX pode ser copiado
7. [ ] Botão "Compartilhar" funciona
8. [ ] Botão "Baixar Comprovante" funciona
9. [ ] Link "Minhas Reservas" funciona

**Resultado esperado:** Página de confirmação completa com todas as informações.

---

### ✅ 7. Teste de Listagem de Reservas

**URL:** http://localhost:3000/minhas-reservas

**Ações:**
1. [ ] Página carrega
2. [ ] Reservas são listadas (se houver)
3. [ ] Filtros funcionam
4. [ ] Busca funciona
5. [ ] Status das reservas é exibido corretamente
6. [ ] Botão "Cancelar" funciona (se aplicável)
7. [ ] Botão "Baixar" funciona

**Resulte esperado:** Lista de reservas com opções de ação.

---

### ✅ 8. Teste de Busca de Reserva por Código

**Endpoint:** GET /api/bookings/[code]

**Teste:**
```
GET http://localhost:3000/api/bookings/RSV-20251126-123456-0001
```

**Resultado esperado:**
- Status 200 OK
- Dados completos da reserva
- Informações de pagamento (se houver)

---

### ✅ 9. Teste de Cancelamento

**Endpoint:** POST /api/bookings/[code]/cancel

**Teste:**
```json
POST http://localhost:3000/api/bookings/RSV-20251126-123456-0001/cancel
{
  "reason": "Cancelado pelo cliente"
}
```

**Resultado esperado:**
- Status 200 OK
- Reserva marcada como cancelada
- Pagamento cancelado
- Status atualizado no banco

---

### ✅ 10. Teste de Autenticação

**URL:** http://localhost:3000/login

**Ações:**
1. [ ] Página de login carrega
2. [ ] Aba "Entrar" funciona
3. [ ] Aba "Cadastrar" funciona
4. [ ] Login funciona
5. [ ] Cadastro funciona
6. [ ] Token é salvo no localStorage
7. [ ] Redirecionamento após login funciona

**Resultado esperado:** Sistema de autenticação funcional.

---

### ✅ 11. Teste de Perfil

**URL:** http://localhost:3000/perfil

**Ações:**
1. [ ] Página carrega (ou redireciona para login)
2. [ ] Dados do usuário são exibidos
3. [ ] Edição de dados funciona
4. [ ] Salvamento funciona
5. [ ] Logout funciona

**Resultado esperado:** Página de perfil funcional.

---

## 🐛 Problemas Comuns e Soluções

### Erro: "Cannot connect to database"
- Verifique se o PostgreSQL está rodando
- Verifique as credenciais no `.env.local`
- Verifique se o banco existe

### Erro: "Table does not exist"
- Execute o script SQL novamente
- Verifique se as tabelas foram criadas

### Erro: "JWT secret not found"
- Adicione `JWT_SECRET` no `.env.local`
- Reinicie o servidor Next.js

### QR Code PIX não aparece
- Verifique se o método de pagamento é "pix"
- Verifique os logs da API
- Em desenvolvimento, o QR Code é mockado

### Reserva não aparece em "Minhas Reservas"
- Verifique se o e-mail da reserva corresponde
- Verifique se a API está retornando dados
- Verifique o console do navegador

---

## ✅ Critérios de Sucesso

O sistema está funcionando corretamente se:

1. ✅ Todas as páginas carregam sem erros
2. ✅ Formulários validam e salvam dados
3. ✅ API retorna respostas corretas
4. ✅ Dados são salvos no banco de dados
5. ✅ QR Code PIX é gerado (quando aplicável)
6. ✅ Reservas aparecem em "Minhas Reservas"
7. ✅ Cancelamento funciona
8. ✅ Autenticação funciona

---

## 📊 Resultado Final

Após completar todos os testes:

- [ ] Todos os testes passaram
- [ ] Sistema está funcional
- [ ] Pronto para uso

**Status:** ⬜ Em Teste | ✅ Aprovado | ❌ Com Problemas

---

## 🎉 Próximos Passos

Após aprovação dos testes:

1. Configurar credenciais reais do Mercado Pago
2. Configurar envio de e-mails
3. Configurar notificações WhatsApp
4. Deploy em produção
5. Monitoramento e logs

