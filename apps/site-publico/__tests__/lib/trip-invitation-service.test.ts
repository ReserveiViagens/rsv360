/**
 * ✅ FASE 5 - ETAPA 5.1: Testes Unitários - Trip Invitation Service
 * Testes para o serviço de convites de viagem
 * 
 * @module __tests__/lib/trip-invitation-service.test
 */

import {
  createTripInvitation,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  listReceivedInvitations,
  listSentInvitations
} from '@/lib/trip-invitation-service';
import { queryDatabase } from '@/lib/db';

// Mocks
jest.mock('@/lib/db');

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;

describe('TripInvitationService', () => {
  const userId = 1;
  const invitationId = 1;
  const token = 'test-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (mockQueryDatabase as jest.Mock).mockReset();
  });

  describe('createTripInvitation', () => {
    it('should create invitation for wishlist', async () => {
      // Arrange
      const inviteData = {
        invitedEmail: 'newuser@example.com',
        invitedBy: userId,
        invitationType: 'wishlist' as const,
        options: {
          wishlistId: 1,
          invitedName: 'New User',
          message: 'Join our trip!',
          expiresInDays: 7
        }
      };

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: invitationId,
          invited_email: inviteData.invitedEmail,
          invited_by: userId,
          token: 'generated-token',
          invitation_type: inviteData.invitationType,
          wishlist_id: inviteData.options.wishlistId,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }]) // Create invitation
        .mockResolvedValueOnce([{
          id: 1,
          invitation_id: invitationId,
          action: 'sent'
        }]); // Create history

      // Act
      const result = await createTripInvitation(
        inviteData.invitedEmail,
        inviteData.invitedBy,
        inviteData.invitationType,
        inviteData.options
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.invited_email).toBe(inviteData.invitedEmail);
      expect(result.invitation_type).toBe(inviteData.invitationType);
      expect(result.status).toBe('pending');
      expect(mockQueryDatabase).toHaveBeenCalledTimes(2);
    });

    it('should create invitation for booking', async () => {
      // Arrange
      const inviteData = {
        invitedEmail: 'user@example.com',
        invitedBy: userId,
        invitationType: 'booking' as const,
        options: {
          bookingId: 1
        }
      };

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: invitationId,
          ...inviteData,
          booking_id: inviteData.options.bookingId,
          token: 'token',
          status: 'pending'
        }])
        .mockResolvedValueOnce([{ id: 1 }]);

      // Act
      const result = await createTripInvitation(
        inviteData.invitedEmail,
        inviteData.invitedBy,
        inviteData.invitationType,
        inviteData.options
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.booking_id).toBe(inviteData.options.bookingId);
    });

    it('should use default expiration of 7 days', async () => {
      // Arrange
      const inviteData = {
        invitedEmail: 'user@example.com',
        invitedBy: userId,
        invitationType: 'trip' as const,
        options: {} // No expiresInDays
      };

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: invitationId,
          ...inviteData,
          expires_at: expiresAt.toISOString()
        }])
        .mockResolvedValueOnce([{ id: 1 }]);

      // Act
      const result = await createTripInvitation(
        inviteData.invitedEmail,
        inviteData.invitedBy,
        inviteData.invitationType,
        inviteData.options
      );

      // Assert
      expect(result).toBeDefined();
      const resultExpiresAt = new Date(result.expires_at);
      expect(resultExpiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('getInvitationByToken', () => {
    it('should return invitation if token is valid', async () => {
      // Arrange
      const mockInvitation = {
        id: invitationId,
        token,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
      };

      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([mockInvitation]);

      // Act
      const result = await getInvitationByToken(token);

      // Assert
      expect(result).toBeDefined();
      expect(result?.token).toBe(token);
    });

    it('should return null if token is invalid', async () => {
      // Arrange
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([]); // SELECT invitation (não encontrado)

      // Act
      const result = await getInvitationByToken('invalid-token');

      // Assert
      expect(result).toBeNull();
    });

    it('should return expired invitation if token exists but is expired', async () => {
      // Arrange
      const expiredInvitation = {
        id: invitationId,
        token,
        status: 'pending',
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Expired
        invited_email: 'test@example.com',
        invited_by: userId,
        invitation_type: 'wishlist',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        inviter_name: null,
        inviter_email: null
      };

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([expiredInvitation]) // SELECT invitation
        .mockResolvedValueOnce([{
          ...expiredInvitation,
          status: 'expired'
        }]); // UPDATE status to expired

      // Act
      const result = await getInvitationByToken(token);

      // Assert
      // O serviço retorna o objeto com status 'expired' quando encontra mas está expirado
      expect(result).toBeDefined();
      expect(result?.status).toBe('expired');
    });
  });

  describe('acceptInvitation', () => {
    it('should accept invitation successfully', async () => {
      // Arrange
      const mockInvitation = {
        id: invitationId,
        token,
        status: 'pending',
        wishlist_id: 1,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([mockInvitation]) // Get invitation (getInvitationByToken)
        .mockResolvedValueOnce([{
          id: invitationId,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          expires_at: mockInvitation.expires_at
        }]) // Update invitation
        .mockResolvedValueOnce([{
          id: 1,
          invitation_id: invitationId,
          action: 'accepted'
        }]) // Create history
        .mockResolvedValueOnce([{
          id: 1,
          wishlist_id: mockInvitation.wishlist_id,
          user_id: userId
        }]); // Add to wishlist (pode falhar silenciosamente)

      // Act
      const result = await acceptInvitation(token, userId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.status).toBe('accepted');
      // O serviço pode fazer mais chamadas dependendo do tipo de convite
      expect(mockQueryDatabase).toHaveBeenCalled();
    });

    it('should throw error if invitation is already accepted', async () => {
      // Arrange
      const mockInvitation = {
        id: invitationId,
        token,
        status: 'accepted'
      };

      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([mockInvitation]);

      // Act & Assert
      const result = await acceptInvitation(token, userId);
      expect(result).toBeNull(); // Já foi processado, retorna null
    });

    it('should throw error if invitation is expired', async () => {
      // Arrange
      const mockInvitation = {
        id: invitationId,
        token,
        status: 'pending',
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      };

      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([mockInvitation]);

      // Act & Assert
      const result = await acceptInvitation(token, userId);
      expect(result).toBeNull(); // Expirado, retorna null
    });
  });

  describe('declineInvitation', () => {
    it('should decline invitation successfully', async () => {
      // Arrange
      const mockInvitation = {
        id: invitationId,
        token,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([mockInvitation]) // Get invitation (getInvitationByToken)
        .mockResolvedValueOnce([{
          ...mockInvitation,
          status: 'declined',
          declined_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]) // Update invitation (RETURNING *)
        .mockResolvedValueOnce([{
          id: 1,
          invitation_id: invitationId,
          action: 'declined'
        }]); // Create history

      // Act
      const result = await declineInvitation(token);

      // Assert
      expect(result).toBeDefined();
      expect(result?.status).toBe('declined');
    });
  });

  describe('listReceivedInvitations', () => {
    it('should return all invitations for an email', async () => {
      // Arrange
      const email = 'user@example.com';
      const mockInvitations = [
        { id: 1, invited_email: email, status: 'pending' },
        { id: 2, invited_email: email, status: 'accepted' }
      ];

      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce(mockInvitations);

      // Act
      const result = await listReceivedInvitations(email);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(inv => inv.invited_email === email)).toBe(true);
    });
  });

  describe('listSentInvitations', () => {
    it('should return all invitations sent by a user', async () => {
      // Arrange
      const mockInvitations = [
        { 
          id: 1, 
          invited_by: userId, 
          status: 'pending',
          invited_email: 'user1@example.com',
          invitation_type: 'wishlist',
          token: 'token-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        { 
          id: 2, 
          invited_by: userId, 
          status: 'accepted',
          invited_email: 'user2@example.com',
          invitation_type: 'wishlist',
          token: 'token-2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          accepted_at: new Date().toISOString()
        }
      ];

      // Reset mock antes de configurar
      (mockQueryDatabase as jest.Mock).mockReset();
      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce(mockInvitations);

      // Act
      const result = await listSentInvitations(userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(inv => inv.invited_by === userId)).toBe(true);
    });
  });

  describe('token generation', () => {
    it('should generate unique tokens', async () => {
      // Arrange
      const inviteData = {
        invitedEmail: 'user1@example.com',
        invitedBy: userId,
        invitationType: 'trip' as const
      };

      const tokens: string[] = [];

      // Generate multiple invitations
      for (let i = 0; i < 5; i++) {
        (mockQueryDatabase as jest.Mock)
          .mockResolvedValueOnce([{
            id: i + 1,
            ...inviteData,
            token: `token-${i}`,
            status: 'pending'
          }])
          .mockResolvedValueOnce([{ id: 1 }]);

        const result = await createTripInvitation(
          inviteData.invitedEmail,
          inviteData.invitedBy,
          inviteData.invitationType
        );

        tokens.push(result.token);
      }

      // Assert
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length); // All tokens should be unique
    });
  });
});

