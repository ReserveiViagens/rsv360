/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
export interface GuestService {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  price?: number;
  featured?: boolean;
}

export interface ServiceRequestPayload {
  type: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}
