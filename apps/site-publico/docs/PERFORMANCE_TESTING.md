# Guia de Testes de Performance

Este documento descreve como executar testes de performance usando k6 e Artillery.

## 📋 Índice

- [Instalação](#instalação)
- [k6](#k6)
- [Artillery](#artillery)
- [Tipos de Testes](#tipos-de-testes)
- [Interpretando Resultados](#interpretando-resultados)

## 🔧 Instalação

### k6

**Windows:**
```powershell
# Opção 1: Winget
winget install k6

# Opção 2: Chocolatey
choco install k6

# Opção 3: Download manual
# Baixe de: https://k6.io/docs/getting-started/installation/
```

**Linux/Mac:**
```bash
# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Mac
brew install k6
```

### Artillery

```bash
npm install -g artillery
```

## 🚀 k6

### Executar Testes

**PowerShell:**
```powershell
.\scripts\run-k6-tests.ps1
```

**Bash:**
```bash
bash scripts/run-k6-tests.sh
```

**Direto:**
```bash
# Teste de carga
k6 run tests/performance/k6/config.js

# Teste de stress
k6 run tests/performance/k6/stress-test.js

# Teste de endurance
k6 run tests/performance/k6/endurance-test.js
```

### Variáveis de Ambiente

```bash
export BASE_URL="http://localhost:3000"
export TEST_USER_EMAIL="test@example.com"
export TEST_USER_PASSWORD="test123"
export API_TOKEN="seu_token_aqui"
```

### Configuração de Teste

Os testes k6 estão em `tests/performance/k6/`:

- **config.js**: Teste de carga padrão
- **stress-test.js**: Teste de stress (aumenta carga gradualmente)
- **endurance-test.js**: Teste de endurance (carga constante por tempo prolongado)

### Exemplo de Saída

```
     ✓ status is 200
     ✓ response time < 500ms
     ✓ has properties

   checks.........................: 100.00% ✓ 1500      ✗ 0
   data_received..................: 2.5 MB  42 kB/s
   data_sent......................: 1.2 MB  20 kB/s
   http_req_duration..............: avg=245ms min=120ms med=230ms max=890ms p(95)=450ms p(99)=680ms
   http_req_failed................: 0.00%   ✓ 0         ✗ 1500
   http_reqs......................: 1500    25.00/s
   iteration_duration.............: avg=1.2s min=0.5s med=1.1s max=2.5s
   iterations....................: 1500    25.00/s
   vus............................: 100     min=100    max=100
   vus_max........................: 100     min=100    max=100
```

## 🎯 Artillery

### Executar Testes

**PowerShell:**
```powershell
.\scripts\run-artillery-tests.ps1
```

**Bash:**
```bash
bash scripts/run-artillery-tests.sh
```

**Direto:**
```bash
# Teste de carga
artillery run tests/performance/artillery/artillery-config.yml

# Teste de stress
artillery run tests/performance/artillery/stress-test.yml
```

### Configuração

Os testes Artillery estão em `tests/performance/artillery/`:

- **artillery-config.yml**: Configuração principal com múltiplos cenários
- **stress-test.yml**: Teste de stress
- **artillery-processor.js**: Funções auxiliares

## 📊 Tipos de Testes

### 1. Teste de Carga (Load Test)

**Objetivo:** Verificar comportamento do sistema sob carga normal esperada.

**k6:**
```bash
k6 run tests/performance/k6/config.js
```

**Artillery:**
```bash
artillery run tests/performance/artillery/artillery-config.yml
```

**Características:**
- Carga gradual (ramp-up)
- Carga estável
- Ramp-down suave
- Thresholds: 95% < 500ms, taxa de erro < 1%

### 2. Teste de Stress (Stress Test)

**Objetivo:** Encontrar o limite do sistema aumentando carga até falha.

**k6:**
```bash
k6 run tests/performance/k6/stress-test.js
```

**Artillery:**
```bash
artillery run tests/performance/artillery/stress-test.yml
```

**Características:**
- Aumento gradual de carga
- Testa até 500+ usuários simultâneos
- Identifica ponto de quebra
- Thresholds mais tolerantes

### 3. Teste de Endurance (Endurance Test)

**Objetivo:** Detectar memory leaks e problemas de longo prazo.

**k6:**
```bash
k6 run tests/performance/k6/endurance-test.js
```

**Características:**
- Carga constante por 30+ minutos
- Monitora uso de memória
- Detecta degradação de performance
- Identifica vazamentos de recursos

## 📈 Interpretando Resultados

### Métricas Importantes

1. **http_req_duration**: Tempo de resposta
   - `p(95)`: 95% das requisições abaixo deste tempo
   - `p(99)`: 99% das requisições abaixo deste tempo
   - Meta: p(95) < 500ms, p(99) < 1000ms

2. **http_req_failed**: Taxa de erro
   - Meta: < 1% para testes normais
   - Meta: < 5% para stress tests

3. **http_reqs**: Requisições por segundo
   - Indica throughput do sistema

4. **vus**: Virtual Users (Usuários Virtuais)
   - Número de usuários simultâneos

### Sinais de Problemas

- **Alta taxa de erro (> 1%)**: Sistema sobrecarregado ou com bugs
- **Tempo de resposta alto**: Necessita otimização ou mais recursos
- **Degradação ao longo do tempo**: Possível memory leak
- **Falhas durante ramp-up**: Sistema não escala adequadamente

## 🔍 Troubleshooting

### k6 não encontrado

```powershell
# Verificar instalação
k6 version

# Se não instalado, seguir instruções de instalação acima
```

### Artillery não encontrado

```bash
npm install -g artillery
```

### Erro de conexão

- Verificar se o servidor está rodando
- Verificar `BASE_URL` nas variáveis de ambiente
- Verificar firewall/portas

### Token de autenticação inválido

- Verificar `API_TOKEN` ou credenciais de teste
- Criar usuário de teste se necessário

## 📝 Próximos Passos

1. Integrar testes de performance no CI/CD
2. Configurar alertas baseados em métricas
3. Criar dashboards de performance
4. Automatizar execução periódica de testes

