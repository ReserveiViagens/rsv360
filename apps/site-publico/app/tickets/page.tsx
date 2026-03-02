'use client';

/**
 * Página: Lista de Tickets
 * Página principal para visualizar e gerenciar tickets
 */

import { TicketList } from '@/components/tickets/TicketList';

export default function TicketsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <TicketList />
    </div>
  );
}

