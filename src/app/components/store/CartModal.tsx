"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";
import { ShoppingCart, X, Minus, Plus, Trash2, MapPin, MessageCircle } from "lucide-react";
import { goodsApi } from "@/app/lib/api2";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, getItemCount, clearCart } = useCart();
  const { token, logout } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [addressDetails, setAddressDetails] = useState("");

  // UI-restricted drop-off locations (UI hostels and campus areas)
  const uiLocations = [
    "Moremi Hall",
    "Awo Hall",
    "Fagunwa Hall",
    "Tedder Hall",
    "Queen Elizabeth Hall",
    "Queen Idia Hall",
    "Melville Hall",
    "Nnamdi Azikiwe Hall",
    "Sultan Bello Hall",
    "Obafemi Awolowo Hall",
    "Main Campus Area",
    "Faculty of Science Area",
    "Faculty of Arts Area",
    "University College Hospital (UCH) Area",
  ];

  // Memoize cart total to prevent unnecessary recalculations
  const cartTotal = useMemo(() => getCartTotal(), [cart]);

  // Calculate service charge based on cart total
  const serviceCharge = useMemo(() => {
    if (cartTotal <= 10000) return cartTotal * 0.10; // 10%
    if (cartTotal <= 50000) return cartTotal * 0.09; // 9%
    if (cartTotal <= 100000) return cartTotal * 0.07; // 7%
    return cartTotal * 0.06; // 6%
  }, [cartTotal]);

  const DELIVERY_FEE = 500;
  const totalWithServiceCharge = cartTotal + serviceCharge + DELIVERY_FEE;

  // Generate WhatsApp message
  const generateWhatsAppMessage = (): string => {
    const orderSummary = cart
      .map(
        (item) =>
          `${item.item.name} (Qty: ${item.quantity}, Price: ₦${(item.item.price * item.quantity).toFixed(2)})`
      )
      .join("\n");

    const serviceChargePercent = ((serviceCharge / cartTotal) * 100).toFixed(1);

    return `New Order from UI Campus:\n\n${orderSummary}\n\nSubtotal: ₦${cartTotal.toFixed(2)}\nService Charge: ₦${serviceCharge.toFixed(2)} (${serviceChargePercent}%)\nDelivery Fee: ₦${DELIVERY_FEE}\nTotal: ₦${totalWithServiceCharge.toFixed(2)}\n\nDrop-off Location: ${selectedLocation}\nAddress Details: ${addressDetails}\n\n*Payment screenshot attached*`;
  };

  // Handle payment with reference number
  // Handle payment with reference number
const handleConfirmWithReference = async () => {
  if (!token) {
    toast.error("Please log in to proceed with payment");
    return;
  }
  if (!paymentReference.trim()) {
    toast.error("Please enter a payment reference number");
    return;
  }
  if (paymentReference.trim().length < 6) {
    toast.error("Payment reference must be at least 6 characters");
    return;
  }
  if (!selectedLocation) {
    toast.error("Please select a drop-off location");
    return;
  }
  if (!addressDetails.trim()) {
    toast.error("Please enter address details (e.g., Room number)");
    return;
  }

  setIsSubmitting(true);
  try {
    await goodsApi.confirmPayment(
      {
        cart,
        paymentReference,
        serviceCharge,
        deliveryFee: DELIVERY_FEE,
        dropOffLocation: selectedLocation,
        addressDetails,
      },
      token
    );
    toast.success("Order confirmed successfully! We'll verify your payment and process your order.");

    clearCart();

    setTimeout(() => {
      const confirmView = window.confirm("Would you like to view your purchases?");
      if (confirmView) {
        router.push("/goods/purchase");
      } else {
        onClose();
      }
    }, 500);
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      toast.error("Session expired. Please log in again.");
      logout();
    } else {
      toast.error(error.message || "Order confirmation failed. Please try again.");
    }
  } finally {
    setIsSubmitting(false);
  }
};

  // Handle payment via WhatsApp screenshot
  const handleShareOnWhatsApp = () => {
    if (!selectedLocation) {
      toast.error("Please select a drop-off location");
      return;
    }
    if (!addressDetails.trim()) {
      toast.error("Please enter address details");
      return;
    }
    handleConfirmWithReference()

    const whatsappNumber = "2347049374912";
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp... Please attach your payment screenshot");
    
    // Optional: Clear cart after opening WhatsApp
    setTimeout(() => {
   
        clearCart();
        onClose();
      
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2 text-[#8d4817]" />
            Your Cart ({getItemCount()} items)
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-[#8d4817] transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingCart className="w-20 h-20 text-gray-400 mx-auto mb-6 opacity-70" />
            <p className="text-gray-600 text-lg">Your cart is empty</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cart.map((cartItem) => (
                <div
                  key={`${cartItem.storeId}-${cartItem.item._id}`}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{cartItem.item.name}</h3>
                    <p className="text-gray-700 font-medium">
                      ₦{cartItem.item.price.toFixed(2)} × {cartItem.quantity} = ₦
                      {(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(
                            cartItem.storeId,
                            cartItem.item._id,
                            cartItem.quantity - 1
                          )
                        }
                        className="px-3 py-1 text-[#8d4817] hover:text-[#6d5341] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={cartItem.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-1 text-gray-900 font-medium">{cartItem.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            cartItem.storeId,
                            cartItem.item._id,
                            cartItem.quantity + 1
                          )
                        }
                        className="px-3 py-1 text-[#8d4817] hover:text-[#6d5341]"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(cartItem.storeId, cartItem.item._id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <div className="flex justify-between text-lg font-medium text-gray-900 mb-2">
                <span>Subtotal</span>
                <span>₦{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-medium text-gray-900 mb-2">
                <span>Service Charge ({((serviceCharge / cartTotal) * 100).toFixed(1)}%)</span>
                <span>₦{serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-medium text-gray-900 mb-2">
                <span>Delivery Fee</span>
                <span>₦{DELIVERY_FEE}</span>
              </div>
              <div className="flex justify-between text-xl font-semibold text-gray-900 border-t pt-2 mt-2">
                <span>Total</span>
                <span>₦{totalWithServiceCharge.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment & Delivery Form */}
            <div className="mt-6 space-y-4">
              {/* Payment Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold mb-1">Payment Instructions:</p>
                <p className="text-sm text-blue-900">
                  Transfer <strong className="text-lg">₦{totalWithServiceCharge.toFixed(2)}</strong> to{" "}
                  <strong>Opay: 7049374912</strong>
                </p>
              </div>

              {/* Drop-off Location */}
              <div>
                <label htmlFor="dropOffLocation" className="block text-gray-700 font-medium mb-2 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-[#8d4817]" />
                  Drop-off Location (UI Campus Only) *
                </label>
                <select
                  id="dropOffLocation"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8d4817] text-gray-900"
                  required
                >
                  <option value="">Select a location</option>
                  {uiLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address Details */}
              <div>
                <label htmlFor="addressDetails" className="block text-gray-700 font-medium mb-2">
                  Specific Address Details *
                </label>
                <input
                  type="text"
                  id="addressDetails"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  placeholder="e.g., Room 101, Block A, Ground Floor"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8d4817] text-gray-900 placeholder-gray-400"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include room number, block, and any helpful landmarks
                </p>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-600 font-medium">Choose Payment Method</span>
                </div>
              </div>

              {/* Option 1: With Reference Number */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Option 1: Have Payment Reference?</h3>
                <p className="text-sm text-gray-700 mb-3">If your payment generated a reference number, enter it below:</p>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400 mb-3"
                  placeholder="Enter payment reference (min. 6 characters)"
                />
                <button
                  onClick={handleConfirmWithReference}
                  disabled={isSubmitting || !paymentReference.trim() || !selectedLocation || !addressDetails.trim()}
                  className={`w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold ${
                    isSubmitting || !paymentReference.trim() || !selectedLocation || !addressDetails.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isSubmitting ? "Processing..." : "Confirm Order with Reference"}
                </button>
              </div>

              {/* Option 2: Share Screenshot on WhatsApp */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Option 2: No Reference Number?</h3>
                <p className="text-sm text-gray-700 mb-3">Share your payment screenshot directly on WhatsApp:</p>
                <button
                  onClick={handleShareOnWhatsApp}
                  disabled={!selectedLocation || !addressDetails.trim()}
                  className={`w-full bg-[#25D366] text-white py-3 rounded-lg hover:bg-[#20BA5A] transition-colors font-semibold flex items-center justify-center ${
                    !selectedLocation || !addressDetails.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Share Payment Screenshot on WhatsApp
                </button>
                <p className="text-xs text-gray-600 mt-2">
                  This will open WhatsApp with your order details. Attach your payment screenshot and send.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;