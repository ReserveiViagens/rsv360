/**
 * ✅ SERVIÇO DE COMPLIANCE LGPD
 * 
 * Implementação de funcionalidades LGPD:
 * - Consentimento de cookies
 * - Política de privacidade
 * - Direito ao esquecimento
 * - Exportação de dados do usuário
 * - Anonimização de dados
 */

import { queryDatabase } from './db';
import { logAuditAction } from './audit-service';

export interface UserConsent {
  user_id: number;
  consent_type: 'cookies' | 'marketing' | 'analytics' | 'necessary';
  granted: boolean;
  granted_at?: string;
  revoked_at?: string;
}

export interface UserDataExport {
  personal_info: any;
  bookings: any[];
  payments: any[];
  messages: any[];
  preferences: any;
}

/**
 * Registrar consentimento do usuário
 */
export async function recordConsent(
  userId: number,
  consentType: 'cookies' | 'marketing' | 'analytics' | 'necessary',
  granted: boolean
): Promise<void> {
  try {
    await queryDatabase(
      `INSERT INTO user_consents (user_id, consent_type, granted, granted_at, revoked_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, consent_type) DO UPDATE SET
         granted = EXCLUDED.granted,
         granted_at = CASE WHEN EXCLUDED.granted THEN CURRENT_TIMESTAMP ELSE granted_at END,
         revoked_at = CASE WHEN NOT EXCLUDED.granted THEN CURRENT_TIMESTAMP ELSE revoked_at END,
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        consentType,
        granted,
        granted ? new Date().toISOString() : null,
        granted ? null : new Date().toISOString(),
      ]
    );

    await logAuditAction(userId, 'consent_updated', 'user_consent', {
      resourceId: userId,
      metadata: { consentType, granted },
    });
  } catch (error: any) {
    console.error('Erro ao registrar consentimento:', error);
    throw error;
  }
}

/**
 * Verificar consentimento
 */
export async function hasConsent(
  userId: number,
  consentType: 'cookies' | 'marketing' | 'analytics' | 'necessary'
): Promise<boolean> {
  try {
    const result = await queryDatabase(
      `SELECT granted FROM user_consents 
       WHERE user_id = $1 AND consent_type = $2
       ORDER BY updated_at DESC LIMIT 1`,
      [userId, consentType]
    );

    if (result.length === 0) {
      // Consentimentos necessários são sempre true
      return consentType === 'necessary';
    }

    return result[0].granted === true;
  } catch (error: any) {
    console.error('Erro ao verificar consentimento:', error);
    return consentType === 'necessary'; // Default para necessário
  }
}

/**
 * Exportar dados do usuário (Direito de acesso)
 */
export async function exportUserData(userId: number): Promise<UserDataExport> {
  try {
    const [user, bookings, payments, messages, preferences, consents] = await Promise.all([
      queryDatabase(`SELECT * FROM users WHERE id = $1`, [userId]),
      queryDatabase(`SELECT * FROM bookings WHERE user_id = $1`, [userId]),
      queryDatabase(`SELECT * FROM payments WHERE user_id = $1`, [userId]),
      queryDatabase(`SELECT * FROM messages WHERE user_id = $1 OR recipient_id = $1`, [userId]),
      queryDatabase(`SELECT * FROM user_preferences WHERE user_id = $1`, [userId]),
      queryDatabase(`SELECT * FROM user_consents WHERE user_id = $1`, [userId]),
    ]);

    await logAuditAction(userId, 'data_export', 'user_data', {
      resourceId: userId,
      metadata: { exportedAt: new Date().toISOString() },
    });

    return {
      personal_info: user[0] || {},
      bookings: bookings || [],
      payments: payments || [],
      messages: messages || [],
      preferences: preferences[0] || {},
      consents: consents || [],
    };
  } catch (error: any) {
    console.error('Erro ao exportar dados do usuário:', error);
    throw error;
  }
}

/**
 * Direito ao esquecimento (Deletar dados do usuário)
 */
export async function deleteUserData(userId: number, reason?: string): Promise<void> {
  try {
    // Anonimizar dados em vez de deletar (melhor prática LGPD)
    await queryDatabase(
      `UPDATE users SET
         email = 'deleted_${userId}@deleted.local',
         name = 'Usuário Deletado',
         phone = NULL,
         cpf = NULL,
         address = NULL,
         deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId]
    );

    // Anonimizar reservas
    await queryDatabase(
      `UPDATE bookings SET
         guest_name = 'Usuário Deletado',
         guest_email = 'deleted_${userId}@deleted.local',
         guest_phone = NULL,
         guest_cpf = NULL
       WHERE user_id = $1`,
      [userId]
    );

    // Anonimizar pagamentos
    await queryDatabase(
      `UPDATE payments SET
         payer_name = 'Usuário Deletado',
         payer_email = 'deleted_${userId}@deleted.local',
         payer_document = NULL
       WHERE user_id = $1`,
      [userId]
    );

    // Deletar mensagens pessoais
    await queryDatabase(`DELETE FROM messages WHERE user_id = $1 OR recipient_id = $1`, [userId]);

    // Deletar preferências
    await queryDatabase(`DELETE FROM user_preferences WHERE user_id = $1`, [userId]);

    // Deletar consentimentos
    await queryDatabase(`DELETE FROM user_consents WHERE user_id = $1`, [userId]);

    // Registrar auditoria
    await logAuditAction(userId, 'data_deletion', 'user_data', {
      resourceId: userId,
      metadata: { reason, deletedAt: new Date().toISOString() },
    });
  } catch (error: any) {
    console.error('Erro ao deletar dados do usuário:', error);
    throw error;
  }
}

/**
 * Anonimizar dados antigos (após período de retenção)
 */
export async function anonymizeOldData(retentionDays: number = 365): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Anonimizar usuários inativos há muito tempo
    const result = await queryDatabase(
      `UPDATE users SET
         email = 'anonymized_' || id || '@anonymized.local',
         name = 'Usuário Anonimizado',
         phone = NULL,
         cpf = NULL,
         address = NULL,
         anonymized_at = CURRENT_TIMESTAMP
       WHERE deleted_at IS NULL
       AND anonymized_at IS NULL
       AND last_login < $1
       RETURNING id`,
      [cutoffDate]
    );

    return result.length;
  } catch (error: any) {
    console.error('Erro ao anonimizar dados antigos:', error);
    return 0;
  }
}

/**
 * Obter política de privacidade atual
 */
export async function getPrivacyPolicy(): Promise<{ version: string; content: string; updated_at: string }> {
  try {
    const result = await queryDatabase(
      `SELECT * FROM privacy_policies 
       ORDER BY version DESC LIMIT 1`
    );

    if (result.length > 0) {
      return result[0];
    }

    // Política padrão
    return {
      version: '1.0',
      content: 'Política de Privacidade padrão. Configure no banco de dados.',
      updated_at: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Erro ao buscar política de privacidade:', error);
    return {
      version: '1.0',
      content: 'Política de Privacidade não disponível.',
      updated_at: new Date().toISOString(),
    };
  }
}

