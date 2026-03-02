# 📱 Guia de Uso - Check-in/Check-out Digital

**Versão:** 1.0  
**Data:** 03/12/2025

---

## 📋 Visão Geral

O sistema de Check-in/Check-out Digital permite que hóspedes realizem check-in e check-out de forma totalmente digital, utilizando QR codes e validação de documentos.

---

## 🎯 Funcionalidades Principais

### 1. Solicitação de Check-in
- Criação de solicitação de check-in digital
- Geração automática de QR code
- Código único de check-in

### 2. Validação de Documentos
- Upload de documentos (RG, CPF, CNH, Passaporte)
- Verificação automática de documentos
- Selfie para verificação facial

### 3. QR Code
- Geração automática de QR code
- Download do QR code
- Compartilhamento do QR code

### 4. Códigos de Acesso
- Geração de códigos para smart locks
- Códigos PIN
- Códigos NFC

### 5. Vistoria Digital
- Vistoria antes do check-in
- Vistoria após check-out
- Upload de fotos
- Notas e observações

### 6. Processamento
- Processamento de check-in
- Processamento de check-out
- Histórico completo

---

## 🚀 Como Usar

### Para Hóspedes

#### 1. Solicitar Check-in

1. Acesse a página de check-in
2. Selecione sua reserva
3. Clique em "Solicitar Check-in"
4. Aguarde a geração do QR code

#### 2. Enviar Documentos

1. Acesse a página do seu check-in
2. Vá para a aba "Documentos"
3. Faça upload dos documentos necessários:
   - RG ou CNH
   - CPF
   - Selfie (opcional)
   - Comprovante de endereço (se necessário)

#### 3. Verificar Status

1. Acompanhe o status do check-in:
   - **Pending**: Aguardando documentos
   - **Documents Pending**: Documentos enviados, aguardando verificação
   - **Verified**: Documentos verificados
   - **Checked In**: Check-in realizado
   - **Checked Out**: Check-out realizado

#### 4. Realizar Check-in

1. Após verificação dos documentos
2. Clique em "Processar Check-in"
3. Receba os códigos de acesso
4. Use o QR code ou código PIN para acessar a propriedade

#### 5. Realizar Check-out

1. Antes de sair, acesse a página do check-in
2. Clique em "Check-out"
3. Preencha a vistoria (fotos e notas)
4. Confirme o check-out

---

### Para Staff/Proprietários

#### 1. Escanear QR Code

1. Acesse `/checkin/scan`
2. Escaneie o QR code do hóspede
3. Visualize informações do check-in
4. Verifique documentos

#### 2. Verificar Documentos

1. Acesse a página do check-in
2. Vá para a aba "Documentos"
3. Revise cada documento
4. Aprove ou rejeite documentos

#### 3. Processar Check-in Manualmente

1. Se necessário, processe check-in manualmente
2. Adicione códigos de acesso
3. Atualize status

---

## 📡 APIs Disponíveis

### POST /api/checkin/request
Cria uma nova solicitação de check-in.

**Request:**
```json
{
  "booking_id": 1,
  "user_id": 1,
  "property_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 1,
    "check_in_code": "CHK-123456",
    "status": "pending",
    "qr_code": "data:image/png;base64,...",
    "qr_code_url": "data:image/svg+xml;base64,..."
  }
}
```

### GET /api/checkin/[id]
Obtém informações de um check-in específico.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 1,
    "status": "checked_in",
    "check_in_code": "CHK-123456",
    "documents": [...],
    "access_codes": [...],
    "inspections": [...]
  }
}
```

### POST /api/checkin/[id]/qr-code
Regenera o QR code de um check-in.

**Response:**
```json
{
  "success": true,
  "data": {
    "qr_code": "data:image/png;base64,...",
    "qr_code_url": "data:image/svg+xml;base64,..."
  }
}
```

### POST /api/checkin/[id]/documents
Faz upload de documentos.

**Request (multipart/form-data):**
- `document`: Arquivo
- `document_type`: Tipo do documento (rg, cpf, cnh, etc)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "document_type": "rg",
    "document_url": "https://...",
    "is_verified": false
  }
}
```

### POST /api/checkin/[id]/verify
Verifica documentos e processa check-in.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "verified",
    "documents_verified": true,
    "access_codes": [...]
  }
}
```

### POST /api/checkin/[id]/checkout
Processa check-out.

**Request:**
```json
{
  "notes": "Tudo em ordem",
  "photos": ["https://..."],
  "damages": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "checked_out",
    "check_out_at": "2025-12-03T10:00:00Z"
  }
}
```

### POST /api/checkin/scan
Escaneia QR code (para staff).

**Request:**
```json
{
  "qr_code_data": "CHK-123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkin": {...},
    "booking": {...},
    "user": {...}
  }
}
```

---

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=onboarding_rsv_db
DB_USER=onboarding_rsv
DB_PASSWORD=senha_segura_123

# Storage (para upload de documentos)
STORAGE_PROVIDER=local
STORAGE_PATH=./uploads/checkin
```

---

## 🧪 Testes

### Testes Unitários
```bash
npm test components/checkin
```

### Testes de API
```bash
npm test app/api/checkin
```

### Testes E2E
```bash
npm run test:e2e tests/e2e/checkin.spec.ts
```

---

## 🐛 Troubleshooting

### QR Code não é gerado
- Verificar se `qrcode` está instalado: `npm list qrcode`
- Verificar logs do servidor
- Verificar permissões de escrita

### Documentos não são verificados
- Verificar se serviço de verificação está configurado
- Verificar logs de verificação
- Verificar formato dos documentos

### Check-in não processa
- Verificar se todos os documentos foram verificados
- Verificar status do check-in
- Verificar logs do servidor

---

## 📚 Recursos Adicionais

- [Documentação da API](./CHECKIN_SWAGGER.yaml)
- [Guia de Integração](./CHECKIN_INTEGRACAO.md)
- [FAQ](./CHECKIN_FAQ.md)

---

**Última atualização:** 03/12/2025

