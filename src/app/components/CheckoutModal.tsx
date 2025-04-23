"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  CheckCircle,
  X,
  Loader2,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CheckoutModalProps {
  cart: any;
  storeId: string;
  store: any;
  totalPrice: number;
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
  };
  user: {
    id: string;
    email: string;
  } | null;
  token: string | null; // Ensure token is passed as a prop
  onSuccess: (orderId: string) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  product,
  user,
  token,
  onSuccess,
}: CheckoutModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "bank-transfer">("paystack");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handlePaystackPayment = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setPaymentStatus("processing");
      try {
        const response = await fetch('https://spawnback.vercel.app/api/payment/paystack/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token || '', // Pass the token in the headers
          },
          body: JSON.stringify({
            email: user?.email || "user@example.com",
            amount: product.price,
            productId: product.id,
            userId: user?.id || "",
          }),
        });

        if (!response.ok) throw new Error('Failed to initialize payment');

        const { data } = await response.json();
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        } else {
          throw new Error("Failed to get payment URL");
        }
      } catch (error) {
        console.error('Error initiating Paystack payment:', error);
        setPaymentStatus("failed");
      }
    },
    [user, product, token]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 overflow-y-auto flex items-center justify-center min-h-screen"
        >
          <div className="lg:mt-[88px] px-4 py-8 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              aria-hidden="true"
            />
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-lg w-full relative z-50"
            >
              <div className="bg-white px-6 py-4 relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Complete Your Purchase</h3>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                {paymentStatus === "idle" && (
                  <>
                    <div className="bg-gray-50 rounded-xl p-4 flex justify-between">
                      <h4 className="font-medium text-gray-900">{product.title}</h4>
                      <p className="font-semibold text-orange-600">₦{product.price.toLocaleString()}</p>
                    </div>
                    <div className="mt-6">
                      <h4 className="font-medium mb-2 text-gray-900">Payment Method</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setPaymentMethod("paystack")}
                          className={`p-4 border rounded-xl flex flex-col items-center ${
                            paymentMethod === "paystack" ? "border-orange-500 bg-orange-50" : "border-gray-200"
                          }`}
                        >
                          <CreditCard className="h-6 w-6 text-orange-600 mb-1" />
                          <span className="text-sm">Card Payment</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod("bank-transfer")}
                          className={`p-4 border rounded-xl flex flex-col items-center ${
                            paymentMethod === "bank-transfer" ? "border-orange-500 bg-orange-50" : "border-gray-200"
                          }`}
                        >
                          <ShieldCheck className="h-6 w-6 text-orange-600 mb-1" />
                          <span className="text-sm">Bank Transfer</span>
                        </button>
                      </div>
                    </div>
                    {paymentMethod === "bank-transfer" && (
                      <div className="bg-gray-50 p-4 mt-4 rounded-xl text-sm space-y-2">
                        <p><strong>Bank Name:</strong> Your Bank</p>
                        <p><strong>Account Name:</strong> Your Business</p>
                        <p><strong>Account Number:</strong> 1234567890</p>
                        <p className="text-xs text-gray-500">Include your email as the payment reference.</p>
                      </div>
                    )}
                    <button
                      onClick={handlePaystackPayment}
                      disabled={isVerifying}
                      className={`w-full mt-6 py-3 rounded-xl font-semibold text-white ${
                        isVerifying ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
                      }`}
                    >
                      {isVerifying ? (
                        <span className="flex justify-center items-center">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Processing...
                        </span>
                      ) : (
                        "Complete Payment"
                      )}
                    </button>
                    <div className="flex items-center mt-3 text-xs text-gray-500">
                      <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                      Secure payment powered by Paystack
                    </div>
                  </>
                )}
                {paymentStatus === "processing" && (
                  <div className="py-8 flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Redirecting to Paystack</h4>
                    <p className="text-gray-600">Please wait while we redirect you to complete your payment...</p>
                  </div>
                )}
                {paymentStatus === "failed" && (
                  <div className="py-8 flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <X className="h-8 w-8 text-red-500" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h4>
                    <p className="text-gray-600 mb-6">Something went wrong with your payment.</p>
                    <button
                      onClick={() => setPaymentStatus("idle")}
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}