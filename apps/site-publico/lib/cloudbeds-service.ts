/**
 * ✅ ITENS 63-65: SERVIÇO CLOUDBEDS
 * Sincronização Bidirecional, Gestão de Inventário, Gestão de Preços
 */

import { queryDatabase } from './db';

export interface CloudbedsConfig {
  api_key: string;
  api_secret: string;
  property_id?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface CloudbedsBooking {
  reservation_id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: string;
  total_amount: number;
  currency: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
}

export interface CloudbedsInventory {
  property_id: string;
  room_type_id: string;
  date: string;
  available_units: number;
  blocked_units: number;
  total_units: number;
}

export interface CloudbedsPrice {
  property_id: string;
  room_type_id: string;
  date: string;
  price: number;
  currency: string;
  min_stay?: number;
  max_stay?: number;
}

export interface SyncResult {
  success: boolean;
  imported: number;
  exported: number;
  conflicts: number;
  errors: number;
  details?: any;
}

/**
 * ✅ ITEM 63: CLOUDBEDS - SINCRONIZAÇÃO BIDIRECIONAL
 */

/**
 * Autenticar com Cloudbeds (OAuth2)
 */
export async function authenticateCloudbeds(config: CloudbedsConfig): Promise<{ access_token: string; refresh_token: string }> {
  // Implementar autenticação OAuth2 real com Cloudbeds
  if (!config.api_key || !config.api_secret) {
    throw new Error('Credenciais Cloudbeds não fornecidas');
  }

  try {
    const response = await fetch('https://api.cloudbeds.com/api/v1.1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.api_key,
        client_secret: config.api_secret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Falha na autenticação Cloudbeds');
    }

    const data = await response.json();
    return {
      access_token: data.access_token || config.access_token || '',
      refresh_token: data.refresh_token || config.refresh_token || '',
    };
  } catch (error: any) {
    // Se autenticação falhar, retornar tokens existentes se disponíveis
    if (config.access_token) {
      console.warn('Autenticação Cloudbeds falhou, usando token existente:', error.message);
      return {
        access_token: config.access_token,
        refresh_token: config.refresh_token || '',
      };
    }
    throw error;
  }
}

/**
 * Buscar reservas do Cloudbeds
 */
export async function fetchCloudbedsBookings(
  config: CloudbedsConfig,
  filters: {
    date_from?: string;
    date_to?: string;
    status?: string;
  } = {}
): Promise<CloudbedsBooking[]> {
  // Implementar busca real na API Cloudbeds
  if (!config.access_token) {
    throw new Error('Token Cloudbeds não configurado');
  }

  const params = new URLSearchParams();
  if (filters.date_from) params.append('startDate', filters.date_from);
  if (filters.date_to) params.append('endDate', filters.date_to);
  if (filters.status) params.append('status', filters.status);

  try {
    const response = await fetch(
      `https://api.cloudbeds.com/api/v1.1/getReservations?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${config.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro ao buscar reservas do Cloudbeds: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error: any) {
    console.error('Erro ao buscar reservas do Cloudbeds:', error);
    return [];
  }
}

/**
 * Enviar reserva para Cloudbeds
 */
export async function createCloudbedsBooking(
  config: CloudbedsConfig,
  booking: Partial<CloudbedsBooking>
): Promise<CloudbedsBooking> {
  // Implementar criação real na API Cloudbeds
  if (!config.access_token) {
    throw new Error('Token Cloudbeds não configurado');
  }

  try {
    const response = await fetch('https://api.cloudbeds.com/api/v1.1/postReservation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro ao criar reserva no Cloudbeds: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error('Erro ao criar reserva no Cloudbeds:', error);
    throw error;
  }
}

/**
 * Sincronização bidirecional completa
 */
export async function syncCloudbedsBidirectional(
  integrationConfigId: number,
  config: CloudbedsConfig
): Promise<SyncResult> {
  const syncLogId = await createSyncLog(integrationConfigId, 'full', 'bidirectional');

  try {
    let imported = 0;
    let exported = 0;
    let conflicts = 0;
    let errors = 0;

    // 1. Importar reservas do Cloudbeds
    try {
      const cloudbedsBookings = await fetchCloudbedsBookings(config);
      
      for (const cbBooking of cloudbedsBookings) {
        try {
          // Verificar se já existe no RSV
          const existing = await queryDatabase(
            `SELECT id FROM external_bookings 
             WHERE integration_config_id = $1 AND external_id = $2`,
            [integrationConfigId, cbBooking.reservation_id]
          );

          if (existing.length > 0) {
            // Atualizar existente
            await queryDatabase(
              `UPDATE external_bookings 
               SET check_in = $1, check_out = $2, guests_count = $3, status = $4,
                   total_amount = $5, guest_name = $6, guest_email = $7, 
                   last_synced_at = CURRENT_TIMESTAMP, sync_status = 'synced'
               WHERE id = $8`,
              [
                cbBooking.check_in,
                cbBooking.check_out,
                cbBooking.guests,
                cbBooking.status,
                cbBooking.total_amount,
                cbBooking.guest_name,
                cbBooking.guest_email,
                existing[0].id,
              ]
            );
          } else {
            // Criar novo
            await queryDatabase(
              `INSERT INTO external_bookings 
               (integration_config_id, external_id, external_code, platform, 
                check_in, check_out, guests_count, status, total_amount, currency,
                guest_name, guest_email, guest_phone, sync_status, last_synced_at)
               VALUES ($1, $2, $3, 'cloudbeds', $4, $5, $6, $7, $8, $9, $10, $11, $12, 'synced', CURRENT_TIMESTAMP)`,
              [
                integrationConfigId,
                cbBooking.reservation_id,
                cbBooking.reservation_id,
                cbBooking.check_in,
                cbBooking.check_out,
                cbBooking.guests,
                cbBooking.status,
                cbBooking.total_amount,
                cbBooking.currency,
                cbBooking.guest_name,
                cbBooking.guest_email,
                cbBooking.guest_phone || null,
              ]
            );
          }

          imported++;
        } catch (error: any) {
          console.error('Erro ao importar reserva:', error);
          errors++;
        }
      }
    } catch (error: any) {
      console.error('Erro ao buscar reservas do Cloudbeds:', error);
      errors++;
    }

    // 2. Exportar reservas do RSV para Cloudbeds
    try {
      const rsvBookings = await queryDatabase(
        `SELECT b.*, p.id as property_id 
         FROM bookings b
         JOIN properties p ON b.item_id = p.id
         WHERE b.status = 'confirmed'
           AND b.created_at >= CURRENT_DATE - INTERVAL '30 days'
         ORDER BY b.created_at DESC
         LIMIT 100`
      );

      for (const booking of rsvBookings) {
        try {
          // Verificar se já foi exportado
          const existing = await queryDatabase(
            `SELECT id FROM external_bookings 
             WHERE booking_id = $1 AND integration_config_id = $2`,
            [booking.id, integrationConfigId]
          );

          if (existing.length === 0) {
            // Criar no Cloudbeds
            await createCloudbedsBooking(config, {
              property_id: booking.property_id?.toString() || '',
              check_in: booking.check_in,
              check_out: booking.check_out,
              guests: booking.total_guests || 1,
              status: 'confirmed',
              total_amount: parseFloat(booking.total || '0'),
              currency: 'BRL',
              guest_name: booking.customer_name || '',
              guest_email: booking.customer_email || '',
              guest_phone: booking.customer_phone || '',
            });

            // Registrar exportação
            await queryDatabase(
              `INSERT INTO external_bookings 
               (integration_config_id, booking_id, external_id, platform, 
                check_in, check_out, guests_count, status, total_amount,
                guest_name, guest_email, sync_status, last_synced_at)
               VALUES ($1, $2, $3, 'cloudbeds', $4, $5, $6, $7, $8, $9, $10, 'synced', CURRENT_TIMESTAMP)`,
              [
                integrationConfigId,
                booking.id,
                `rsv-${booking.id}`, // ID temporário
                booking.check_in,
                booking.check_out,
                booking.total_guests || 1,
                booking.status,
                parseFloat(booking.total || '0'),
                booking.customer_name || '',
                booking.customer_email || '',
              ]
            );

            exported++;
          }
        } catch (error: any) {
          console.error('Erro ao exportar reserva:', error);
          errors++;
        }
      }
    } catch (error: any) {
      console.error('Erro ao exportar reservas:', error);
      errors++;
    }

    // 3. Detectar e registrar conflitos
    conflicts = await detectSyncConflicts(integrationConfigId, syncLogId);

    // Atualizar log de sincronização
    await updateSyncLog(syncLogId, {
      status: errors > 0 ? 'partial' : 'success',
      records_processed: imported + exported,
      records_successful: imported + exported - errors,
      records_failed: errors,
      conflicts_detected: conflicts,
    });

    return {
      success: errors === 0,
      imported,
      exported,
      conflicts,
      errors,
    };
  } catch (error: any) {
    await updateSyncLog(syncLogId, {
      status: 'error',
      error_message: error.message,
    });
    throw error;
  }
}

/**
 * ✅ ITEM 64: CLOUDBEDS - GESTÃO DE INVENTÁRIO
 */

/**
 * Buscar inventário do Cloudbeds
 */
export async function fetchCloudbedsInventory(
  config: CloudbedsConfig,
  filters: {
    date_from: string;
    date_to: string;
    room_type_id?: string;
  }
): Promise<CloudbedsInventory[]> {
  // ✅ IMPLEMENTAÇÃO REAL: Buscar inventário via API Cloudbeds
  if (!config.access_token) {
    // Tentar obter token se não tiver
    const authResult = await authenticateCloudbeds(config);
    config.access_token = authResult.access_token;
  }

  const params = new URLSearchParams({
    startDate: filters.date_from,
    endDate: filters.date_to,
  });
  if (filters.room_type_id) params.append('roomTypeId', filters.room_type_id);
  if (config.property_id) params.append('propertyId', config.property_id);

  try {
    const response = await fetch(
      `https://api.cloudbeds.com/api/v1.1/getAvailability?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${config.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado, renovar
        const refreshed = await authenticateCloudbeds(config);
        config.access_token = refreshed.access_token;
        // Retentar
        return fetchCloudbedsInventory(config, filters);
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro ao buscar inventário do Cloudbeds: ${response.statusText}`);
    }

    const data = await response.json();
    const inventory = data.data || data.availability || [];
    
    // Mapear resposta da API para formato interno
    return inventory.map((inv: any) => ({
      property_id: inv.propertyId || config.property_id || '',
      room_type_id: inv.roomTypeId || filters.room_type_id || '',
      date: inv.date || inv.startDate,
      available_units: parseInt(inv.available || inv.availableUnits || 0),
      blocked_units: parseInt(inv.blocked || inv.blockedUnits || 0),
      total_units: parseInt(inv.total || inv.totalUnits || 0),
    }));
  } catch (error: any) {
    console.error('Erro ao buscar inventário do Cloudbeds:', error);
    throw error;
  }
}

/**
 * Atualizar disponibilidade no Cloudbeds
 */
export async function updateCloudbedsAvailability(
  config: CloudbedsConfig,
  inventory: CloudbedsInventory[]
): Promise<boolean> {
  // ✅ IMPLEMENTAÇÃO REAL: Atualizar disponibilidade via API Cloudbeds
  if (!config.access_token) {
    const authResult = await authenticateCloudbeds(config);
    config.access_token = authResult.access_token;
  }

  try {
    // Formatar dados para API Cloudbeds
    const availabilityData = inventory.map(inv => ({
      propertyId: inv.property_id,
      roomTypeId: inv.room_type_id,
      date: inv.date,
      available: inv.available_units,
      blocked: inv.blocked_units,
    }));

    const response = await fetch('https://api.cloudbeds.com/api/v1.1/postAvailability', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ availability: availabilityData }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await authenticateCloudbeds(config);
        config.access_token = refreshed.access_token;
        return updateCloudbedsAvailability(config, inventory);
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro ao atualizar disponibilidade: ${response.statusText}`);
    }

    return true;
  } catch (error: any) {
    console.error('Erro ao atualizar disponibilidade do Cloudbeds:', error);
    throw error;
  }
}

/**
 * Sincronizar inventário
 */
export async function syncCloudbedsInventory(
  integrationConfigId: number,
  config: CloudbedsConfig,
  propertyId: number,
  dateFrom: string,
  dateTo: string
): Promise<SyncResult> {
  const syncLogId = await createSyncLog(integrationConfigId, 'inventory', 'bidirectional');

  try {
    // 1. Buscar inventário do Cloudbeds
    const cloudbedsInventory = await fetchCloudbedsInventory(config, {
      date_from: dateFrom,
      date_to: dateTo,
    });

    // 2. Atualizar disponibilidade no RSV
    let imported = 0;
    let errors = 0;

    for (const inv of cloudbedsInventory) {
      try {
        // Atualizar tabela availability
        await queryDatabase(
          `INSERT INTO availability (property_id, date, is_available, available_units, blocked_units)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (property_id, date) 
           DO UPDATE SET 
             is_available = $3,
             available_units = $4,
             blocked_units = $5,
             updated_at = CURRENT_TIMESTAMP`,
          [
            propertyId,
            inv.date,
            inv.available_units > 0,
            inv.available_units,
            inv.blocked_units,
          ]
        );

        imported++;
      } catch (error: any) {
        console.error('Erro ao sincronizar inventário:', error);
        errors++;
      }
    }

    // 3. Exportar bloqueios do RSV para Cloudbeds
    const rsvAvailability = await queryDatabase(
      `SELECT date, is_available, available_units, blocked_units
       FROM availability
       WHERE property_id = $1 AND date BETWEEN $2 AND $3`,
      [propertyId, dateFrom, dateTo]
    );

    // Mapear room types (buscar mapeamento se existir)
    const roomTypeMapping = await getRoomTypeMapping(propertyId);
    const defaultRoomTypeId = roomTypeMapping?.default || '1';

    const inventoryToExport: CloudbedsInventory[] = rsvAvailability.map((av: any) => ({
      property_id: propertyId.toString(),
      room_type_id: roomTypeMapping?.mapping?.[av.room_type_id] || defaultRoomTypeId,
      date: av.date,
      available_units: av.is_available ? av.available_units : 0,
      blocked_units: av.blocked_units,
      total_units: av.available_units + av.blocked_units,
    }));

    await updateCloudbedsAvailability(config, inventoryToExport);

    await updateSyncLog(syncLogId, {
      status: errors > 0 ? 'partial' : 'success',
      records_processed: imported,
      records_successful: imported - errors,
      records_failed: errors,
    });

    return {
      success: errors === 0,
      imported,
      exported: inventoryToExport.length,
      conflicts: 0,
      errors,
    };
  } catch (error: any) {
    await updateSyncLog(syncLogId, {
      status: 'error',
      error_message: error.message,
    });
    throw error;
  }
}

/**
 * ✅ ITEM 65: CLOUDBEDS - GESTÃO DE PREÇOS
 */

/**
 * Buscar preços do Cloudbeds
 */
export async function fetchCloudbedsPrices(
  config: CloudbedsConfig,
  filters: {
    date_from: string;
    date_to: string;
    room_type_id?: string;
  }
): Promise<CloudbedsPrice[]> {
  // ✅ IMPLEMENTAÇÃO REAL: Buscar preços via API Cloudbeds
  if (!config.access_token) {
    const authResult = await authenticateCloudbeds(config);
    config.access_token = authResult.access_token;
  }

  const params = new URLSearchParams({
    startDate: filters.date_from,
    endDate: filters.date_to,
  });
  if (filters.room_type_id) params.append('roomTypeId', filters.room_type_id);
  if (config.property_id) params.append('propertyId', config.property_id);

  try {
    const response = await fetch(
      `https://api.cloudbeds.com/api/v1.1/getRates?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${config.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await authenticateCloudbeds(config);
        config.access_token = refreshed.access_token;
        return fetchCloudbedsPrices(config, filters);
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro ao buscar preços do Cloudbeds: ${response.statusText}`);
    }

    const data = await response.json();
    const prices = data.data || data.rates || [];
    
    // Mapear resposta da API para formato interno
    return prices.map((price: any) => ({
      property_id: price.propertyId || config.property_id || '',
      room_type_id: price.roomTypeId || filters.room_type_id || '',
      date: price.date || price.startDate,
      price: parseFloat(price.rate || price.price || 0),
      currency: price.currency || 'BRL',
      min_stay: price.minStay || price.min_stay,
      max_stay: price.maxStay || price.max_stay,
    }));
  } catch (error: any) {
    console.error('Erro ao buscar preços do Cloudbeds:', error);
    throw error;
  }
}

/**
 * Atualizar preços no Cloudbeds
 */
export async function updateCloudbedsPrices(
  config: CloudbedsConfig,
  prices: CloudbedsPrice[]
): Promise<boolean> {
  // ✅ IMPLEMENTAÇÃO REAL: Atualizar preços via API Cloudbeds
  if (!config.access_token) {
    const authResult = await authenticateCloudbeds(config);
    config.access_token = authResult.access_token;
  }

  try {
    // Formatar dados para API Cloudbeds
    const ratesData = prices.map(price => ({
      propertyId: price.property_id,
      roomTypeId: price.room_type_id,
      date: price.date,
      rate: price.price,
      currency: price.currency || 'BRL',
      minStay: price.min_stay,
      maxStay: price.max_stay,
    }));

    const response = await fetch('https://api.cloudbeds.com/api/v1.1/postRates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ rates: ratesData }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await authenticateCloudbeds(config);
        config.access_token = refreshed.access_token;
        return updateCloudbedsPrices(config, prices);
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro ao atualizar preços: ${response.statusText}`);
    }

    return true;
  } catch (error: any) {
    console.error('Erro ao atualizar preços do Cloudbeds:', error);
    throw error;
  }
}

/**
 * Sincronizar preços
 */
export async function syncCloudbedsPricing(
  integrationConfigId: number,
  config: CloudbedsConfig,
  propertyId: number,
  dateFrom: string,
  dateTo: string
): Promise<SyncResult> {
  const syncLogId = await createSyncLog(integrationConfigId, 'pricing', 'bidirectional');

  try {
    // 1. Buscar preços do Cloudbeds
    const cloudbedsPrices = await fetchCloudbedsPrices(config, {
      date_from: dateFrom,
      date_to: dateTo,
    });

    // 2. Atualizar preços no RSV (tabela availability com price_override)
    let imported = 0;
    let errors = 0;

    for (const price of cloudbedsPrices) {
      try {
        await queryDatabase(
          `UPDATE availability 
           SET price_override = $1, updated_at = CURRENT_TIMESTAMP
           WHERE property_id = $2 AND date = $3`,
          [price.price, propertyId, price.date]
        );

        imported++;
      } catch (error: any) {
        console.error('Erro ao sincronizar preço:', error);
        errors++;
      }
    }

    // 3. Exportar preços do RSV para Cloudbeds
    const rsvPrices = await queryDatabase(
      `SELECT date, COALESCE(price_override, 0) as price
       FROM availability
       WHERE property_id = $1 AND date BETWEEN $2 AND $3 AND price_override IS NOT NULL`,
      [propertyId, dateFrom, dateTo]
    );

    // Mapear room types (buscar mapeamento se existir)
    const roomTypeMapping = await getRoomTypeMapping(propertyId);
    const defaultRoomTypeId = roomTypeMapping?.default || '1';

    const pricesToExport: CloudbedsPrice[] = rsvPrices.map((p: any) => ({
      property_id: propertyId.toString(),
      room_type_id: roomTypeMapping?.mapping?.[p.room_type_id] || defaultRoomTypeId,
      date: p.date,
      price: parseFloat(p.price),
      currency: 'BRL',
    }));

    await updateCloudbedsPrices(config, pricesToExport);

    await updateSyncLog(syncLogId, {
      status: errors > 0 ? 'partial' : 'success',
      records_processed: imported,
      records_successful: imported - errors,
      records_failed: errors,
    });

    return {
      success: errors === 0,
      imported,
      exported: pricesToExport.length,
      conflicts: 0,
      errors,
    };
  } catch (error: any) {
    await updateSyncLog(syncLogId, {
      status: 'error',
      error_message: error.message,
    });
    throw error;
  }
}

/**
 * Funções auxiliares
 */

/**
 * Obter mapeamento de room types
 */
async function getRoomTypeMapping(propertyId: number): Promise<{ default: string; mapping?: Record<string, string> } | null> {
  try {
    const result = await queryDatabase(
      `SELECT room_type_mapping FROM integration_configs 
       WHERE property_id = $1 AND platform = 'cloudbeds' 
       LIMIT 1`,
      [propertyId]
    );

    if (result.length > 0 && result[0].room_type_mapping) {
      return JSON.parse(result[0].room_type_mapping);
    }

    return { default: '1' };
  } catch (error) {
    console.warn('Erro ao buscar mapeamento de room types:', error);
    return { default: '1' };
  }
}

async function createSyncLog(
  integrationConfigId: number,
  syncType: string,
  direction: string
): Promise<number> {
  const result = await queryDatabase(
    `INSERT INTO sync_logs 
     (integration_config_id, sync_type, direction, status, started_at)
     VALUES ($1, $2, $3, 'running', CURRENT_TIMESTAMP)
     RETURNING id`,
    [integrationConfigId, syncType, direction]
  );

  return result[0].id;
}

async function updateSyncLog(
  syncLogId: number,
  updates: {
    status?: string;
    records_processed?: number;
    records_successful?: number;
    records_failed?: number;
    conflicts_detected?: number;
    error_message?: string;
  }
): Promise<void> {
  const updatesList: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.status) {
    updatesList.push(`status = $${paramIndex}`);
    values.push(updates.status);
    paramIndex++;
  }

  if (updates.records_processed !== undefined) {
    updatesList.push(`records_processed = $${paramIndex}`);
    values.push(updates.records_processed);
    paramIndex++;
  }

  if (updates.records_successful !== undefined) {
    updatesList.push(`records_successful = $${paramIndex}`);
    values.push(updates.records_successful);
    paramIndex++;
  }

  if (updates.records_failed !== undefined) {
    updatesList.push(`records_failed = $${paramIndex}`);
    values.push(updates.records_failed);
    paramIndex++;
  }

  if (updates.conflicts_detected !== undefined) {
    updatesList.push(`conflicts_detected = $${paramIndex}`);
    values.push(updates.conflicts_detected);
    paramIndex++;
  }

  if (updates.error_message) {
    updatesList.push(`error_message = $${paramIndex}`);
    values.push(updates.error_message);
    paramIndex++;
  }

  updatesList.push(`completed_at = CURRENT_TIMESTAMP`);
  updatesList.push(`duration_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))::INTEGER`);

  values.push(syncLogId);

  await queryDatabase(
    `UPDATE sync_logs 
     SET ${updatesList.join(', ')}
     WHERE id = $${paramIndex}`,
    values
  );
}

async function detectSyncConflicts(
  integrationConfigId: number,
  syncLogId: number
): Promise<number> {
  // Detectar conflitos de reservas (sobreposição de datas)
  const conflicts = await queryDatabase(
    `SELECT 
       eb1.id as booking1_id,
       eb2.id as booking2_id,
       eb1.external_id as external_id1,
       eb2.external_id as external_id2
     FROM external_bookings eb1
     INNER JOIN external_bookings eb2 
       ON eb1.integration_config_id = eb2.integration_config_id
       AND eb1.id < eb2.id
     WHERE eb1.integration_config_id = $1
       AND eb1.sync_status = 'conflict'
       AND eb2.sync_status = 'conflict'
       AND (
         (eb1.check_in <= eb2.check_in AND eb1.check_out > eb2.check_in)
         OR (eb2.check_in <= eb1.check_in AND eb2.check_out > eb1.check_in)
       )`,
    [integrationConfigId]
  );

  let conflictCount = 0;

  for (const conflict of conflicts) {
    await queryDatabase(
      `INSERT INTO sync_conflicts 
       (integration_config_id, sync_log_id, conflict_type, entity_type, 
        entity_id, external_id, conflict_details, resolution_status)
       VALUES ($1, $2, 'booking_overlap', 'booking', $3, $4, $5, 'pending')`,
      [
        integrationConfigId,
        syncLogId,
        conflict.booking1_id,
        conflict.external_id1,
        JSON.stringify({ booking2_id: conflict.booking2_id, external_id2: conflict.external_id2 }),
      ]
    );

    conflictCount++;
  }

  return conflictCount;
}

