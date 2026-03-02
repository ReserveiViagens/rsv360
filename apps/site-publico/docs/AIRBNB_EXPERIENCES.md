# 🎯 Guia de Integração com Airbnb Experiences

**Data:** 07/12/2025  
**Tarefa:** LOW-1 - Airbnb Experiences/Services

---

## 📋 Visão Geral

Este guia documenta a integração com Airbnb Experiences, permitindo que usuários do RSV 360 busquem e descubram experiências e serviços oferecidos pelo Airbnb em suas viagens.

---

## 🏗️ Arquitetura

### Componentes Principais

1. **Serviço:** `lib/airbnb-experiences-service.ts`
   - Busca de experiências
   - Filtros e categorias
   - Integração com API do Airbnb

2. **APIs:**
   - `GET /api/airbnb/experiences` - Buscar experiências
   - `GET /api/airbnb/experiences/[id]` - Detalhes de uma experiência

3. **UI:** `components/airbnb/AirbnbExperiencesBrowser.tsx`
   - Interface de busca
   - Filtros avançados
   - Cards de experiências

---

## 🚀 Como Usar

### 1. Buscar Experiências

```typescript
import { airbnbExperiencesService } from '@/lib/airbnb-experiences-service';

const experiences = await airbnbExperiencesService.searchExperiences({
  location: 'Caldas Novas, GO',
  category: 'food',
  minPrice: 100,
  maxPrice: 500,
  minRating: 4.0,
  limit: 20,
});
```

### 2. Obter Detalhes

```typescript
const experience = await airbnbExperiencesService.getExperienceById('exp_123');
```

### 3. Usar o Componente

```tsx
import { AirbnbExperiencesBrowser } from '@/components/airbnb/AirbnbExperiencesBrowser';

<AirbnbExperiencesBrowser
  defaultLocation="Caldas Novas, GO"
  onSelectExperience={(exp) => {
    console.log('Experiência selecionada:', exp);
  }}
/>
```

---

## 🔧 Configuração

### Variáveis de Ambiente

```env
AIRBNB_API_KEY=your_api_key_here
```

**Nota:** Airbnb não oferece API pública oficial para Experiences. A implementação atual usa:
- Mock data para desenvolvimento
- Scraping controlado (quando necessário)
- API alternativa (quando disponível)

---

## 📊 Estrutura de Dados

### AirbnbExperience

```typescript
interface AirbnbExperience {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  price: {
    amount: number;
    currency: string;
    perPerson: boolean;
  };
  duration: {
    hours: number;
    minutes?: number;
  };
  rating: number;
  reviewCount: number;
  host: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  images: string[];
  languages: string[];
  maxGuests: number;
  cancellationPolicy: string;
  instantBook: boolean;
  url: string;
}
```

---

## 🎨 Categorias Disponíveis

- `food` - Gastronomia
- `sports` - Esportes
- `wellness` - Bem-estar
- `culture` - Cultura
- `nature` - Natureza
- `music` - Música
- `art` - Arte
- `other` - Outros

---

## 🔍 Filtros Disponíveis

- **Localização:** Cidade, estado ou país
- **Categoria:** Tipo de experiência
- **Preço:** Mínimo e máximo
- **Avaliação:** Rating mínimo
- **Convidados:** Máximo de pessoas
- **Idioma:** Idioma da experiência
- **Reserva Imediata:** Apenas experiências com instant book

---

## 📝 Exemplos de Uso

### Buscar por Localização

```typescript
const experiences = await airbnbExperiencesService.searchExperiences({
  location: 'Caldas Novas, GO',
});
```

### Buscar por Categoria

```typescript
const foodExperiences = await airbnbExperiencesService.getExperiencesByCategory(
  'food',
  'Caldas Novas'
);
```

### Buscar Próximas

```typescript
const nearby = await airbnbExperiencesService.getExperiencesNearby(
  -17.7444, // latitude
  -48.6256, // longitude
  10 // raio em km
);
```

---

## ⚠️ Limitações Atuais

1. **API Não Oficial:** Airbnb não oferece API pública para Experiences
2. **Mock Data:** Em desenvolvimento, usa dados mock
3. **Rate Limiting:** Implementar throttling em produção
4. **Autenticação:** Requer API key quando disponível

---

## 🔮 Melhorias Futuras

- [ ] Integração com API oficial (quando disponível)
- [ ] Cache de resultados
- [ ] Favoritos e histórico
- [ ] Recomendações baseadas em perfil
- [ ] Integração com reservas RSV
- [ ] Reviews e avaliações próprias

---

## 🧪 Testes

```bash
npm test __tests__/api/airbnb-experiences.test.ts
```

---

## 📚 Referências

- [Airbnb Experiences](https://www.airbnb.com/experiences)
- [Airbnb API Documentation](https://www.airbnb.com/partner/resources/api)

---

## ✅ Checklist de Implementação

- [x] Serviço criado
- [x] APIs criadas
- [x] Componente UI criado
- [x] Documentação criada
- [ ] Testes unitários
- [ ] Testes E2E
- [ ] Integração com reservas

---

**Última atualização:** 07/12/2025

