# Links e Comandos - Sistema RSV360°

## Comando para iniciar tudo (sincronizado)

**Opção 1 – Caminho completo:**
```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial definitivo"
& ".\Iniciar Sistema Completo.ps1"
```

**Opção 2 – A partir da pasta pai (Backup rsv36-servidor-oficial...):**
```powershell
cd "RSV360 Versao Oficial definitivo"
.\Iniciar Sistema Completo.ps1
```

**Uma linha:**
```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial definitivo"; .\Iniciar Sistema Completo.ps1
```

O script sobe em sequência: PostgreSQL, Backend Principal (5000), Backend Admin (5002), 32 microserviços e os frontends (Site Público, Dashboard Turismo, Frontend Oficial).

**Alternativa (só NPM Workspaces, sem PostgreSQL/SRE):**
```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial definitivo"
.\Iniciar Sistema Completo (Workspaces).ps1
```
Este script inicia Backends, 32 microserviços, Site Público e Dashboard Turismo via `npm run dev --workspace=...`, além do Frontend Oficial (3001).

---

## Reiniciar apenas o backend

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial definitivo\backend"
npm run dev
```

## Liberar porta 5000 (se estiver em uso)

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial definitivo"
.\scripts\LIBERAR-PORTA-5000.ps1
```

---

# Links completos do Sistema RSV360°

## FRONTENDS (Next.js)

| Serviço | URL | Porta |
|--------|-----|-------|
| Site Público (Home) | http://localhost:3000 | 3000 |
| CMS Admin | http://localhost:3000/admin/cms | 3000 |
| Login Admin | http://localhost:3000/admin/login | 3000 |
| Dashboard Admin | http://localhost:3000/admin/dashboard | 3000 |
| Login | http://localhost:3000/login | 3000 |
| Cotação | http://localhost:3000/cotacao | 3000 |
| Buscar | http://localhost:3000/buscar | 3000 |
| Hotéis | http://localhost:3000/hoteis | 3000 |
| Leilões | http://localhost:3000/leiloes | 3000 |
| Flash Deals | http://localhost:3000/flash-deals | 3000 |
| Marketplace | http://localhost:3000/marketplace | 3000 |
| Termos | http://localhost:3000/termos | 3000 |
| Privacidade | http://localhost:3000/privacidade | 3000 |
| Documentação API | http://localhost:3000/api-docs | 3000 |
| Dashboard Turismo | http://localhost:3005 | 3005 |
| Dashboard Turismo (cotas) | http://localhost:3005/dashboard | 3005 |
| Frontend Oficial | http://localhost:3001 | 3001 |
| Contrato Spazzio diRoma | http://localhost:3001/reservei/contrato-spazzio-diroma | 3001 |

### Novas aplicações (criadas no projeto)

| Aplicação | URL | Descrição |
|-----------|-----|-----------|
| Frontend RSV360 Servidor Oficial | http://localhost:3001 | Next.js na porta 3001 (módulos Reservei, cotações, etc.) |
| Contrato Spazzio diRoma | http://localhost:3001/reservei/contrato-spazzio-diroma | Formulário + geração de PDF do contrato de locação Reservei – Spazzio diRoma |

O script **Iniciar Sistema Completo.ps1** já sobe o frontend na porta 3001; após iniciar, use os links acima.

## BACKENDS (Node.js)

| Serviço | URL | Porta |
|--------|-----|-------|
| Backend Principal | http://localhost:5000 | 5000 |
| Health Check Backend | http://localhost:5000/health | 5000 |
| Backend Admin/CMS | http://localhost:5002 | 5002 |
| Health Check Admin | http://localhost:5002/health | 5002 |

## MICROSSERVIÇOS (portas 6000–6031)

| Serviço | URL | Porta |
|--------|-----|-------|
| core-api | http://localhost:6000/health | 6000 |
| user-management | http://localhost:6001/health | 6001 |
| hotel-management | http://localhost:6002/health | 6002 |
| travel-api | http://localhost:6003/health | 6003 |
| booking-engine | http://localhost:6004/health | 6004 |
| finance-api | http://localhost:6005/health | 6005 |
| tickets-api | http://localhost:6006/health | 6006 |
| payments-gateway | http://localhost:6007/health | 6007 |
| ecommerce-api | http://localhost:6008/health | 6008 |
| attractions-api | http://localhost:6009/health | 6009 |
| vouchers-api | http://localhost:6010/health | 6010 |
| voucher-editor | http://localhost:6011/health | 6011 |
| giftcards-api | http://localhost:6012/health | 6012 |
| coupons-api | http://localhost:6013/health | 6013 |
| parks-api | http://localhost:6014/health | 6014 |
| maps-api | http://localhost:6015/health | 6015 |
| visa-processing | http://localhost:6016/health | 6016 |
| marketing-api | http://localhost:6017/health | 6017 |
| subscriptions | http://localhost:6018/health | 6018 |
| seo-api | http://localhost:6019/health | 6019 |
| multilingual | http://localhost:6020/health | 6020 |
| videos-api | http://localhost:6021/health | 6021 |
| photos-api | http://localhost:6022/health | 6022 |
| admin-panel | http://localhost:6023/health | 6023 |
| analytics-api | http://localhost:6024/health | 6024 |
| reports-api | http://localhost:6025/health | 6025 |
| data-management | http://localhost:6026/health | 6026 |
| notifications | http://localhost:6027/health | 6027 |
| reviews-api | http://localhost:6028/health | 6028 |
| rewards-api | http://localhost:6029/health | 6029 |
| loyalty-api | http://localhost:6030/health | 6030 |
| sales-api | http://localhost:6031/health | 6031 |

## OUTROS SERVIÇOS

| Serviço | URL | Porta |
|--------|-----|-------|
| Agentes SRE (Monitoramento) | http://localhost:5050 | 5050 |

## BANCO DE DADOS (PostgreSQL)

| Parâmetro | Valor |
|-----------|--------|
| Host | localhost |
| Porta | 5432 ou 5433 |
| Database | rsv360 |
| pgAdmin | Host=localhost, Port=5432, Database=rsv360 |

---

## Outras páginas do site público (porta 3000)

- http://localhost:3000/perfil
- http://localhost:3000/minhas-reservas
- http://localhost:3000/recuperar-senha
- http://localhost:3000/dashboard
- http://localhost:3000/dashboard-rsv
- http://localhost:3000/booking
- http://localhost:3000/cupons
- http://localhost:3000/group-travel
- http://localhost:3000/insurance
- http://localhost:3000/quality
- http://localhost:3000/onboarding
- http://localhost:3000/crm
- http://localhost:3000/analytics
- http://localhost:3000/loyalty
- http://localhost:3000/fidelidade
- http://localhost:3000/notificacoes
- http://localhost:3000/hoteis/[id]
- http://localhost:3000/leiloes/[id]

## Login Admin (uma linha)

```
http://localhost:3000/admin/login?from=%2Fadmin%2Fcms
```

- **Email:** admin@rsv360.local  
- **Senha:** md_XHRC8S-Cjf5J-Z8bJ6O3s
