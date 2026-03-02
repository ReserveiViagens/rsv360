# ✅ Checklist de Monitoring - RSV Gen 2

## 📋 Pré-Deploy

### Configuração
- [x] Prometheus ConfigMap criado
- [x] Prometheus Deployment criado
- [x] Prometheus Service criado
- [x] Prometheus PVC criado
- [x] Regras de alerta criadas (18 alertas)
- [x] Alertmanager ConfigMap criado
- [x] Alertmanager Deployment criado
- [x] Alertmanager Service criado
- [x] Alertmanager PVC criado
- [x] Grafana ConfigMap criado
- [x] Grafana Deployment criado
- [x] Grafana Service criado
- [x] Grafana PVC criado
- [x] 4 Dashboards JSON criados

### Instrumentação
- [x] Endpoint `/api/metrics` criado
- [x] Middleware de métricas HTTP
- [x] Wrapper de banco de dados com métricas
- [x] Instrumentação de cache Redis
- [x] Métricas de negócio (tickets, check-ins)
- [x] `prom-client` instalado

### Documentação
- [x] Guia completo de setup (`docs/MONITORING_SETUP.md`)
- [x] Quick start guide (`GUIA_RAPIDO_DEPLOY_MONITORING.md`)
- [x] Resumo executivo (`RESUMO_EXECUTIVO_MONITORING_COMPLETO.md`)
- [x] README do Grafana
- [x] README do Alertmanager

## 🚀 Deploy

### 1. Namespace
- [ ] Namespace `rsv-gen2` criado

### 2. Prometheus
- [ ] ConfigMap `prometheus-config` aplicado
- [ ] ConfigMap `prometheus-alert-rules` aplicado
- [ ] PVC `prometheus-pvc` criado
- [ ] Deployment `prometheus` aplicado
- [ ] Service `prometheus` aplicado
- [ ] Pod rodando e saudável
- [ ] Targets aparecendo como "UP" no Prometheus UI

### 3. Alertmanager
- [ ] Secret `alertmanager-secrets` criado (se necessário)
- [ ] ConfigMap `alertmanager-config` aplicado
- [ ] PVC `alertmanager-pvc` criado
- [ ] Deployment `alertmanager` aplicado
- [ ] Service `alertmanager` aplicado
- [ ] Pod rodando e saudável
- [ ] Prometheus conectado ao Alertmanager

### 4. Grafana
- [ ] Secret `grafana-secrets` criado
- [ ] ConfigMap `grafana-config` aplicado
- [ ] ConfigMap `grafana-dashboards` criado
- [ ] PVC `grafana-pvc` criado
- [ ] Deployment `grafana` aplicado
- [ ] Service `grafana` aplicado
- [ ] Pod rodando e saudável
- [ ] Data source Prometheus configurado e testado
- [ ] Dashboards aparecendo na UI

### 5. Aplicação
- [ ] Aplicação expondo `/api/metrics`
- [ ] Prometheus coletando métricas da aplicação
- [ ] Métricas aparecendo no Prometheus
- [ ] Dashboards mostrando dados

## 🔔 Notificações

### Email
- [ ] SMTP configurado no Alertmanager
- [ ] Receivers configurados com email
- [ ] Teste de envio realizado
- [ ] Alertas chegando por email

### Slack (Opcional)
- [ ] Webhook criado no Slack
- [ ] Slack configurado no Alertmanager
- [ ] Receivers configurados com Slack
- [ ] Teste de envio realizado
- [ ] Alertas chegando no Slack

## 🧪 Testes

### Prometheus
- [ ] UI acessível
- [ ] Targets todos "UP"
- [ ] Queries PromQL funcionando
- [ ] Regras de alerta carregadas
- [ ] Alertas aparecendo

### Grafana
- [ ] UI acessível
- [ ] Login funcionando
- [ ] Data source conectado
- [ ] Dashboards aparecendo
- [ ] Dados sendo exibidos
- [ ] Queries funcionando

### Alertmanager
- [ ] UI acessível
- [ ] Alertas sendo recebidos
- [ ] Roteamento funcionando
- [ ] Notificações sendo enviadas
- [ ] Silences funcionando

### Aplicação
- [ ] Endpoint `/api/metrics` respondendo
- [ ] Métricas sendo coletadas
- [ ] Middleware registrando requisições
- [ ] DB wrapper registrando queries
- [ ] Redis wrapper registrando operações

## 📊 Validação Final

### Métricas
- [ ] HTTP metrics aparecendo
- [ ] Database metrics aparecendo
- [ ] Redis metrics aparecendo
- [ ] Business metrics aparecendo
- [ ] System metrics aparecendo

### Alertas
- [ ] Regras de alerta ativas
- [ ] Alertas sendo gerados (quando condições atendidas)
- [ ] Alertas chegando no Alertmanager
- [ ] Notificações sendo enviadas

### Dashboards
- [ ] Application Overview mostrando dados
- [ ] Business Metrics mostrando dados
- [ ] Infrastructure mostrando dados
- [ ] SLA & Performance mostrando dados

## 🎯 Produção

### Segurança
- [ ] Credenciais alteradas (Grafana, Alertmanager)
- [ ] Secrets criados com valores reais
- [ ] Acesso restrito (se necessário)
- [ ] TLS configurado (se necessário)

### Performance
- [ ] Recursos adequados configurados
- [ ] Retenção de dados configurada
- [ ] Limites de recursos definidos

### Monitoramento
- [ ] Alertas críticos configurados
- [ ] On-call configurado
- [ ] Runbook criado
- [ ] Documentação atualizada

---

**Status:** ✅ Pronto para Deploy  
**Última atualização:** 2025-12-05

