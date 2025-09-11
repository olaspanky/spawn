'use client';
import { useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useAuth} from '@/app/context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, getItemCount } = useCart();
  const { token, logout } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!token) {
      toast.error('Please log in to proceed to checkout');
      return;
    }

    setIsCheckingOut(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      // Call your backend to create a checkout session
      const response = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ cart }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          logout();
          return;
        }
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2" />
            Your Cart ({getItemCount()} items)
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Your cart is empty</p>
          </div>
        ) : (
          <>
            {cart.map((cartItem) => (
              <div
                key={`${cartItem.storeId}-${cartItem.item._id}`}
                className="flex items-center border-b py-4"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{cartItem.item.name}</h3>
                  <p className="text-gray-600">
                    {/* {cartItem.item.measurement.value}{' '}
                    {cartItem.item.measurement.customUnit || cartItem.item.measurement.unit} */}
                  </p>
                  <p className="text-gray-800 font-medium">
                    ${cartItem.item.price.toFixed(2)} x {cartItem.quantity} = $
                    {(cartItem.item.price * cartItem.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(cartItem.storeId, cartItem.item._id, cartItem.quantity - 1)
                      }
                      className="px-2 py-1 text-gray-600 hover:text-gray-900"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-1">{cartItem.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(cartItem.storeId, cartItem.item._id, cartItem.quantity + 1)
                      }
                      className="px-2 py-1 text-gray-600 hover:text-gray-900"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(cartItem.storeId, cartItem.item._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-6">
              <div className="flex justify-between text-lg font-medium text-gray-900">
                <span>Total</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors ${
                  isCheckingOut ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;