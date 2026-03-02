# 🧪 COMANDOS PARA TESTAR wishlist-service.test.ts

## Executar Testes

### Teste Completo (sem cobertura)
```bash
npm test -- __tests__/lib/group-travel/wishlist-service.test.ts --no-coverage --passWithNoTests
```

### Teste com Cobertura
```bash
npm test -- __tests__/lib/group-travel/wishlist-service.test.ts --coverage
```

### Teste Específico
```bash
npm test -- __tests__/lib/group-travel/wishlist-service.test.ts --testNamePattern="should create a wishlist successfully"
```

### Teste com Timeout Aumentado
```bash
npm test -- __tests__/lib/group-travel/wishlist-service.test.ts --no-coverage --testTimeout=30000
```

### Teste com Verbose
```bash
npm test -- __tests__/lib/group-travel/wishlist-service.test.ts --no-coverage --verbose
```

---

## Verificar Erros Específicos

### Ver apenas erros
```bash
npm test -- __tests__/lib/group-travel/wishlist-service.test.ts --no-coverage 2>&1 | Select-String "Error|FAIL"
```

### Ver últimos 50 linhas
```bash
npm test -- __tests__/lib/group-travel/wishlist-service.test.ts --no-coverage 2>&1 | Select-Object -Last 50
```

---

## Limpar Cache e Executar

```bash
npm test -- __tests__/lib/group-travel/wishlist-service.test.ts --no-coverage --clearCache
```

