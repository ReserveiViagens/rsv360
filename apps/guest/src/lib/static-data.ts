/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { GuestService } from '@/types/service';

export const SERVICE_CATALOG: GuestService[] = [
  {
    id: 'room_service',
    name: 'Room Service',
    description: 'Solicite refeições e bebidas no quarto.',
    category: 'alimentação',
    icon: 'UtensilsCrossed',
    price: 0,
    featured: true,
  },
  {
    id: 'spa',
    name: 'Spa e Bem-estar',
    description: 'Agende massagens e tratamentos relaxantes.',
    category: 'bem-estar',
    icon: 'Sparkles',
    price: 0,
  },
  {
    id: 'transfer',
    name: 'Transfer',
    description: 'Agende transfer de chegada ou saída.',
    category: 'mobilidade',
    icon: 'CarFront',
    price: 0,
  },
  {
    id: 'late_checkout',
    name: 'Late check-out',
    description: 'Consulte disponibilidade para saída estendida.',
    category: 'estadia',
    icon: 'Clock3',
    price: 0,
  },
  {
    id: 'cleaning',
    name: 'Limpeza extra',
    description: 'Solicite limpeza adicional do quarto.',
    category: 'hospedagem',
    icon: 'Sparkle',
    price: 0,
  },
  {
    id: 'amenities',
    name: 'Amenities',
    description: 'Peças extras, travesseiros e itens de conforto.',
    category: 'hospedagem',
    icon: 'Package',
    price: 0,
  },
];
