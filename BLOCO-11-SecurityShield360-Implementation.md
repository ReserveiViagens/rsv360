# 🤖 BLOCO 11: SecurityShield360 - Implementation Prompt
## GitHub Copilot - Security Architecture Implementation

**Data:** 13 de Abril de 2026  
**Versão:** 1.0  
**Prioridade:** 🔴 CRITICAL  
**Tempo Estimado:** 4-6 semanas  

---

## 🎯 MISSÃO CRITICAL

Implementar a arquitetura completa de segurança **RSV360 SecurityShield360** com 7 camadas de proteção, focando em **Zero Trust Architecture** com **Cloudflare Access** como gatekeeper principal.

**IMPORTANTE:** Esta implementação deve ser feita em **ETAPAS SEQUENCIAIS** para não quebrar a produção. Cada etapa deve ser **testada exaustivamente** antes de avançar.

---

## 🏗️ IMPLEMENTATION ROADMAP - 7 ETAPAS

### 🔥 ETAPA 1: FOUNDATION - Zero Trust Setup (Semana 1)
**Objetivo:** Estabelecer base Zero Trust com Cloudflare Access

**Tarefas Técnicas:**
```bash
# 1. Configurar Cloudflare Access
terraform apply -target=cloudflare_access_application
terraform apply -target=cloudflare_access_policy

# 2. Configurar Microsoft Entra ID integration
az ad app create --display-name "RSV360 Security"
az ad app credential reset --id $APP_ID

# 3. Migrar secrets para Azure Key Vault
az keyvault secret set --vault-name rsv360-kv --name db-password --value $DB_PASSWORD
az keyvault secret set --vault-name rsv360-kv --name jwt-secret --value $JWT_SECRET

# 4. Atualizar aplicações para usar Key Vault
# Modificar .env files para referenciar Key Vault
DATABASE_URL="keyvault://rsv360-kv/db-password"
JWT_SECRET="keyvault://rsv360-kv/jwt-secret"
```

**Deliverables:**
- [ ] Cloudflare Access configurado
- [ ] Microsoft Entra ID integrado
- [ ] Azure Key Vault populado
- [ ] Aplicações migradas para Key Vault

---

### 🛡️ ETAPA 2: NETWORK SECURITY - Edge Protection (Semana 2)
**Objetivo:** Implementar proteção de rede completa

**Tarefas Técnicas:**
```hcl
# cloudflare.tf - WAF Rules
resource "cloudflare_ruleset" "waf" {
  zone_id = var.zone_id
  name    = "RSV360 WAF Rules"
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  rules {
    action      = "block"
    expression  = "(http.request.uri.path contains \"wp-admin\" or http.request.uri.path contains \"admin\")"
    description = "Block common admin paths"
  }

  rules {
    action      = "challenge"
    expression  = "(cf.threat_score ge 10)"
    description = "Challenge suspicious requests"
  }
}

# Rate Limiting
resource "cloudflare_rate_limit" "api" {
  zone_id = var.zone_id

  threshold = 100
  period    = 60

  match {
    request {
      methods = ["GET", "POST", "PUT", "DELETE"]
      schemes = ["HTTP", "HTTPS"]
      url_pattern = "*/api/*"
    }
  }

  action {
    mode    = "simulate"
    timeout = 60
  }
}
```

**Deliverables:**
- [ ] WAF rules implementadas
- [ ] Rate limiting configurado
- [ ] DDoS protection ativo
- [ ] DNS security habilitado

---

### 🔐 ETAPA 3: APPLICATION SECURITY - Code & Runtime (Semana 3)
**Objetivo:** Proteger aplicações contra vulnerabilidades

**Tarefas Técnicas:**
```typescript
// security.middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function securityHeaders(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Content-Security-Policy', generateCSP(request));

  // Remove server information
  response.headers.delete('X-Powered-By');

  return response;
}

function generateCSP(request: NextRequest): string {
  const nonce = generateNonce();

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'nonce-${nonce}' cdn.cloudflare.com",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "img-src 'self' data: https: cdn.cloudflare.com",
    "font-src 'self' fonts.gstatic.com",
    "connect-src 'self' api.rsv360.com wss://api.rsv360.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
}
```

**Deliverables:**
- [ ] Security headers implementados
- [ ] CSP policies configuradas
- [ ] Input validation adicionada
- [ ] Dependency scanning integrado

---

### 🗄️ ETAPA 4: DATA SECURITY - Encryption & Access (Semana 4)
**Objetivo:** Proteger dados sensíveis

**Tarefas Técnicas:**
```sql
-- Azure SQL - Always Encrypted Setup
USE RSV360_DB;

-- Create Column Master Key
CREATE COLUMN MASTER KEY RSV360_CMK
WITH (
    KEY_STORE_PROVIDER_NAME = N'AZURE_KEY_VAULT',
    KEY_PATH = N'https://rsv360-kv.vault.azure.net/keys/RSv360DataKey'
);

-- Create Column Encryption Key
CREATE COLUMN ENCRYPTION KEY RSV360_CEK
WITH VALUES (
    COLUMN_MASTER_KEY = RSV360_CMK,
    ALGORITHM = 'RSA_OAEP',
    ENCRYPTED_VALUE = 0x...
);

-- Encrypt sensitive columns
ALTER TABLE Users
ALTER COLUMN email ENCRYPTED WITH (
    ENCRYPTION_TYPE = DETERMINISTIC,
    ALGORITHM = 'AEAD_AES_256_CBC_HMAC_SHA_256',
    COLUMN_ENCRYPTION_KEY = RSV360_CEK
);

ALTER TABLE Payments
ALTER COLUMN card_number ENCRYPTED WITH (
    ENCRYPTION_TYPE = RANDOMIZED,
    ALGORITHM = 'AEAD_AES_256_CBC_HMAC_SHA_256',
    COLUMN_ENCRYPTION_KEY = RSV360_CEK
);
```

**Deliverables:**
- [ ] Dados sensíveis criptografados
- [ ] Row Level Security implementado
- [ ] Backup encryption configurado
- [ ] Data classification aplicado

---

### 📊 ETAPA 5: MONITORING & LOGGING - Visibility (Semana 5)
**Objetivo:** Implementar monitoramento completo

**Tarefas Técnicas:**
```hcl
# monitoring.tf
resource "azurerm_monitor_diagnostic_setting" "security" {
  name                       = "security-diagnostics"
  target_resource_id         = azurerm_key_vault.rsv360.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.rsv360.id

  enabled_log {
    category = "AuditEvent"
  }

  enabled_log {
    category = "AzurePolicyEvaluationDetails"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

# Azure Sentinel - Analytics Rules
resource "azurerm_sentinel_alert_rule_scheduled" "suspicious_login" {
  name                       = "Suspicious Login Attempts"
  log_analytics_workspace_id = azurerm_log_analytics_workspace.rsv360.id
  display_name               = "Multiple Failed Login Attempts"

  query = @"
SecurityEvent
| where EventID == 4625
| where AccountType == "User"
| summarize FailedCount = count() by bin(TimeGenerated, 5m), Account
| where FailedCount > 5
| project TimeGenerated, Account, FailedCount
"@

  severity                = "Medium"
  query_frequency         = "PT5M"
  query_period            = "PT15M"
  trigger_operator        = "GreaterThan"
  trigger_threshold       = 0
  suppression_enabled     = false
  suppression_duration    = "PT5M"
}
```

**Deliverables:**
- [ ] Azure Monitor configurado
- [ ] Azure Sentinel implementado
- [ ] Alertas automáticos criados
- [ ] Log aggregation funcionando

---

### 🚨 ETAPA 6: INCIDENT RESPONSE - Automation (Semana 6)
**Objetivo:** Automatizar resposta a incidentes

**Tarefas Técnicas:**
```yaml
# incident-response.yml - Azure Logic Apps
{
  "definition": {
    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    "actions": {
      "Detect_Threat": {
        "type": "ApiConnection",
        "inputs": {
          "host": {
            "connection": {
              "name": "@parameters('$connections')['azuremonitor']['connectionId']"
            }
          },
          "method": "get",
          "path": "/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Security/securityContacts/default1"
        }
      },
      "Block_IP": {
        "type": "ApiConnection",
        "inputs": {
          "host": {
            "connection": {
              "name": "@parameters('$connections')['azurefirewall']['connectionId']"
            }
          },
          "method": "put",
          "path": "/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Network/azureFirewalls/${firewallName}/networkRuleCollections/${ruleCollectionName}"
        }
      },
      "Notify_Team": {
        "type": "ApiConnection",
        "inputs": {
          "host": {
            "connection": {
              "name": "@parameters('$connections')['office365']['connectionId']"
            }
          },
          "method": "post",
          "path": "/v2/Mail"
        }
      }
    },
    "triggers": {
      "When_a_security_alert_is_created": {
        "type": "ApiConnection",
        "inputs": {
          "host": {
            "connection": {
              "name": "@parameters('$connections')['azuremonitor']['connectionId']"
            }
          },
          "method": "get",
          "path": "/subscriptions/${subscriptionId}/providers/microsoft.security/alerts"
        }
      }
    }
  }
}
```

**Deliverables:**
- [ ] Playbooks de resposta criados
- [ ] Automação de bloqueio implementada
- [ ] Notificações automáticas configuradas
- [ ] Escalation procedures definidos

---

### ✅ ETAPA 7: COMPLIANCE & AUDIT - Certification (Semana 7-8)
**Objetivo:** Garantir conformidade regulatória

**Tarefas Técnicas:**
```hcl
# compliance.tf
resource "azurerm_policy_definition" "lgpd_compliance" {
  name         = "lgpd-data-protection"
  policy_type  = "Custom"
  mode         = "Indexed"
  display_name = "LGPD Data Protection Requirements"

  policy_rule = jsonencode({
    "if": {
      "allOf": [
        {
          "field": "type",
          "equals": "Microsoft.Sql/servers/databases"
        },
        {
          "field": "Microsoft.Sql/servers/databases/transparentDataEncryption.status",
          "notEquals": "Enabled"
        }
      ]
    },
    "then": {
      "effect": "deny"
    }
  })

  parameters = jsonencode({})
}

# Assign policy to subscription
resource "azurerm_subscription_policy_assignment" "lgpd" {
  name                 = "lgpd-compliance-assignment"
  subscription_id      = data.azurerm_subscription.current.id
  policy_definition_id = azurerm_policy_definition.lgpd_compliance.id

  parameters = jsonencode({})
}
```

**Deliverables:**
- [ ] Azure Policy implementado
- [ ] Compliance monitoring ativo
- [ ] Audit logs configurados
- [ ] Penetration testing realizado

---

## 🧪 TESTING & VALIDATION

### Security Testing Checklist
```bash
# Automated Security Tests
npm run test:security

# Penetration Testing
docker run --rm -v $(pwd):/zap/wrk owasp/zap2docker-stable zap-baseline.py \
  -t https://admin.rsv360.com \
  -r security-report.html

# Load Testing with Security
k6 run --tag testid=security-load security-load-test.js

# Compliance Validation
az policy state list --subscription $SUBSCRIPTION_ID \
  --query "[?complianceState=='NonCompliant']" \
  --output table
```

### Performance Validation
- [ ] **Latency:** < 50ms overhead de segurança
- [ ] **Throughput:** > 10,000 RPS mantido
- [ ] **Availability:** 99.9% uptime SLA
- [ ] **False Positives:** < 5%

---

## 📊 MONITORING DASHBOARD

### Azure Dashboard Configuration
```json
{
  "dashboard": {
    "title": "RSV360 SecurityShield360",
    "metadata": {
      "version": "1.0"
    },
    "widgets": [
      {
        "type": "threat_map",
        "position": { "x": 0, "y": 0, "width": 12, "height": 8 },
        "title": "Global Threat Activity"
      },
      {
        "type": "alert_timeline",
        "position": { "x": 12, "y": 0, "width": 12, "height": 8 },
        "title": "Security Incidents Timeline"
      },
      {
        "type": "compliance_score",
        "position": { "x": 0, "y": 8, "width": 6, "height": 4 },
        "title": "Compliance Score"
      },
      {
        "type": "zero_trust_status",
        "position": { "x": 6, "y": 8, "width": 6, "height": 4 },
        "title": "Zero Trust Coverage"
      },
      {
        "type": "access_attempts",
        "position": { "x": 12, "y": 8, "width": 12, "height": 4 },
        "title": "Access Attempts (24h)"
      }
    ]
  }
}
```

---

## 🚨 EMERGENCY PROCEDURES

### Incident Response Protocol
1. **Detecção:** Alerta automático via Azure Sentinel
2. **Avaliação:** Time de segurança avalia severidade
3. **Contenção:** Bloqueio automático de IPs/threats
4. **Investigação:** Análise forense dos logs
5. **Recuperação:** Restauração de sistemas afetados
6. **Lições Aprendidas:** Post-mortem e melhorias

### Emergency Contacts
- **Security Incident:** +55 11 99999-9999 (24/7)
- **Infrastructure Emergency:** +55 11 88888-8888
- **Legal/Compliance:** +55 11 77777-7777

---

## 📈 SUCCESS METRICS

### Security KPIs
- **Zero Breaches:** 0 successful security incidents
- **Detection Rate:** > 95% de threats detectadas
- **Response Time:** < 15 minutos MTTD
- **Recovery Time:** < 4 horas MTTR

### Compliance KPIs
- **LGPD Score:** > 95% compliance
- **GDPR Score:** > 95% compliance
- **ISO 27001:** Certified by Q4 2026

### Performance KPIs
- **Security Overhead:** < 2% performance impact
- **Availability:** 99.9% uptime maintained
- **User Experience:** Seamless authentication

---

## 🎯 IMPLEMENTATION NOTES

### Critical Success Factors
1. **Phased Approach:** Implementar etapa por etapa
2. **Testing First:** Nunca deploy sem testes completos
3. **Monitoring Always:** Dashboards ativos 24/7
4. **Team Training:** Capacitação em security culture

### Risk Mitigation
- **Rollback Plan:** Capacidade de reverter qualquer mudança
- **Backup Strategy:** Backups criptografados diários
- **Communication:** Stakeholders informados semanalmente
- **Documentation:** Tudo documentado e versionado

### Dependencies
- **Cloudflare Enterprise Account:** Pré-requisito
- **Azure Subscription:** Com security features
- **Microsoft Entra ID P2:** Para MFA avançado
- **Security Team:** 2+ dedicated security engineers

---

## 📋 CHECKLIST FINAL

### Pre-Implementation
- [ ] Security team assembled
- [ ] Cloudflare account configured
- [ ] Azure subscription ready
- [ ] Budget approved
- [ ] Stakeholder alignment

### Post-Implementation
- [ ] Penetration testing passed
- [ ] Load testing completed
- [ ] Compliance audit passed
- [ ] Team training completed
- [ ] Go-live approval obtained

---

**🚀 READY FOR IMPLEMENTATION**  
**Priority:** 🔴 CRITICAL - Execute immediately  
**Timeline:** 8 weeks total  
**Budget:** $150K-$200K  
**Risk Level:** 🟢 LOW (phased approach)  

**Next Action:** Iniciar ETAPA 1 - Foundation Setup