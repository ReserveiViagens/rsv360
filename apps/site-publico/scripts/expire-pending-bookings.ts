/**
 * Script para expirar reservas pendentes antigas
 * Executar via cron job ou scheduler
 */

import { expirePendingBookings } from '../lib/booking-status-service';

async function main() {
  console.log('Iniciando expiração de reservas pendentes...');
  
  const expiredCount = await expirePendingBookings();
  
  console.log(`✅ ${expiredCount} reserva(s) expirada(s)`);
  
  process.exit(0);
}

main().catch((error) => {
  console.error('Erro ao expirar reservas:', error);
  process.exit(1);
});

