# Wireframes textuais para guest & admin

## 1. Guest dashboard (`/`)
- **Topo**: barra com logo RSV, menu hamburguer (mobile), dropdown do usuário (perfil/sair).  
- **Corpo**: cards de resumo (reservas ativas, próximas viagens, saldo de créditos), seção “Próximas ações” (botão reservar/cancelar).  
- **Rodapé**: links úteis (contato, suporte).

## 2. Reservas (`/reservas`)
- **Controle de filtros**: datas, status (pendente/confirmado/cancelado), destino.  
- **Lista**: cada item mostra hóspede, data, status, botão “Detalhes”.  
- **Detalhes**: modal com datas, valor, opção “Cancelar reserva” (com validação de política).  
- **Integração**: botão “Contato” abre modal com WhatsApp/telefone, “Ver pagamento” direciona para CRM interno.

## 3. Histórico & notificações (`/historico`, `/notificacoes`)
- **Histórico**: timeline cronológica de interações (reservas, cancelamentos, mensagens).  
- **Notificações**: painel com badges (novo, lido), CTA “Marcar como lido” e “Ver detalhes da reserva”.

## 4. Admin dashboard (`/admin/dashboard`)
- **Resumo KPI**: cards (reservas pendentes, aprovações pendentes, receita do dia, alertas).  
- **Gráfico**: linha de reservas/dia (pode ser mockado).  
- **Ações rápidas**: botões “Aprovar lotes”, “Gerar relatório”.

## 5. Admin reservas (`/admin/reservas`)
- **Tabela**: colunas (pedido, hóspede, status, origem, data de criação).  
- **Filtro lateral**: status, destino, faixa de datas, responsável.  
- **Row actions**: aprovar/rejeitar, abrir formulário de edição.  
- **Detalhes expandido**: logs de auditoria (quem, quando, motivo).

## 6. Admin relatórios e logs (`/admin/relatorios`)
- **Filtros**: período, tipo de ação, usuário.  
- **Tabela de logs**: carrega ações (criadas/desativadas/alteradas).  
- **Export**: botão “Exportar CSV” (integração futura com backend).  
- **Notification center**: mostra eventos críticos recentes.

## 7. Integrações (pagamentos, notificações, CRM)
- **Pagamentos**: cards com status de pagamento (saldo, pendências).  
- **Notificações**: feed com alertas automáticos do backend.  
- **CRM**: link para perfil do hóspede no módulo principal; exibe badge “VIP” ou “Bloqueado”.
