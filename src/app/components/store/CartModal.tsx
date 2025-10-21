"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";
import { ShoppingCart, X, Minus, Plus, Trash2, MapPin, MessageCircle, Gift, UserPlus, Clock, Zap, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { goodsApi } from "@/app/lib/api2";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, getItemCount, clearCart } = useCart();
  const { token, logout } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [deliveryType, setDeliveryType] = useState<"standard" | "express">("standard");

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

  const getDeliveryInfo = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (deliveryType === "express") {
      return {
        time: "Within 1-2 hours",
        fee: 1500,
        description: "Fast delivery"
      };
    }
    
    if (currentHour >= 9 && currentHour < 18) {
      return {
        time: "By 6:00 PM today",
        fee: 500,
        description: "Same-day delivery"
      };
    } else {
      return {
        time: "By 12:00 PM tomorrow",
        fee: 500,
        description: "Next-day delivery"
      };
    }
  };

  const deliveryInfo = getDeliveryInfo();
  const cartTotal = useMemo(() => getCartTotal(), [cart]);

  const serviceCharge = useMemo(() => {
    if (cartTotal <= 10000) return cartTotal * 0.10;
    if (cartTotal <= 50000) return cartTotal * 0.09;
    if (cartTotal <= 100000) return cartTotal * 0.07;
    return cartTotal * 0.06;
  }, [cartTotal]);

  const totalWithServiceCharge = cartTotal + serviceCharge + deliveryInfo.fee;

  const generateWhatsAppMessage = (): string => {
    const orderSummary = cart
      .map(
        (item) =>
          `${item.item.name} (Qty: ${item.quantity}, Price: ₦${(item.item.price * item.quantity).toFixed(2)})`
      )
      .join("\n");

    const serviceChargePercent = ((serviceCharge / cartTotal) * 100).toFixed(1);
    const customerInfo = token 
      ? "Registered Customer" 
      : `Guest Customer\nName: ${guestName}\nPhone: ${guestPhone}\nEmail: ${guestEmail}`;

    return `New Order from UI Campus:\n\n${customerInfo}\n\n${orderSummary}\n\nSubtotal: ₦${cartTotal.toFixed(2)}\nService Charge: ₦${serviceCharge.toFixed(2)} (${serviceChargePercent}%)\nDelivery Type: ${deliveryType === "express" ? "Express Delivery" : "Standard Delivery"}\nDelivery Fee: ₦${deliveryInfo.fee}\nExpected Delivery: ${deliveryInfo.time}\nTotal: ₦${totalWithServiceCharge.toFixed(2)}\n\nDrop-off Location: ${selectedLocation}\nAddress Details: ${addressDetails}\n\n*Payment screenshot attached*`;
  };

  const validateGuestCheckout = (): boolean => {
    if (!token) {
      if (!guestName.trim()) {
        toast.error("Please enter your name");
        return false;
      }
      if (!guestPhone.trim()) {
        toast.error("Please enter your phone number");
        return false;
      }
      if (guestPhone.trim().length < 11) {
        toast.error("Please enter a valid phone number (at least 11 digits)");
        return false;
      }
      if (!guestEmail.trim()) {
        toast.error("Please enter your email address");
        return false;
      }
      if (!guestEmail.includes('@')) {
        toast.error("Please enter a valid email address");
        return false;
      }
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateGuestCheckout()) return;
    if (!selectedLocation) {
      toast.error("Please select a drop-off location");
      return;
    }
    if (!addressDetails.trim()) {
      toast.error("Please enter address details");
      return;
    }
    setStep(2);
  };

  const handleConfirmWithReference = async () => {
    if (!paymentReference.trim()) {
      toast.error("Please enter a payment reference number");
      return;
    }
    if (paymentReference.trim().length < 6) {
      toast.error("Payment reference must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      if (token) {
        await goodsApi.confirmPayment(
          {
            cart,
            paymentReference,
            serviceCharge,
            deliveryFee: deliveryInfo.fee,
            deliveryType,
            expectedDelivery: deliveryInfo.time,
            dropOffLocation: selectedLocation,
            addressDetails,
          },
          token
        );
        toast.success("Order confirmed! We'll verify your payment and process your order.");
        clearCart();
                    router.push("/shop/purchase");

       ;
      } else {
        await goodsApi.confirmGuestPayment({
          cart,
          paymentReference,
          serviceCharge,
          deliveryFee: deliveryInfo.fee,
          deliveryType,
          expectedDelivery: deliveryInfo.time,
          dropOffLocation: selectedLocation,
          addressDetails,
          guestInfo: {
            name: guestName,
            phone: guestPhone,
            email: guestEmail,
          },
        });
        toast.success("Order confirmed! We'll verify your payment and process your order.");
        clearCart();
        setTimeout(() => {
          onClose();
        }, 500);
      }
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

  const handleShareOnWhatsApp = () => {
    const whatsappNumber = "2347049374912";
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp... Please attach your payment screenshot");
    
    setTimeout(() => {
      clearCart();
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#8d4817]" />
              Your Cart
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {step} of 2 • {getItemCount()} items
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-[#8d4817] transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4 opacity-70" />
              <p className="text-gray-600 text-base sm:text-lg">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* STEP 1: Cart Review & Delivery Details */}
              {step === 1 && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Account Benefits Banner for Guest Users */}
                  {!token && (
                    <div className="bg-gradient-to-r from-[#8d4817] to-[#6d5341] text-white p-3 sm:p-4 rounded-lg shadow-md">
                      <div className="flex items-start">
                        <Gift className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-base sm:text-lg mb-1">Get Exclusive Bonuses!</h3>
                          <p className="text-xs sm:text-sm text-white/90 mb-2 sm:mb-3">
                            Create an account for special discounts and rewards!
                          </p>
                          <button
                            onClick={() => router.push("/auth/signup")}
                            className="bg-white text-[#8d4817] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-100 transition-colors flex items-center"
                          >
                            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Create Account
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cart Items */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Your Items</h3>
                    {cart.map((cartItem) => (
                      <div
                        key={`${cartItem.storeId}-${cartItem.item._id}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">{cartItem.item.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-700 font-medium">
                            ₦{cartItem.item.price.toFixed(2)} × {cartItem.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(cartItem.storeId, cartItem.item._id, cartItem.quantity - 1)}
                              className="px-2 py-1 text-[#8d4817] disabled:opacity-50"
                              disabled={cartItem.quantity <= 1}
                              aria-label="Decrease"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <span className="px-2 sm:px-3 py-1 text-sm font-medium">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(cartItem.storeId, cartItem.item._id, cartItem.quantity + 1)}
                              className="px-2 py-1 text-[#8d4817]"
                              aria-label="Increase"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(cartItem.storeId, cartItem.item._id)}
                            className="text-red-600"
                            aria-label="Remove"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Options */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-sm sm:text-base">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#8d4817]" />
                      Delivery Speed
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setDeliveryType("standard")}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                          deliveryType === "standard"
                            ? "border-[#8d4817] bg-orange-50"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                          <span className="font-bold text-[#8d4817] text-sm sm:text-base">₦500</span>
                        </div>
                        <p className="font-semibold text-sm sm:text-base text-gray-900">Standard</p>
                        <p className="text-xs sm:text-sm text-gray-600">{deliveryInfo.time}</p>
                      </button>

                      <button
                        onClick={() => setDeliveryType("express")}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                          deliveryType === "express"
                            ? "border-[#8d4817] bg-orange-50"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                          <span className="font-bold text-[#8d4817] text-sm sm:text-base">₦1,500</span>
                        </div>
                        <p className="font-semibold text-sm sm:text-base text-gray-900">Express</p>
                        <p className="text-xs sm:text-sm text-gray-600">Within 1-2 hours</p>
                      </button>
                    </div>
                  </div>

                  {/* Guest Info */}
                  {!token && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Your Contact Info</h3>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Full Name *"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8d4817]"
                      />
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="Phone Number *"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8d4817]"
                      />
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="Email Address *"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8d4817]"
                      />
                    </div>
                  )}

                  {/* Delivery Location */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center text-sm sm:text-base">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#8d4817]" />
                      Delivery Address
                    </h3>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8d4817]"
                    >
                      <option value="">Select location</option>
                      {uiLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={addressDetails}
                      onChange={(e) => setAddressDetails(e.target.value)}
                      placeholder="landmarks *"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8d4817]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Payment */}
              {step === 2 && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Order Summary */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Order Summary</h3>
                    <div className="space-y-2 text-sm sm:text-base">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>₦{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Service Charge ({((serviceCharge / cartTotal) * 100).toFixed(1)}%)</span>
                        <span>₦{serviceCharge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Delivery ({deliveryType === "express" ? "Express" : "Standard"})</span>
                        <span>₦{deliveryInfo.fee}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 text-base sm:text-lg border-t pt-2">
                        <span>Total</span>
                        <span>₦{totalWithServiceCharge.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info Confirmation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {deliveryType === "express" ? "Express" : "Standard"} Delivery
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700">{deliveryInfo.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedLocation}</p>
                        <p className="text-xs sm:text-sm text-gray-700">{addressDetails}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-green-900 font-semibold mb-1">Transfer to:</p>
                    <p className="text-sm sm:text-base text-green-900">
                      <strong className="text-lg sm:text-xl">₦{totalWithServiceCharge.toFixed(2)}</strong>
                    </p>
                    <p className="text-sm sm:text-base text-green-900 mt-1">
                      <strong>Opay: 7049374912</strong>
                    </p>
                  </div>

                  {/* Payment Reference Option */}
                  <div className="border-2 border-gray-200 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Enter Payment Reference</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3">If your payment has a reference number:</p>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Payment reference (min. 6 characters)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8d4817] mb-3"
                    />
                    <button
                      onClick={handleConfirmWithReference}
                      disabled={isSubmitting || !paymentReference.trim()}
                      className={`w-full bg-[#8d4817] text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-colors ${
                        isSubmitting || !paymentReference.trim()
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-[#6d5341]"
                      }`}
                    >
                      {isSubmitting ? "Processing..." : "Confirm Order"}
                    </button>
                  </div>

                  {/* WhatsApp Option */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs sm:text-sm">
                      <span className="px-3 bg-white text-gray-600">OR</span>
                    </div>
                  </div>

                  <div className="border-2 border-orange-200 rounded-lg p-3 sm:p-4 bg-orange-50">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Share on WhatsApp</h3>
                    <p className="text-xs sm:text-sm text-gray-700 mb-3">Send your payment screenshot directly:</p>
                    <button
                      onClick={handleShareOnWhatsApp}
                      className="w-full bg-[#25D366] text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-[#20BA5A] transition-colors flex items-center justify-center"
                    >
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Share Payment on WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Navigation */}
        {cart.length > 0 && (
          <div className="border-t p-4 sm:p-6 bg-white">
            {step === 1 ? (
              <button
                onClick={handleContinueToPayment}
                disabled={!selectedLocation || !addressDetails.trim() || (!token && (!guestName.trim() || !guestPhone.trim() || !guestEmail.trim()))}
                className={`w-full bg-[#8d4817] text-white py-3 rounded-lg font-semibold text-sm sm:text-base transition-colors flex items-center justify-center ${
                  !selectedLocation || !addressDetails.trim() || (!token && (!guestName.trim() || !guestPhone.trim() || !guestEmail.trim()))
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#6d5341]"
                }`}
              >
                Continue to Payment
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={() => setStep(1)}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Back to Cart
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;