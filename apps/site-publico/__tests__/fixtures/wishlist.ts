export const mockWishlist = {
  id: 1,
  name: 'Viagem Teste',
  description: 'Descricao teste',
  is_public: false,
  share_token: 'test-token-123',
  creator_id: 1,
  created_at: '2025-12-16T10:00:00Z',
  updated_at: '2025-12-16T10:00:00Z',
};

export const mockWishlistItems = [
  {
    id: 1,
    wishlist_id: 1,
    item_id: 123,
    item_type: 'property',
    votes_up: 5,
    votes_down: 1,
    votes_maybe: 2,
  },
];

export const mockVotes = [
  {
    id: 1,
    item_id: 1,
    user_id: 1,
    vote: 'up',
    voted_at: '2025-12-16T10:00:00Z',
  },
];
