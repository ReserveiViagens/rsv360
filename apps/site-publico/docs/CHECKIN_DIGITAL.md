# 📱 Sistema de Check-in/Check-out Digital

## Visão Geral

O sistema de Check-in/Check-out Digital permite que hóspedes realizem check-in e check-out de forma totalmente digital, com verificação de documentos, geração de QR codes e integração com fechaduras inteligentes.

## Funcionalidades Principais

### 1. Solicitação de Check-in
- Criação automática ou manual de solicitação de check-in
- Geração automática de código único
- Integração com sistema de reservas

### 2. Upload e Verificação de Documentos
- Upload de documentos (RG, CPF, CNH, Passaporte, Selfie)
- Verificação automática via provedores externos (Unico, IDwall)
- Verificação manual por staff/admin

### 3. QR Code e Códigos de Acesso
- Geração automática de QR code para check-in
- Códigos de acesso para fechaduras inteligentes
- Validação de códigos por staff na recepção

### 4. Vistoria
- Vistoria pré-check-in (estado da propriedade antes)
- Vistoria pós-check-out (estado da propriedade depois)
- Registro de danos e itens faltando

### 5. Notificações
- Email automático em cada etapa do processo
- Notificações para hóspede e host
- WebSocket para atualizações em tempo real

## Estrutura de Dados

### Tabela: `digital_checkins`
Armazena informações principais do check-in:
- `id`: ID único
- `booking_id`: ID da reserva relacionada
- `property_id`: ID da propriedade
- `user_id`: ID do hóspede
- `check_in_code`: Código único do check-in
- `qr_code`: QR code em base64
- `status`: Status atual (pending, documents_pending, verified, checked_in, checked_out, cancelled)
- `check_in_at`: Data/hora do check-in realizado
- `check_out_at`: Data/hora do check-out realizado
- `documents_verified`: Se documentos foram verificados
- `metadata`: Dados adicionais em JSON

### Tabela: `checkin_documents`
Armazena documentos enviados:
- `id`: ID único
- `checkin_id`: ID do check-in
- `document_type`: Tipo (rg, cpf, cnh, passport, selfie, contract, other)
- `file_name`: Nome do arquivo
- `file_path`: Caminho do arquivo
- `is_verified`: Se foi verificado
- `verified_by`: ID do usuário que verificou
- `verified_at`: Data/hora da verificação

### Tabela: `checkin_inspections`
Armazena vistorias:
- `id`: ID único
- `checkin_id`: ID do check-in
- `inspection_type`: Tipo (before_checkin, after_checkout)
- `condition`: Estado da propriedade (excellent, good, fair, poor)
- `notes`: Observações
- `damages`: Danos identificados
- `missing_items`: Itens faltando
- `photos`: URLs das fotos

### Tabela: `checkin_access_codes`
Armazena códigos de acesso para fechaduras:
- `id`: ID único
- `checkin_id`: ID do check-in
- `lock_id`: ID da fechadura
- `code`: Código de acesso
- `valid_from`: Data de início da validade
- `valid_until`: Data de fim da validade
- `used`: Se foi usado
- `used_at`: Data/hora de uso

## API Endpoints

### POST `/api/checkin/request`
Cria uma nova solicitação de check-in.

**Body:**
```json
{
  "booking_id": 100,
  "property_id": 50,
  "scheduled_checkin_date": "2024-12-25",
  "scheduled_checkin_time": "14:00",
  "guest_notes": "Chegarei às 14h"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "check_in_code": "CHK-ABC123",
    "qr_code": "data:image/png;base64,...",
    "qr_code_url": "https://example.com/qr.png",
    "status": "pending"
  }
}
```

### GET `/api/checkin/[id]`
Obtém detalhes de um check-in específico.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 100,
    "status": "pending",
    "documents": [...],
    "access_codes": [...],
    "inspections": [...]
  }
}
```

### POST `/api/checkin/[id]/documents`
Faz upload de um documento.

**Body (FormData):**
- `file`: Arquivo (JPG, PNG ou PDF)
- `document_type`: Tipo do documento
- `checkin_id`: ID do check-in

### POST `/api/checkin/[id]/verify`
Verifica documentos e processa check-in.

**Body:**
```json
{
  "checkin_id": 1,
  "verify_documents": true
}
```

### POST `/api/checkin/[id]/checkout`
Processa check-out.

**Body:**
```json
{
  "checkin_id": 1,
  "condition": "good",
  "notes": "Tudo em ordem",
  "damages": null,
  "missing_items": null
}
```

### POST `/api/checkin/scan`
Escanear QR code (apenas staff/admin).

**Body:**
```json
{
  "code": "CHK-ABC123"
}
```

## Fluxo de Uso

### Para Hóspedes:

1. **Criação de Check-in**
   - Check-in pode ser criado automaticamente após reserva confirmada
   - Ou criado manualmente pelo hóspede

2. **Upload de Documentos**
   - Hóspede faz upload dos documentos necessários
   - Sistema verifica automaticamente (ou aguarda verificação manual)

3. **Verificação**
   - Após documentos verificados, check-in fica pronto
   - QR code e códigos de acesso são gerados

4. **Check-in Real**
   - Hóspede usa QR code ou código na propriedade
   - Staff escaneia QR code ou valida código

5. **Check-out**
   - Hóspede ou staff inicia check-out
   - Vistoria é realizada
   - Check-out é finalizado

### Para Staff/Admin:

1. **Visualização de Check-ins**
   - Lista de todos os check-ins pendentes
   - Filtros por status, propriedade, data

2. **Verificação de Documentos**
   - Revisar documentos enviados
   - Aprovar ou rejeitar

3. **Escanear QR Code**
   - Usar página de scan para validar check-ins
   - Ver informações completas do hóspede

4. **Vistoria**
   - Realizar vistoria antes e depois
   - Registrar danos e itens faltando

## Integração com Reservas

O check-in pode ser criado automaticamente após uma reserva ser confirmada. Para habilitar:

```env
AUTO_CREATE_CHECKIN=true
```

Quando habilitado, o sistema:
1. Cria check-in automaticamente após reserva com `payment_status = 'paid'`
2. Envia notificação ao hóspede
3. Notifica o host/proprietário

## Integração com Smart Locks

O sistema integra com fechaduras inteligentes para gerar códigos de acesso:

- **Intelbras**: Suporte via API
- **Garen**: Suporte via API
- **Yale**: Suporte via API
- **August**: Suporte via API

Códigos são gerados automaticamente quando:
- Check-in é processado
- Propriedade possui fechadura configurada

## Notificações

O sistema envia notificações por email em:

1. **Check-in Criado**: Quando solicitação é criada
2. **Documentos Verificados**: Quando documentos são aprovados
3. **Check-in Realizado**: Quando check-in é processado
4. **Check-out Realizado**: Quando check-out é finalizado

## Segurança

- Autenticação JWT obrigatória em todos os endpoints
- Validação de permissões (owner, admin, staff)
- Verificação de documentos com provedores confiáveis
- Códigos de acesso com validade limitada
- QR codes com expiração

## Testes

### Testes Unitários
```bash
npm test -- checkin-service.test.ts
```

### Testes de API
```bash
npm test -- checkin.test.ts
```

### Testes E2E
```bash
npm run test:e2e -- checkin.spec.ts
```

## Configuração

### Variáveis de Ambiente

```env
# Auto-criar check-in após reserva
AUTO_CREATE_CHECKIN=false

# Provedor de verificação de documentos
DOCUMENT_VERIFICATION_PROVIDER=unico  # unico, idwall, manual

# Configurações de Smart Locks
SMART_LOCK_PROVIDER=intelbras  # intelbras, garen, yale, august

# URL da aplicação (para links em emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Troubleshooting

### Check-in não é criado automaticamente
- Verificar se `AUTO_CREATE_CHECKIN=true`
- Verificar se reserva tem `payment_status = 'paid'`
- Verificar se `user_id` existe na reserva

### QR code não é gerado
- Verificar se biblioteca `qrcode` está instalada
- Verificar permissões de escrita para cache
- Verificar logs de erro

### Documentos não são verificados
- Verificar configuração do provedor
- Verificar credenciais da API
- Verificar formato dos arquivos enviados

## Próximos Passos

- [ ] Integração com mais provedores de verificação
- [ ] Suporte a múltiplos idiomas
- [ ] App mobile para scan de QR codes
- [ ] Dashboard de analytics de check-ins
- [ ] Integração com sistemas de pagamento para depósitos

