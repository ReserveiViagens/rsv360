# 📝 Loki - Setup e Configuração (Opcional)

## 📋 Visão Geral

Loki é um sistema de agregação de logs projetado para trabalhar com Prometheus e Grafana. Este diretório contém configurações opcionais para adicionar coleta de logs à stack de monitoring.

## ⚠️ Status

**Opcional** - Esta funcionalidade não é obrigatória para o monitoring básico, mas pode ser útil para análise de logs.

## 🏗️ Arquitetura

```
┌─────────────┐
│  Next.js    │───logs───┐
│  App        │           │
└─────────────┘           │
                          ▼
┌─────────────┐     ┌──────────┐
│  WebSocket  │───logs───│ Promtail │
│  Server     │     └──────────┘
└─────────────┘           │
                          │ logs
                          ▼
                    ┌──────────┐
                    │   Loki   │
                    └──────────┘
                          │
                          │ logs
                          ▼
                    ┌──────────┐
                    │  Grafana │
                    └──────────┘
```

## 📦 Componentes

### 1. Loki
- Agregação e armazenamento de logs
- API compatível com Prometheus
- Query language: LogQL

### 2. Promtail
- Coletor de logs
- Envia logs para Loki
- Roda como DaemonSet nos nós

## 🚀 Deploy (Opcional)

### 1. Deploy do Loki

```bash
# Aplicar manifestos (quando criados)
kubectl apply -f k8s/loki/
```

### 2. Deploy do Promtail

```bash
# Aplicar manifestos (quando criados)
kubectl apply -f k8s/loki/promtail/
```

### 3. Configurar Grafana

1. Adicionar Loki como data source no Grafana
2. Criar dashboards de logs
3. Configurar alertas baseados em logs

## 📚 Recursos

- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Promtail Documentation](https://grafana.com/docs/loki/latest/clients/promtail/)
- [LogQL Guide](https://grafana.com/docs/loki/latest/logql/)

## ⏭️ Próximos Passos

Se você quiser implementar Loki:

1. Criar `k8s/loki/deployment.yaml`
2. Criar `k8s/loki/configmap.yaml`
3. Criar `k8s/loki/service.yaml`
4. Criar `k8s/loki/pvc.yaml`
5. Criar `k8s/loki/promtail/daemonset.yaml`
6. Configurar data source no Grafana
7. Criar dashboards de logs

---

**Nota:** Esta funcionalidade é opcional e pode ser implementada no futuro conforme necessidade.

