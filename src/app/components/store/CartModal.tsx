'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import toast from 'react-hot-toast';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';
import { goodsApi } from '@/app/lib/api2';
import { Purchase } from '@/app/types/goods';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, getItemCount, clearCart } = useCart();
  const { token, logout } = useAuth();
  const router = useRouter(); // For redirecting to /purchases
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]); // Optional: to display purchases in modal
  const [showPurchases, setShowPurchases] = useState(false); // Toggle to show purchases

  const handlePaymentSubmission = async () => {
    if (!token) {
      toast.error('Please log in to proceed with payment');
      return;
    }

    if (!paymentReference.trim()) {
      toast.error('Please enter a payment reference number');
      return;
    }

    setIsSubmitting(true);
    try {
      await goodsApi.confirmPayment(cart, paymentReference, token);
      toast.success('Payment reference submitted successfully! Please send the receipt via WhatsApp.');
      
      // Fetch user purchases
      try {
        const userPurchases = await goodsApi.getUserPurchases(token);
        setPurchases(userPurchases);
        setShowPurchases(true); // Show purchases in modal (optional)
        clearCart(); // Clear cart after successful submission
        // Optionally redirect to /purchases instead of showing in modal
        // router.push('/purchases');
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch your purchases');
      }
    } catch (error: any) {
      if (error.message.includes('Unauthorized') || error.message.includes('No token') || error.message.includes('Token is not valid')) {
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        toast.error(error.message || 'Payment submission failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const whatsappNumber = '2347049374912';
    const orderSummary = cart
      .map(
        (item) =>
          `${item.item.name} (Qty: ${item.quantity}, Price: $${(item.item.price * item.quantity).toFixed(2)})`,
      )
      .join('\n');
    const message = `Payment Receipt for Order:\n\n${orderSummary}\n\nTotal: $${getCartTotal().toFixed(
      2,
    )}\nPayment Reference: ${paymentReference || 'Not provided yet'}\n\nPlease attach the payment receipt screenshot.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
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

        {cart.length === 0 && !showPurchases ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Your cart is empty</p>
          </div>
        ) : showPurchases ? (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Recent Purchases</h3>
            {purchases.length === 0 ? (
              <p className="text-gray-600 text-center">No purchases found.</p>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div
                    key={purchase._id}
                    className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md font-medium text-gray-900">
                        Order ID: {purchase._id}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          purchase.status === 'pending'
                            ? 'bg-yellow-200 text-yellow-800'
                            : purchase.status === 'confirmed'
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      <strong>Payment Reference:</strong> {purchase.paymentReference}
                    </p>
                    <p className="text-gray-600">
                      <strong>Total Amount:</strong> ${purchase.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-gray-600">
                      <strong>Date:</strong>{' '}
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      <strong>Items:</strong>
                      <ul className="list-disc pl-5">
                        {purchase.items.map((item, index) => (
                          <li key={index} className="text-gray-600">
                            {item.item.name} (Qty: {item.item.quantity}, Price: $
                            {item.item.price.toFixed(2)}, Total: $
                            {(item.item.price * item.item.quantity).toFixed(2)})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => router.push('/goods/purchase')}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Purchases
            </button>
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
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">Payment Instructions</h3>
                <p className="text-gray-600 mt-2">
                  Please transfer the total amount of <strong>${getCartTotal().toFixed(2)}</strong> to
                  the following Opay account:
                </p>
                <p className="text-gray-800 font-medium mt-2">Account Number: 7049374912</p>
                <p className="text-gray-600 mt-2">
                  After making the payment, enter the payment reference number below and send the
                  payment receipt screenshot to our WhatsApp number: <strong>07049374912</strong>.
                </p>
                <div className="mt-4">
                  <label htmlFor="paymentReference" className="block text-gray-700 font-medium">
                    Payment Reference Number
                  </label>
                  <input
                    type="text"
                    id="paymentReference"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="mt-2 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8d4817]"
                    placeholder="Enter payment reference number"
                  />
                </div>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={handlePaymentSubmission}
                    disabled={isSubmitting}
                    className={`flex-1 bg-[#8d4817] text-white py-3 rounded-lg hover:bg-[#6d5341] transition-colors ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Payment Reference'}
                  </button>
                  <button
                    onClick={handleWhatsAppRedirect}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Send Receipt via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;