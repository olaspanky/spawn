"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from "next/image";
import { ArrowLeftIcon, ShieldCheckIcon, PhoneIcon } from "@heroicons/react/24/outline";
import dynamic from 'next/dynamic';
import { usePaystackPayment } from 'react-paystack';
import { recentItems } from '@/app/components/data';
import { MessageSquare } from "lucide-react";
import Link from 'next/link';
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";



const ImageGallery = dynamic(
  () => import('../../../components/ImageGallery'),
  { ssr: false }
);

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  location: string;
  images: string[];
  seller: {
    username: string;
    _id: string;
    phone: string;
    verified: boolean;
  };
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { token, logout, user } = useAuth();
  const router = useRouter();



  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;

        const response = await fetch(`http://localhost:5000/api/items/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();

        setProduct({
          ...data,
          price: data.price,
          images: data.images.filter((img: string | null) => img !== null),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const config = {
    reference: new Date().getTime().toString(),
    email: "user@example.com", // Replace with the actual buyer's email
    amount: product ? product.price * 100 : 0, // Convert to kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'your_paystack_public_key',
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (response: { reference: string }) => {
    setIsVerifying(true);
    try {
      const verificationResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: response.reference,
          productId: id,
        }),
      });

      if (!verificationResponse.ok) {
        throw new Error('Payment verification failed');
      }

      const verificationData = await verificationResponse.json();

      if (verificationData.success) {
        setPaymentSuccessful(true);
        alert('Payment successful! Your order is being processed.');

        const updatedProductResponse = await fetch(`http://localhost:5000/api/items/${id}`);
        if (updatedProductResponse.ok) {
          const updatedProduct = await updatedProductResponse.json();
          setProduct(updatedProduct);
        }
      } else {
        throw new Error(verificationData.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed. Please contact support.');
    } finally {
      setIsVerifying(false);
    }
  };

  const onClose = () => {
    alert("Payment was not completed. Please try again.");
  };
  const handlePayment = () => {
    if (!product) {
      alert("Product information is missing.");
      return;
    }
  
    initializePayment({
      onSuccess,
      onClose,
    });
  };
  

  const sellerId = product?.seller._id;

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <p className="text-center text-gray-500 mt-10">{error}</p>;
  if (!product) return <p className="text-center text-gray-500 mt-10">Product not found</p>;

  return (
    <div className="min-h-screen bg-white font-font2">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center">
          <Link href="/" className="text-gray-600 hover:text-orange-600">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold ml-4 truncate">{product.title}</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto bg-white px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="lg:space-y-4 p-1">
            <ImageGallery images={product.images} title={product.title} />
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {/* Product details */}
              <h2 className="text-2xl font-semibold">{product.title}</h2>
              <p className="text-lg text-gray-600">₦{product.price.toLocaleString()}</p>
              <p className="text-gray-700">{product.description}</p>
              <p className="text-gray-500 text-sm">Location: {product.location}</p>
            </div>

            <div className="bg-green-50 p-6 rounded-xl space-y-4">
              <h4 className="font-semibold flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 text-green-600" />
                Seller Information
              </h4>
              {paymentSuccessful ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <span className="text-gray-700">{product.seller.username}</span>
                    {product.seller.verified && (
                      <ShieldCheckIcon className="h-4 w-4 text-green-600 ml-2" />
                    )}
                  </div>
                  <a
                    href={`tel:${product.seller.phone}`}
                    className="inline-flex items-center text-green-600 hover:text-green-700"
                  >
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    {product.seller.phone}
                  </a>
                </div>
              ) : (
                <p className="text-gray-600 italic">Payment guarantees seller information.</p>
              )}
            </div>

            {/* Pay Now Button */}
           {/* Pay Now Button */}
{!paymentSuccessful && (
  <>
    <button
      onClick={handlePayment}
      className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
      disabled={isVerifying}
    >
      {isVerifying ? "Verifying Payment..." : "Pay Now with Paystack"}
    </button>
    <p className="text-xs text-gray-500 mt-2 text-center">
      Payments made outside this platform are not covered by our Terms of Service, 
      and we cannot guarantee buyer protection or dispute resolution.
    </p>
  </>
)}


<Link href={user ? `/pages/chat?sellerId=${sellerId}` : "#"} passHref>
  <div
    className="flex gap-3 mt-3 justify-center items-center cursor-pointer"
    onClick={() => {
      if (!user) {
        router.push("/login");
      }
    }}
  >
    <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
      <MessageSquare className="w-5 h-5 text-primary" />
    </div>
    <span>{user ? "Chat now" : "Login to Chat"}</span>
  </div>
</Link>

          </div>
        </div>
      </main>
    </div>
  );
}
