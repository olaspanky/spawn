'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Good } from '@/app/types/goods';

interface CartItem {
  storeId: string;
  item: { _id: string; name: string; price: number };
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (storeId: string, item: Good) => void;
  updateQuantity: (storeId: string, itemId: string, quantity: number) => void;
  removeFromCart: (storeId: string, itemId: string) => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  clearCart: () => void; // Add clearCart
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (storeId: string, item: Good) => {
    setCart((prev) => {
      const existingItem = prev.find(
        (cartItem) => cartItem.storeId === storeId && cartItem.item._id === item._id,
      );
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.storeId === storeId && cartItem.item._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [
        ...prev,
        { storeId, item: { _id: item._id, name: item.name, price: item.price }, quantity: 1 },
      ];
    });
  };

  const updateQuantity = (storeId: string, itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(storeId, itemId);
      return;
    }
    setCart((prev) =>
      prev.map((cartItem) =>
        cartItem.storeId === storeId && cartItem.item._id === itemId
          ? { ...cartItem, quantity }
          : cartItem,
      ),
    );
  };

  const removeFromCart = (storeId: string, itemId: string) => {
    setCart((prev) =>
      prev.filter((cartItem) => !(cartItem.storeId === storeId && cartItem.item._id === itemId)),
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, cartItem) => total + cartItem.item.price * cartItem.quantity, 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, cartItem) => count + cartItem.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, getCartTotal, getItemCount, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};