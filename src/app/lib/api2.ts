import { Good, Category } from '../types/goods';

const API_BASE_URL = 'https://spawnback.vercel.app/api/store';

export const goodsApi = {
  // Get all goods (public, no auth required)
  getGoods: async (category?: Category, available?: boolean, search?: string): Promise<Good[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (available !== undefined) params.append('available', available.toString());
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE_URL}/goods?${params}`);
    if (!response.ok) throw new Error('Failed to fetch goods');
    return response.json();
  },

  // Get single good (public, no auth required)
  getGood: async (id: string): Promise<Good> => {
    const response = await fetch(`${API_BASE_URL}/goods/${id}`);
    if (!response.ok) throw new Error('Failed to fetch good');
    return response.json();
  },

  // Create good (requires auth)
  createGood: async (good: FormData, token: string): Promise<Good> => {
    const response = await fetch(`${API_BASE_URL}/goods`, {
      method: 'POST',
      headers: {
        'x-auth-token': token, // Include token
      },
      body: good,
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
      throw new Error('Failed to create good');
    }
    return response.json();
  },

  // Update good (requires auth)
  updateGood: async (id: string, good: FormData, token: string): Promise<Good> => {
    const response = await fetch(`${API_BASE_URL}/goods/${id}`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token, // Include token
      },
      body: good,
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
      throw new Error('Failed to update good');
    }
    return response.json();
  },

  // Delete good (requires auth)
  deleteGood: async (id: string, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/goods/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token, // Include token
      },
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
      throw new Error('Failed to delete good');
    }
  },

  // Toggle availability (requires auth)
  toggleAvailability: async (id: string, token: string): Promise<Good> => {
    const response = await fetch(`${API_BASE_URL}/goods/${id}/availability`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token, // Include token
      },
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
      throw new Error('Failed to toggle availability');
    }
    return response.json();
  },

  // Get category stats (assume public, adjust if auth required)
//   getCategoryStats: async (token?: string): Promise<any> => {
//     const headers = token ? { 'x-auth-token': token } : {};
//     const response = await fetch(`${API_BASE_URL}/goods/stats`, {
//       headers,
//     });
//     if (!response.ok) {
//       if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
//       throw new Error('Failed to fetch stats');
//     }
//     return response.json();
//   },
};