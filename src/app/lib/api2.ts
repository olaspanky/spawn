// import { Good, Category } from '../types/goods';

// const API_BASE_URL = 'http://localhost:5000/api/store';

// export const goodsApi = {
//   // Get all goods (public, no auth required)
//   getGoods: async (category?: Category, available?: boolean, search?: string): Promise<Good[]> => {
//     const params = new URLSearchParams();
//     if (category) params.append('category', category);
//     if (available !== undefined) params.append('available', available.toString());
//     if (search) params.append('search', search);

//     const response = await fetch(`${API_BASE_URL}/goods?${params}`);
//     if (!response.ok) throw new Error('Failed to fetch goods');
//     return response.json();
//   },

//   // Get single good (public, no auth required)
//   getGood: async (id: string): Promise<Good> => {
//     const response = await fetch(`${API_BASE_URL}/${id}`);
//     if (!response.ok) throw new Error('Failed to fetch good');
//     return response.json();
//   },

//   // Create good (requires auth)
//   createGood: async (good: FormData, token: string): Promise<Good> => {
//     const response = await fetch(`${API_BASE_URL}/goods`, {
//       method: 'POST',
//       headers: {
//         'x-auth-token': token, // Include token
//       },
//       body: good,
//     });
//     if (!response.ok) {
//       if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
//       throw new Error('Failed to create good');
//     }
//     return response.json();
//   },

//   // Update good (requires auth)
//   updateGood: async (id: string, good: FormData, token: string): Promise<Good> => {
//     const response = await fetch(`${API_BASE_URL}/${id}`, {
//       method: 'PUT',
//       headers: {
//         'x-auth-token': token, // Include token
//       },
//       body: good,
//     });
//     if (!response.ok) {
//       if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
//       throw new Error('Failed to update good');
//     }
//     return response.json();
//   },

//   // Delete good (requires auth)
//   deleteGood: async (id: string, token: string): Promise<void> => {
//     const response = await fetch(`${API_BASE_URL}/${id}`, {
//       method: 'DELETE',
//       headers: {
//         'x-auth-token': token, // Include token
//       },
//     });
//     if (!response.ok) {
//       if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
//       throw new Error('Failed to delete good');
//     }
//   },

//   // Toggle availability (requires auth)
//   toggleAvailability: async (id: string, token: string): Promise<Good> => {
//     const response = await fetch(`${API_BASE_URL}/${id}/availability`, {
//       method: 'PUT',
//       headers: {
//         'x-auth-token': token, // Include token
//       },
//     });
//     if (!response.ok) {
//       if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
//       throw new Error('Failed to toggle availability');
//     }
//     return response.json();
//   },


// };


import { Good, Category, Purchase } from '../types/goods';

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
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch good');
    return response.json();
  },

  // Create good (requires auth)
  createGood: async (good: FormData, token: string): Promise<Good> => {
    const response = await fetch(`${API_BASE_URL}/goods`, {
      method: 'POST',
      headers: {
        'x-auth-token': token,
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
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token,
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
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
      throw new Error('Failed to delete good');
    }
  },

  // Toggle availability (requires auth)
  toggleAvailability: async (id: string, token: string): Promise<Good> => {
    const response = await fetch(`${API_BASE_URL}/${id}/availability`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token,
      },
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
      throw new Error('Failed to toggle availability');
    }
    return response.json();
  },

  // Confirm payment (requires auth)
 confirmPayment: async (
  data: {
    cart: { storeId: string; item: { _id: string; name: string; price: number }; quantity: number }[];
    paymentReference: string;
    serviceCharge: number;
    deliveryFee: number;
    deliveryType: string;
    expectedDelivery: any,
    dropOffLocation: string;
    addressDetails: string;
  },
  token: string,
): Promise<{ message: string; purchaseId: string }> => {
  const response = await fetch(`${API_BASE_URL}/confirm-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify({
      cart: data.cart,
      paymentReference: data.paymentReference,
      deliveryType: data.deliveryType,
      expectedDelivery: data.expectedDelivery,
      serviceCharge: data.serviceCharge,
      deliveryFee: data.deliveryFee,
      dropOffLocation: data.dropOffLocation,
      addressDetails: data.addressDetails,
    }),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit payment reference');
  }
  return response.json();
},

confirmGuestPayment: async (data: {
  cart: { storeId: string; item: { _id: string; name: string; price: number }; quantity: number }[];
  paymentReference: string;
  expectedDelivery: any;
  serviceCharge: number;
  deliveryFee: number;
  deliveryType: string;
  dropOffLocation: string;
  addressDetails: string;
  guestInfo: {
    name: string;
    phone: string;
    email: string;
  };
}): Promise<{ message: string; purchaseId: string }> => {
  const response = await fetch(`${API_BASE_URL}/confirm-guest-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit guest payment reference');
  }
  return response.json();
},

  // Get all purchases (admin-only, requires auth)
  getAllPurchases: async (token: string): Promise<Purchase[]> => {
    const response = await fetch(`${API_BASE_URL}/purchases/all`, {
      headers: {
        'x-auth-token': token,
      },
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
      if (response.status === 403) throw new Error('Admin access required');
      throw new Error('Failed to fetch purchases');
    }
    return response.json();
  },

  // Get user purchases (requires auth)
  getUserPurchases: async (token: string): Promise<Purchase[]> => {
    const response = await fetch(`${API_BASE_URL}/purchases`, {
      headers: {
        'x-auth-token': token,
      },
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
      throw new Error('Failed to fetch user purchases');
    }
    return response.json();
  },

  // Update purchase status (admin-only, requires auth)
  updatePurchaseStatus: async (purchaseId: string, status: 'pending' | 'confirmed' | 'cancelled', token: string): Promise<Purchase> => {
    const response = await fetch(`${API_BASE_URL}/purchases/${purchaseId}/status`, {
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
      throw new Error('Failed to update purchase status');
    }
    return response.json();
  },
};