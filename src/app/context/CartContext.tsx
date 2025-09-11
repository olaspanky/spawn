'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface CartItem {
  storeId: string;
  item: StoreItem;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (storeId: string, item: StoreItem, quantity?: number) => void;
  updateQuantity: (storeId: string, itemId: string, quantity: number) => void;
  removeFromCart: (storeId: string, itemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (storeId: string, item: StoreItem, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.storeId === storeId && cartItem.item._id === item._id
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.storeId === storeId && cartItem.item._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prevCart, { storeId, item, quantity }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (storeId: string, itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(storeId, itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.storeId === storeId && cartItem.item._id === itemId
          ? { ...cartItem, quantity }
          : cartItem
      )
    );
  };

  const removeFromCart = (storeId: string, itemId: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (cartItem) => !(cartItem.storeId === storeId && cartItem.item._id === itemId)
      )
    );
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    toast.success('Cart cleared');
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, cartItem) => total + cartItem.item.price * cartItem.quantity,
      0
    );
  };

  const getItemCount = () => {
    return cart.reduce((count, cartItem) => count + cartItem.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};