const API_BASE_URL = 'https://spawnback.vercel.app/api/store';


// src/lib/shoppingListsApi.ts
export const shoppingListsApi = {
  // Create shopping list (public, no auth required)
  createShoppingList: async (data: {
    name: string;
    contactMethod: 'email' | 'phone';
    contactValue: string;
    files: { url: string; publicId: string; originalName: string; mimeType: string }[];
  }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/shopping-lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create shopping list');
    }
    return response.json();
  },

  // Get all shopping lists (admin-only, requires auth)
  getAllShoppingLists: async (token: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/api/shopping-lists`, {
      headers: {
        'x-auth-token': token,
      },
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
      if (response.status === 403) throw new Error('Admin access required');
      throw new Error('Failed to fetch shopping lists');
    }
    return response.json().then((res) => res.data);
  },

  // Update shopping list status (admin-only, requires auth)
  updateShoppingListStatus: async (id: string, status: string, token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}api/shopping-lists/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
      if (response.status === 403) throw new Error('Admin access required');
      throw new Error('Failed to update shopping list status');
    }
    return response.json().then((res) => res.data);
  },
};


export const waitlistApi = {
  getAllWaitlistEntries: async (token: string): Promise<any[]> => {
    const response = await fetch('https://spawnback.vercel.app/api/waitlist', {
      headers: {
        'x-auth-token': token,
      },
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
      if (response.status === 403) throw new Error('Admin access required');
      throw new Error('Failed to fetch waitlist entries');
    }
    return response.json().then((res) => res.data);
  },
};