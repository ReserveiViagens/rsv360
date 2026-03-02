// Biblioteca de Analytics
// Sistema RSV 360 - Tracking de Eventos

export interface AnalyticsEvent {
  event_type: string
  event_name: string
  properties?: Record<string, any>
}

/**
 * Rastrear evento de analytics
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(event)
    })
  } catch (error) {
    console.error('Erro ao rastrear evento:', error)
    // Falha silenciosa - não interrompe o fluxo da aplicação
  }
}

/**
 * Eventos pré-definidos
 */
export const AnalyticsEvents = {
  // Perfil
  PROFILE_VIEWED: (userId: number) => ({
    event_type: 'profile',
    event_name: 'profile_viewed',
    properties: { user_id: userId }
  }),
  
  PROFILE_EDITED: (userId: number) => ({
    event_type: 'profile',
    event_name: 'profile_edited',
    properties: { user_id: userId }
  }),

  // Reservas
  BOOKING_CREATED: (bookingId: number, hotelId: number) => ({
    event_type: 'booking',
    event_name: 'booking_created',
    properties: { booking_id: bookingId, hotel_id: hotelId }
  }),

  BOOKING_CANCELLED: (bookingId: number) => ({
    event_type: 'booking',
    event_name: 'booking_cancelled',
    properties: { booking_id: bookingId }
  }),

  // Busca
  SEARCH_PERFORMED: (query: string, filters: Record<string, any>) => ({
    event_type: 'search',
    event_name: 'search_performed',
    properties: { query, filters }
  }),

  // Mensagens
  MESSAGE_SENT: (toUserId: number) => ({
    event_type: 'message',
    event_name: 'message_sent',
    properties: { to_user_id: toUserId }
  }),

  // Avaliações
  REVIEW_CREATED: (hostId: number, rating: number) => ({
    event_type: 'review',
    event_name: 'review_created',
    properties: { host_id: hostId, rating }
  }),

  // Upload
  FILE_UPLOADED: (fileType: string, fileSize: number) => ({
    event_type: 'upload',
    event_name: 'file_uploaded',
    properties: { file_type: fileType, file_size: fileSize }
  })
}

