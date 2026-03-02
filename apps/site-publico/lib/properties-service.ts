/**
 * ✅ ITENS 43-50: SERVIÇO DE PROPRIEDADES
 * CRUD completo de propriedades, proprietários, disponibilidade e cotas
 */

import { queryDatabase } from './db';

export interface Property {
  id: number;
  owner_id?: number;
  name: string;
  description?: string;
  property_type: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city: string;
  address_state: string;
  address_zip_code?: string;
  address_country: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  max_guests: number;
  area_sqm?: number;
  amenities?: any;
  base_price_per_night: number;
  currency: string;
  cleaning_fee: number;
  service_fee_percentage: number;
  min_stay_nights: number;
  max_stay_nights?: number;
  check_in_time: string;
  check_out_time: string;
  status: string;
  is_featured: boolean;
  is_instant_book: boolean;
  cancellation_policy: string;
  images?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Owner {
  id: number;
  user_id: number;
  company_name?: string;
  legal_name: string;
  document_type: string;
  document_number: string;
  email: string;
  phone?: string;
  mobile_phone?: string;
  status: string;
  verification_status: string;
  commission_rate: number;
  payment_method: string;
  payment_terms: number;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: number;
  property_id: number;
  date: string;
  is_available: boolean;
  available_units: number;
  blocked_units: number;
  price_override?: number;
  min_stay_override?: number;
  block_reason?: string;
  block_type: string;
  blocked_by?: number;
  blocked_at?: string;
  notes?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Share {
  id: number;
  property_id: number;
  owner_id: number;
  share_percentage: number;
  share_value?: number;
  share_number?: string;
  status: string;
  transferred_from?: number;
  transferred_to?: number;
  transferred_at?: string;
  transfer_reason?: string;
  is_verified: boolean;
  verified_at?: string;
  verified_by?: number;
  notes?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

/**
 * ✅ ITEM 47: API DE PROPRIEDADES - CRUD COMPLETO
 */

/**
 * Criar propriedade
 */
export async function createProperty(
  propertyData: Partial<Property>,
  userId?: number
): Promise<Property> {
  const {
    owner_id,
    name,
    description,
    property_type,
    address_city,
    address_state,
    base_price_per_night,
    max_guests = 1,
    ...rest
  } = propertyData;

  if (!name || !property_type || !address_city || !address_state || !base_price_per_night) {
    throw new Error('Campos obrigatórios: name, property_type, address_city, address_state, base_price_per_night');
  }

  const result = await queryDatabase(
    `INSERT INTO properties 
     (owner_id, name, description, property_type, address_city, address_state, base_price_per_night, max_guests,
      address_street, address_number, address_complement, address_neighborhood, address_zip_code, address_country,
      latitude, longitude, bedrooms, bathrooms, beds, area_sqm, amenities, cleaning_fee, service_fee_percentage,
      min_stay_nights, max_stay_nights, check_in_time, check_out_time, status, is_featured, is_instant_book,
      cancellation_policy, images, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)
     RETURNING *`,
    [
      owner_id || userId || null,
      name,
      description || null,
      property_type,
      address_city,
      address_state,
      base_price_per_night,
      max_guests,
      rest.address_street || null,
      rest.address_number || null,
      rest.address_complement || null,
      rest.address_neighborhood || null,
      rest.address_zip_code || null,
      rest.address_country || 'Brasil',
      rest.latitude || null,
      rest.longitude || null,
      rest.bedrooms || 0,
      rest.bathrooms || 0,
      rest.beds || 0,
      rest.area_sqm || null,
      rest.amenities ? JSON.stringify(rest.amenities) : null,
      rest.cleaning_fee || 0,
      rest.service_fee_percentage || 10.00,
      rest.min_stay_nights || 1,
      rest.max_stay_nights || null,
      rest.check_in_time || '15:00',
      rest.check_out_time || '11:00',
      rest.status || 'active',
      rest.is_featured || false,
      rest.is_instant_book || false,
      rest.cancellation_policy || 'moderate',
      rest.images ? JSON.stringify(rest.images) : null,
      rest.metadata ? JSON.stringify(rest.metadata) : null,
    ]
  );

  return result[0] as Property;
}

/**
 * Obter propriedade por ID
 */
export async function getPropertyById(propertyId: number): Promise<Property | null> {
  const properties = await queryDatabase(
    `SELECT * FROM properties WHERE id = $1`,
    [propertyId]
  );

  return properties.length > 0 ? (properties[0] as Property) : null;
}

/**
 * Listar propriedades
 */
export async function listProperties(
  filters: {
    owner_id?: number;
    property_type?: string;
    status?: string;
    city?: string;
    state?: string;
    is_featured?: boolean;
    min_price?: number;
    max_price?: number;
    min_guests?: number;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Property[]> {
  let query = `SELECT * FROM properties WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.owner_id) {
    query += ` AND owner_id = $${paramIndex}`;
    params.push(filters.owner_id);
    paramIndex++;
  }

  if (filters.property_type) {
    query += ` AND property_type = $${paramIndex}`;
    params.push(filters.property_type);
    paramIndex++;
  }

  if (filters.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.city) {
    query += ` AND address_city ILIKE $${paramIndex}`;
    params.push(`%${filters.city}%`);
    paramIndex++;
  }

  if (filters.state) {
    query += ` AND address_state = $${paramIndex}`;
    params.push(filters.state);
    paramIndex++;
  }

  if (filters.is_featured !== undefined) {
    query += ` AND is_featured = $${paramIndex}`;
    params.push(filters.is_featured);
    paramIndex++;
  }

  if (filters.min_price) {
    query += ` AND base_price_per_night >= $${paramIndex}`;
    params.push(filters.min_price);
    paramIndex++;
  }

  if (filters.max_price) {
    query += ` AND base_price_per_night <= $${paramIndex}`;
    params.push(filters.max_price);
    paramIndex++;
  }

  if (filters.min_guests) {
    query += ` AND max_guests >= $${paramIndex}`;
    params.push(filters.min_guests);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC`;

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
  }

  return await queryDatabase(query, params) as Property[];
}

/**
 * Atualizar propriedade
 */
export async function updateProperty(
  propertyId: number,
  updates: Partial<Property>,
  userId?: number
): Promise<Property | null> {
  const updatesList: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Verificar permissões (se necessário)
  const property = await getPropertyById(propertyId);
  if (!property) {
    return null;
  }

  // Se userId fornecido, verificar se é o owner
  if (userId && property.owner_id && property.owner_id !== userId) {
    throw new Error('Sem permissão para atualizar esta propriedade');
  }

  Object.keys(updates).forEach((key) => {
    if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
      const value = updates[key as keyof Property];
      if (value !== undefined) {
        if (key === 'amenities' || key === 'images' || key === 'metadata') {
          updatesList.push(`${key} = $${paramIndex}`);
          values.push(value ? JSON.stringify(value) : null);
        } else {
          updatesList.push(`${key} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    }
  });

  if (updatesList.length === 0) {
    return property;
  }

  values.push(propertyId);

  const result = await queryDatabase(
    `UPDATE properties 
     SET ${updatesList.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );

  return result.length > 0 ? (result[0] as Property) : null;
}

/**
 * Deletar propriedade (soft delete)
 */
export async function deleteProperty(
  propertyId: number,
  userId?: number
): Promise<boolean> {
  const property = await getPropertyById(propertyId);
  if (!property) {
    return false;
  }

  // Verificar permissões
  if (userId && property.owner_id && property.owner_id !== userId) {
    throw new Error('Sem permissão para deletar esta propriedade');
  }

  // Soft delete (mudar status para inactive)
  await queryDatabase(
    `UPDATE properties SET status = 'inactive' WHERE id = $1`,
    [propertyId]
  );

  return true;
}

/**
 * ✅ ITEM 48: API DE DISPONIBILIDADE
 */

/**
 * Consultar disponibilidade
 */
export async function checkAvailability(
  propertyId: number,
  checkIn: Date,
  checkOut: Date,
  unitsNeeded: number = 1
): Promise<{
  available: boolean;
  unavailable_dates: string[];
  min_price: number;
  max_price: number;
  details: Availability[];
}> {
  const result = await queryDatabase(
    `SELECT * FROM check_availability_period($1, $2, $3, $4)`,
    [propertyId, checkIn.toISOString().split('T')[0], checkOut.toISOString().split('T')[0], unitsNeeded]
  );

  if (result.length === 0) {
    return {
      available: false,
      unavailable_dates: [],
      min_price: 0,
      max_price: 0,
      details: [],
    };
  }

  const availability = result[0];

  // Buscar detalhes de cada data
  const details = await queryDatabase(
    `SELECT * FROM availability 
     WHERE property_id = $1 
     AND date BETWEEN $2 AND $3
     ORDER BY date`,
    [propertyId, checkIn.toISOString().split('T')[0], checkOut.toISOString().split('T')[0]]
  );

  return {
    available: availability.available,
    unavailable_dates: availability.unavailable_dates || [],
    min_price: parseFloat(availability.min_price) || 0,
    max_price: parseFloat(availability.max_price) || 0,
    details: details as Availability[],
  };
}

/**
 * Bloquear datas
 */
export async function blockDates(
  propertyId: number,
  dates: Date[],
  blockReason: string = 'manual',
  blockType: string = 'manual',
  blockedBy?: number,
  notes?: string
): Promise<Availability[]> {
  const results: Availability[] = [];

  for (const date of dates) {
    const dateStr = date.toISOString().split('T')[0];

    // Verificar se já existe
    const existing = await queryDatabase(
      `SELECT * FROM availability WHERE property_id = $1 AND date = $2`,
      [propertyId, dateStr]
    );

    let result;
    if (existing.length > 0) {
      // Atualizar
      result = await queryDatabase(
        `UPDATE availability 
         SET is_available = false, block_reason = $1, block_type = $2, blocked_by = $3, blocked_at = CURRENT_TIMESTAMP, notes = $4
         WHERE property_id = $5 AND date = $6
         RETURNING *`,
        [blockReason, blockType, blockedBy || null, notes || null, propertyId, dateStr]
      );
    } else {
      // Criar
      result = await queryDatabase(
        `INSERT INTO availability 
         (property_id, date, is_available, block_reason, block_type, blocked_by, blocked_at, notes)
         VALUES ($1, $2, false, $3, $4, $5, CURRENT_TIMESTAMP, $6)
         RETURNING *`,
        [propertyId, dateStr, blockReason, blockType, blockedBy || null, notes || null]
      );
    }

    if (result.length > 0) {
      results.push(result[0] as Availability);
    }
  }

  return results;
}

/**
 * Liberar datas
 */
export async function unblockDates(
  propertyId: number,
  dates: Date[]
): Promise<boolean> {
  const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);

  await queryDatabase(
    `UPDATE availability 
     SET is_available = true, block_reason = NULL, block_type = 'manual', blocked_by = NULL, blocked_at = NULL, notes = NULL
     WHERE property_id = $1 AND date = ANY($2::DATE[])`,
    [propertyId, dateStrings]
  );

  return true;
}

/**
 * ✅ ITEM 49: API DE PROPRIETÁRIOS
 */

/**
 * Criar proprietário
 */
export async function createOwner(ownerData: Partial<Owner>): Promise<Owner> {
  const {
    user_id,
    legal_name,
    document_type,
    document_number,
    email,
    ...rest
  } = ownerData;

  if (!user_id || !legal_name || !document_type || !document_number || !email) {
    throw new Error('Campos obrigatórios: user_id, legal_name, document_type, document_number, email');
  }

  const result = await queryDatabase(
    `INSERT INTO owners 
     (user_id, company_name, legal_name, document_type, document_number, email, phone, mobile_phone,
      address_street, address_number, address_complement, address_neighborhood, address_city, address_state,
      address_zip_code, address_country, bank_name, bank_agency, bank_account, bank_account_type, pix_key,
      status, verification_status, commission_rate, payment_method, payment_terms, notes, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
     RETURNING *`,
    [
      user_id,
      rest.company_name || null,
      legal_name,
      document_type,
      document_number,
      email,
      rest.phone || null,
      rest.mobile_phone || null,
      rest.address_street || null,
      rest.address_number || null,
      rest.address_complement || null,
      rest.address_neighborhood || null,
      rest.address_city || null,
      rest.address_state || null,
      rest.address_zip_code || null,
      rest.address_country || 'Brasil',
      rest.bank_name || null,
      rest.bank_agency || null,
      rest.bank_account || null,
      rest.bank_account_type || null,
      rest.pix_key || null,
      rest.status || 'active',
      rest.verification_status || 'pending',
      rest.commission_rate || 15.00,
      rest.payment_method || 'bank_transfer',
      rest.payment_terms || 30,
      rest.notes || null,
      rest.metadata ? JSON.stringify(rest.metadata) : null,
    ]
  );

  return result[0] as Owner;
}

/**
 * Obter proprietário por ID
 */
export async function getOwnerById(ownerId: number): Promise<Owner | null> {
  const owners = await queryDatabase(
    `SELECT * FROM owners WHERE id = $1`,
    [ownerId]
  );

  return owners.length > 0 ? (owners[0] as Owner) : null;
}

/**
 * Obter proprietário por user_id
 */
export async function getOwnerByUserId(userId: number): Promise<Owner | null> {
  const owners = await queryDatabase(
    `SELECT * FROM owners WHERE user_id = $1`,
    [userId]
  );

  return owners.length > 0 ? (owners[0] as Owner) : null;
}

/**
 * Listar proprietários
 */
export async function listOwners(
  filters: {
    status?: string;
    verification_status?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Owner[]> {
  let query = `SELECT * FROM owners WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.verification_status) {
    query += ` AND verification_status = $${paramIndex}`;
    params.push(filters.verification_status);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC`;

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
  }

  return await queryDatabase(query, params) as Owner[];
}

/**
 * Atualizar proprietário
 */
export async function updateOwner(
  ownerId: number,
  updates: Partial<Owner>
): Promise<Owner | null> {
  const updatesList: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.keys(updates).forEach((key) => {
    if (key !== 'id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at') {
      const value = updates[key as keyof Owner];
      if (value !== undefined) {
        if (key === 'metadata') {
          updatesList.push(`${key} = $${paramIndex}`);
          values.push(value ? JSON.stringify(value) : null);
        } else {
          updatesList.push(`${key} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    }
  });

  if (updatesList.length === 0) {
    return await getOwnerById(ownerId);
  }

  values.push(ownerId);

  const result = await queryDatabase(
    `UPDATE owners 
     SET ${updatesList.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );

  return result.length > 0 ? (result[0] as Owner) : null;
}

/**
 * ✅ ITEM 50: API DE COTAS
 */

/**
 * Criar cota
 */
export async function createShare(shareData: Partial<Share>): Promise<Share> {
  const { property_id, owner_id, share_percentage, ...rest } = shareData;

  if (!property_id || !owner_id || !share_percentage) {
    throw new Error('Campos obrigatórios: property_id, owner_id, share_percentage');
  }

  if (share_percentage <= 0 || share_percentage > 100) {
    throw new Error('share_percentage deve estar entre 0 e 100');
  }

  const result = await queryDatabase(
    `INSERT INTO shares 
     (property_id, owner_id, share_percentage, share_value, share_number, status, notes, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      property_id,
      owner_id,
      share_percentage,
      rest.share_value || null,
      rest.share_number || null,
      rest.status || 'active',
      rest.notes || null,
      rest.metadata ? JSON.stringify(rest.metadata) : null,
    ]
  );

  return result[0] as Share;
}

/**
 * Obter cotas de uma propriedade
 */
export async function getPropertyShares(propertyId: number): Promise<Share[]> {
  return await queryDatabase(
    `SELECT * FROM shares WHERE property_id = $1 ORDER BY created_at DESC`,
    [propertyId]
  ) as Share[];
}

/**
 * Obter cotas de um proprietário
 */
export async function getOwnerShares(ownerId: number): Promise<Share[]> {
  return await queryDatabase(
    `SELECT * FROM shares WHERE owner_id = $1 ORDER BY created_at DESC`,
    [ownerId]
  ) as Share[];
}

/**
 * Transferir cota
 */
export async function transferShare(
  shareId: number,
  toOwnerId: number,
  transferType: string = 'sale',
  transferValue?: number,
  transferDate?: Date,
  notes?: string
): Promise<Share> {
  const share = await queryDatabase(
    `SELECT * FROM shares WHERE id = $1`,
    [shareId]
  );

  if (share.length === 0) {
    throw new Error('Cota não encontrada');
  }

  const currentShare = share[0] as Share;

  // Criar nova cota para o novo proprietário
  const newShare = await createShare({
    property_id: currentShare.property_id,
    owner_id: toOwnerId,
    share_percentage: currentShare.share_percentage,
    share_value: transferValue || currentShare.share_value,
    status: 'active',
    transferred_from: shareId,
  });

  // Atualizar cota original
  await queryDatabase(
    `UPDATE shares 
     SET status = 'transferred', transferred_to = $1, transferred_at = $2, transfer_reason = $3
     WHERE id = $4`,
    [newShare.id, (transferDate || new Date()).toISOString().split('T')[0], notes || null, shareId]
  );

  // Registrar transferência
  await queryDatabase(
    `INSERT INTO share_transfers 
     (share_id, from_owner_id, to_owner_id, transfer_type, transfer_value, transfer_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      shareId,
      currentShare.owner_id,
      toOwnerId,
      transferType,
      transferValue || null,
      (transferDate || new Date()).toISOString().split('T')[0],
      notes || null,
    ]
  );

  return newShare;
}

/**
 * Atualizar cota
 */
export async function updateShare(
  shareId: number,
  updates: Partial<Share>
): Promise<Share | null> {
  const updatesList: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.keys(updates).forEach((key) => {
    if (key !== 'id' && key !== 'property_id' && key !== 'created_at' && key !== 'updated_at') {
      const value = updates[key as keyof Share];
      if (value !== undefined) {
        if (key === 'metadata') {
          updatesList.push(`${key} = $${paramIndex}`);
          values.push(value ? JSON.stringify(value) : null);
        } else {
          updatesList.push(`${key} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    }
  });

  if (updatesList.length === 0) {
    const shares = await queryDatabase(
      `SELECT * FROM shares WHERE id = $1`,
      [shareId]
    );
    return shares.length > 0 ? (shares[0] as Share) : null;
  }

  values.push(shareId);

  const result = await queryDatabase(
    `UPDATE shares 
     SET ${updatesList.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );

  return result.length > 0 ? (result[0] as Share) : null;
}

/**
 * Deletar cota (soft delete)
 */
export async function deleteShare(shareId: number): Promise<boolean> {
  await queryDatabase(
    `UPDATE shares SET status = 'cancelled' WHERE id = $1`,
    [shareId]
  );
  return true;
}

