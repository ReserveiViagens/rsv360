/**
 * ✅ TESTES: API WISHLISTS
 * Testes de integração para APIs de wishlists
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/wishlists/route';
import { queryDatabase } from '@/lib/db';
import { listUserWishlists, createWishlist } from '@/lib/wishlist-service';

jest.mock('@/lib/db');
jest.mock('@/lib/wishlist-service', () => ({
  listUserWishlists: jest.fn(),
  createWishlist: jest.fn(),
  getWishlist: jest.fn(),
}));
jest.mock('@/lib/api-auth', () => ({
  withAuth: (fn: any) => fn,
  optionalAuth: async () => ({ user: { id: 1, email: 'test@test.com' } }),
}));

describe('API Wishlists', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/wishlists', () => {
    it('deve listar wishlists do usuário', async () => {
      const mockWishlists = [
        {
          id: 1,
          name: 'Test Wishlist',
          is_public: false,
          share_token: 'abc123',
        },
      ];

      (listUserWishlists as jest.Mock).mockResolvedValueOnce(mockWishlists);

      const url = new URL('http://localhost/api/wishlists');
      url.searchParams.set('user_id', '1');
      const request = new NextRequest(url.toString());
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });
  });

  describe('POST /api/wishlists', () => {
    it('deve criar wishlist com dados válidos', async () => {
      const mockWishlist = {
        id: 1,
        name: 'New Wishlist',
        is_public: false,
        share_token: 'xyz789',
      };

      (createWishlist as jest.Mock).mockResolvedValueOnce(mockWishlist);

      const url = new URL('http://localhost/api/wishlists');
      const request = new NextRequest(url.toString(), {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Wishlist',
          is_public: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
