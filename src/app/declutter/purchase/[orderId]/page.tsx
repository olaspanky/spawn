// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import Link from "next/link";
// import { ArrowLeftIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon, StarIcon } from "@heroicons/react/24/outline";
// import Image from "next/image";
// import { useAuth } from "@/app/context/AuthContext";

// // Define TypeScript interfaces
// interface Item {
//   _id: string;
//   title: string;
//   price: number;
//   description: string;
//   images: string[];
//   status: string;
// }

// interface Seller {
//   _id: string;
//   username: string;
//   verified: boolean;
//   rating?: number;
//   ratingCount?: number;
//   scamReports?: number;
// }

// interface MeetingDetails {
//   location: string;
//   time: string; // ISO string from backend
// }

// interface Order {
//   _id: string;
//   buyer: string;
//   seller: Seller;
//   item: Item;
//   price: number;
//   paymentReference: string;
//   status: "pending" | "completed" | "cancelled" | "refund_requested";
//   trackingStatus?: "paid" | "meeting_scheduled" | "item_received" | "completed" | "refunded";
//   meetingDetails?: MeetingDetails; // Added to store meeting info
//   createdAt: string;
//   updatedAt: string;
// }

// const PurchaseDetailPage = () => {
//   const { orderId } = useParams();
//   const [order, setOrder] = useState<Order | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [retractReason, setRetractReason] = useState("");
//   const [showRetractForm, setShowRetractForm] = useState(false);
//   const [meetingLocation, setMeetingLocation] = useState("");
//   const [meetingTime, setMeetingTime] = useState("");
//   const [rating, setRating] = useState(0);
//   const { token, user } = useAuth();

//   // Fetch order details
//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         if (!orderId || !token) throw new Error("Missing order ID or authentication token");
//         setLoading(true);
//         const response = await fetch(`https://spawnback.vercel.app/api/purchases/${orderId}`, {
//           headers: { 
//             "Content-Type": "application/json", 
//             ...(token && { "x-auth-token": token }) 
//           },
//         });
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.error || "Failed to fetch order details");
//         }
//         const data: Order = await response.json();
//         setOrder(data);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "An unknown error occurred");
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (token) fetchOrder();
//   }, [orderId, token]);

//   // Handlers (unchanged except for handleScheduleMeeting URL)
//   const handleReleaseFunds = async () => {
//     try {
//       const response = await fetch(`https://spawnback.vercel.app/api/purchases/${orderId}/release-funds`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json", 
//           ...(token && { "x-auth-token": token }) 
//         },
//       });
//       if (!response.ok) throw new Error("Failed to release funds");
//       const updatedOrder = await response.json();
//       setOrder(updatedOrder);
//       alert("Funds released to seller successfully!");
//     } catch (err) {
//       alert(err instanceof Error ? err.message : "An error occurred");
//     }
//   };

//   const handleRetractFunds = async () => {
//     if (!retractReason) {
//       alert("Please provide a reason for retracting funds.");
//       return;
//     }
//     try {
//       const response = await fetch(`https://spawnback.vercel.app/api/purchases/${orderId}/retract-funds`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json", 
//           ...(token && { "x-auth-token": token }) 
//         },
//         body: JSON.stringify({ reason: retractReason }),
//       });
//       if (!response.ok) throw new Error("Failed to request refund");
//       const updatedOrder = await response.json();
//       setOrder(updatedOrder);
//       setShowRetractForm(false);
//       setRetractReason("");
//       alert("Refund request submitted. Awaiting review.");
//     } catch (err) {
//       alert(err instanceof Error ? err.message : "An error occurred");
//     }
//   };

//   const handleScheduleMeeting = async () => {
//     if (!meetingLocation || !meetingTime) {
//       alert("Please select a location and time.");
//       return;
//     }
//     try {
//       const response = await fetch(`https://spawnback.vercel.app/api/purchases/${orderId}/schedule-meeting`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json", 
//           ...(token && { "x-auth-token": token }) 
//         },
//         body: JSON.stringify({ location: meetingLocation, time: meetingTime }),
//       });
//       if (!response.ok) throw new Error("Failed to schedule meeting");
//       const updatedOrder = await response.json();
//       setOrder(updatedOrder);
//       alert("Meeting scheduled! Please confirm with the seller.");
//     } catch (err) {
//       alert(err instanceof Error ? err.message : "An error occurred");
//     }
//   };

//   const handleRateSeller = async () => {
//     if (rating < 1 || rating > 5) {
//       alert("Please select a rating between 1 and 5.");
//       return;
//     }
//     try {
//       const response = await fetch(`https://spawnback.vercel.app/api/purchases/${orderId}/rate-seller`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json", 
//           ...(token && { "x-auth-token": token }) 
//         },
//         body: JSON.stringify({ rating }),
//       });
//       if (!response.ok) throw new Error("Failed to submit rating");
//       const updatedOrder = await response.json();
//       setOrder(updatedOrder);
//       alert("Seller rated successfully!");
//     } catch (err) {
//       alert(err instanceof Error ? err.message : "An error occurred");
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (!order) return <div>Order not found</div>;

//   const isBuyer = user?.id === order.buyer;
//   const scamLikely = order.seller.scamReports && order.seller.scamReports >= 3;

//   return (
//     <div className="min-h-screen bg-gray-100 font-sans">
//       <nav className="bg-white shadow-sm sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
//           <Link href="/declutter/purchases" className="text-gray-600 hover:text-orange-600 transition">
//             <ArrowLeftIcon className="h-6 w-6" />
//           </Link>
//           <h1 className="text-2xl font-semibold ml-4 text-gray-800">Purchase Details</h1>
//         </div>
//       </nav>

//       <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//         <div className="bg-white shadow-md rounded-lg overflow-hidden">
//           {order.trackingStatus === "paid" && (
//             <div className="bg-green-50 border-b border-green-200 p-4 flex items-center justify-between">
//               <div className="flex items-center">
//                 <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
//                 <div>
//                   <h2 className="text-lg font-semibold text-green-700">Payment Successful!</h2>
//                   <p className="text-sm text-green-600">Funds are held until you confirm receipt.</p>
//                 </div>
//               </div>
//               <div className="text-green-500 text-sm">✓ Paid</div>
//             </div>
//           )}

//           <div className="p-6 space-y-6">
//             {/* Order Header */}
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-800">{order.item.title}</h2>
//                 <p className="text-sm text-gray-500">Order ID: {order._id}</p>
//               </div>
//               <div className="flex items-center">
//                 {order.trackingStatus === "completed" ? (
//                   <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
//                 ) : order.trackingStatus === "refunded" ? (
//                   <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-2" />
//                 ) : (
//                   <ClockIcon className="h-6 w-6 text-yellow-500 mr-2" />
//                 )}
//                 <span
//                   className={`text-sm font-medium capitalize ${
//                     order.trackingStatus === "completed"
//                       ? "text-green-600"
//                       : order.trackingStatus === "refunded"
//                       ? "text-red-600"
//                       : "text-yellow-600"
//                   }`}
//                 >
//                   {order.trackingStatus}
//                 </span>
//               </div>
//             </div>

//             {/* Item Details */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <Image src={order.item.images[0] || "/placeholder-image.jpg"} alt={order.item.title} width={500} height={500} className="w-full h-64 object-cover rounded-lg" />
//               </div>
//               <div className="space-y-4">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-700">Item Details</h3>
//                   <p className="text-gray-600">{order.item.description}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-700"><span className="font-medium">Price:</span> ₦{order.price.toLocaleString()}</p>
//                   <p className="text-gray-700"><span className="font-medium">Payment Reference:</span> {order.paymentReference}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Seller Information */}
//             <div className="border-t border-gray-200 pt-4">
//               <h3 className="text-lg font-semibold text-gray-700">Seller Information</h3>
//               <div className="mt-2 flex items-center space-x-4">
//                 <p className="text-gray-600">{order.seller.username}</p>
//                 {order.seller.verified && (
//                   <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded-full flex items-center">
//                     <CheckCircleIcon className="h-4 w-4 mr-1" />
//                     Verified
//                   </span>
//                 )}
//                 {order.seller.rating && (
//                   <span className="flex items-center text-yellow-500">
//                     <StarIcon className="h-5 w-5 mr-1" />
//                     {order.seller.rating.toFixed(1)} ({order.seller.ratingCount} reviews)
//                   </span>
//                 )}
//                 {scamLikely && (
//                   <span className="bg-red-100 text-red-700 text-sm px-2 py-1 rounded-full">Scam Likely</span>
//                 )}
//               </div>
//             </div>

//             {/* Meeting Details */}
//             {order.meetingDetails && order.trackingStatus === "meeting_scheduled" && (
//               <div className="border-t border-gray-200 pt-4">
//                 <h3 className="text-lg font-semibold text-gray-700">Meeting Details</h3>
//                 <div className="mt-2 space-y-2">
//                   <p className="text-gray-600">
//                     <span className="font-medium">Location:</span> {order.meetingDetails.location}
//                   </p>
//                   <p className="text-gray-600">
//                     <span className="font-medium">Time:</span> {new Date(order.meetingDetails.time).toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Timestamps */}
//             <div className="border-t border-gray-200 pt-4">
//               <h3 className="text-lg font-semibold text-gray-700">Order Timeline</h3>
//               <div className="mt-2 space-y-2">
//                 <p className="text-gray-600"><span className="font-medium">Order Placed:</span> {new Date(order.createdAt).toLocaleString()}</p>
//                 <p className="text-gray-600"><span className="font-medium">Last Updated:</span> {new Date(order.updatedAt).toLocaleString()}</p>
//               </div>
//             </div>

//             {/* Schedule Meeting */}
//             {isBuyer && order.trackingStatus === "paid" && (
//               <div className="border-t border-gray-200 pt-4">
//                 <h3 className="text-lg font-semibold text-gray-700">Schedule Meeting</h3>
//                 <div className="mt-4 space-y-4">
//                   <select
//                     value={meetingLocation}
//                     onChange={(e) => setMeetingLocation(e.target.value)}
//                     className="w-full p-2 border rounded-lg bg-white"
//                   >
//                     <option value="">Select a meeting point</option>
//                     <option value="Ikeja City Mall">Ikeja City Mall</option>
//                     <option value="Shoprite Surulere">Shoprite Surulere</option>
//                     <option value="Lekki Phase 1">Lekki Phase 1</option>
//                   </select>
//                   <input
//                     type="datetime-local"
//                     value={meetingTime}
//                     onChange={(e) => setMeetingTime(e.target.value)}
//                     className="w-full p-2 border rounded-lg bg-white"
//                   />
//                   <button
//                     onClick={handleScheduleMeeting}
//                     className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
//                   >
//                     Propose Meeting
//                   </button>
//                   <p className="text-sm text-gray-500">
//                     After proposing, coordinate with the seller via chat to confirm.
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Release/Retract Funds */}
//             {isBuyer && order.trackingStatus === "meeting_scheduled" && (
//               <div className="border-t border-gray-200 pt-4 space-y-4">
//                 <div className="flex space-x-4">
//                   <button onClick={handleReleaseFunds} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
//                     Release Funds
//                   </button>
//                   <button onClick={() => setShowRetractForm(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
//                     Retract Funds
//                   </button>
//                 </div>
//                 {showRetractForm && (
//                   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//                     <div className="bg-white rounded-lg p-6 max-w-md w-full">
//                       <h3 className="text-lg font-semibold text-gray-700 mb-4">Request Refund</h3>
//                       <textarea
//                         value={retractReason}
//                         onChange={(e) => setRetractReason(e.target.value)}
//                         placeholder="Reason for retracting funds (e.g., item not delivered, damaged)"
//                         className="w-full p-2 border rounded-lg mb-4"
//                         rows={4}
//                       />
//                       <div className="flex justify-end space-x-4">
//                         <button onClick={() => setShowRetractForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
//                           Cancel
//                         </button>
//                         <button onClick={handleRetractFunds} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
//                           Submit Refund Request
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Seller Rating Form */}
//             {isBuyer && order.trackingStatus === "completed" && !order.seller.rating && (
//               <div className="border-t border-gray-200 pt-4">
//                 <h3 className="text-lg font-semibold text-gray-700">Rate the Seller</h3>
//                 <div className="flex items-center space-x-2 mt-2">
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <StarIcon
//                       key={star}
//                       className={`h-6 w-6 cursor-pointer ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
//                       onClick={() => setRating(star)}
//                     />
//                   ))}
//                 </div>
//                 <button onClick={handleRateSeller} className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
//                   Submit Rating
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Actions */}
//           <div className="bg-gray-50 p-6 flex justify-end space-x-4">
//             <Link href="/declutter/purchases" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
//               Back to Purchases
//             </Link>
//             {(order.trackingStatus === "paid" || order.trackingStatus === "meeting_scheduled") && (
//               <Link href={`/pages/chat?orderId=${order._id}`} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
//                 Contact Seller
//               </Link>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default PurchaseDetailPage;

"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { getOrderById, releaseFunds, retractFunds } from '@/app/lib/api';
import Link from 'next/link';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon, ShieldCheckIcon, StarIcon, PhoneIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import MeetupForm from '@/app/components/MeetupForm';
import RatingForm from '@/app/components/RatingForm';
import { MessageSquare } from 'lucide-react';
import { Order } from '@/app/types/chat';


const ImageGallery = dynamic(() => import('@/app/components/ImageGallery'), { ssr: false });

export default function OrderDetails() {
  const router = useRouter();
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRetractForm, setShowRetractForm] = useState(false);
  const [retractReason, setRetractReason] = useState('');
  const { token, user } = useAuth();

  useEffect(() => {
    if (orderId && token) {
      getOrderById(orderId as string, token)
        .then(setOrder)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [orderId, token]);

  const handleReleaseFunds = async () => {
    try {
      const updatedOrder = await releaseFunds(orderId as string, token!);
      setOrder(updatedOrder);
      alert('Funds released successfully!');
    } catch (error) {
      alert('Failed to release funds.');
    }
  };

  const handleRetractFunds = async () => {
    if (!retractReason) {
      alert('Please provide a reason for retracting funds.');
      return;
    }
    try {
      const updatedOrder = await retractFunds(orderId as string, retractReason, token!);
      setOrder(updatedOrder);
      setShowRetractForm(false);
      setRetractReason('');
      alert('Refund request submitted.');
    } catch (error) {
      alert('Failed to request refund.');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black/95 to-gray-900/95">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-orange-200"></div>
          <div className="h-4 w-32 mx-auto bg-gray-200 rounded"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black/95 to-gray-900/95">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-white mb-2">Oops!</h2>
          <p className="text-gray-300">{error}</p>
          <Link href="/" className="inline-block mt-6 text-orange-600 hover:text-orange-700">
            Return to Homepage
          </Link>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black/95 to-gray-900/95">
        <div className="text-center p-8 max-w-md">
          <div className="text-yellow-500 mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-white mb-2">Order Not Found</h2>
          <p className="text-gray-300">We couldn't find the order you're looking for.</p>
          <Link href="/purchases" className="inline-block mt-6 text-orange-600 hover:text-orange-700">
            Back to Purchases
          </Link>
        </div>
      </div>
    );

  const isBuyer = user?.id === (typeof order.buyer === 'string' ? order.buyer : order.buyer._id);
  const seller = typeof order.seller === 'string' ? { username: 'Unknown', verified: false } : (order.seller as unknown as { username: string; verified: boolean; rating?: number; ratingCount?: number; scamReports?: number; });
  const scamLikely = 'scamReports' in seller && typeof seller.scamReports === 'number' && seller.scamReports >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black/95 to-gray-900/95 font-sans text-white">
      <nav className="shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/declutter/purchases" className="text-gray-300 hover:text-orange-600 transition">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-semibold ml-4">{order.item.title}</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto my-6 shadow-sm rounded-lg overflow-hidden bg-gray-800">
        {order.trackingStatus === 'paid' && (
          <div className="bg-green-50 border-b border-green-200 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h2 className="text-sm lg:text-lg font-semibold text-green-700">Payment Successful!</h2>
                <p className=" text-xs lg:text-sm text-green-600">Funds are held until you confirm receipt.</p>
              </div>
            </div>
            <div className="text-green-500 text-sm">✓ Paid</div>
          </div>
        )}

        <div className="flex gap-2 lg:gap-6 lg:flex-row flex-col">
          <div className="md:w-1/2 p-6">
            <ImageGallery images={order.item.images} title={order.item.title} />
          </div>

          <div className="md:w-1/2 p-2 lg:p-8 space-y-5 lg:space-y-6">
            <div>
              <h2 className="text-xl lg:text-3xl font-bold">{order.item.title}</h2>
              <div className="mt-4 flex items-center">
                <span className="text-xl lg:text-3xl font-semibold text-orange-600">₦{order.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-orange-50 p-2 lg:p-6 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-800 text-sm lg:text-lg">Item Details</h3>
              <p className="text-gray-700 whitespace-pre-line text-xs lg:text-sm">{order.item.description}</p>
            </div>

            <div className="bg-green-50 p-2 lg:p-6 rounded-lg space-y-4">
              <h3 className="font-semibold flex items-center text-gray-800 text-sm lg:text-lg">
                <ShieldCheckIcon className="h-6 w-6 mr-2 text-green-600 " />
                Seller Information
              </h3>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-xs lg:text-sm">
                  <span className="text-gray-700 font-medium">{seller.username}</span>
                  {seller.verified && (
                    <div className="ml-2 bg-green-100 text-green-700 text-sm px-2 py-1 rounded-full flex items-center">
                      <ShieldCheckIcon className="h-4 w-4 mr-1" />
                      Verified
                    </div>
                  )}
                  {seller.rating && (
                    <span className="ml-2 flex items-center text-yellow-500">
                      <StarIcon className="h-5 w-5 mr-1" />
                      {seller.rating.toFixed(1)} ({seller.ratingCount} reviews)
                    </span>
                  )}
                  {scamLikely && (
                    <span className="ml-2 bg-red-100 text-red-700 text-sm px-2 py-1 rounded-full">Scam Likely</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs lg:text-sm">
              <p><span className="font-medium">Order ID:</span> {order._id}</p>
              <p><span className="font-medium">Payment Reference:</span> {order.paymentReference}</p>
              <p><span className="font-medium">Order Placed:</span> {new Date(order.createdAt).toLocaleString()}</p>
              <p><span className="font-medium">Last Updated:</span> {new Date(order.updatedAt).toLocaleString()}</p>
              {order.meetingDetails && (
                <>
                  <p><span className="font-medium">Meetup Location:</span> {order.meetingDetails.location}</p>
                  <p><span className="font-medium">Meetup Time:</span> {new Date(order.meetingDetails.time).toLocaleString()}</p>
                </>
              )}
              <div className="flex items-center">
                {order.trackingStatus === 'completed' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
                ) : order.trackingStatus === 'refunded' ? (
                  <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-2" />
                ) : (
                  <ClockIcon className="h-6 w-6 text-yellow-500 mr-2" />
                )}
                <span className={`text-sm font-medium capitalize ${
                  order.trackingStatus === 'completed' ? 'text-green-600' :
                  order.trackingStatus === 'refunded' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {order.trackingStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 px-8 py-8 space-y-6">
          {isBuyer && order.trackingStatus === 'paid' && (
            <div className="max-w-lg mx-auto">
              <MeetupForm orderId={order._id} onSuccess={() => setOrder({ ...order, trackingStatus: 'meeting_scheduled' })} />
              <p className="text-sm text-gray-400 mt-3 text-center">
                After proposing, coordinate with the seller via chat to confirm.
              </p>
            </div>
          )}

          {isBuyer && order.trackingStatus === 'meeting_scheduled' && (
            <div className="max-w-lg mx-auto space-y-4">
              <button
                onClick={handleReleaseFunds}
                className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
              >
                Release Funds
              </button>
              <button
                onClick={() => setShowRetractForm(true)}
                className="w-full py-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition"
              >
                Retract Funds
              </button>
            </div>
          )}

          {isBuyer && order.trackingStatus === 'completed' && !seller.rating && (
            <div className="max-w-lg mx-auto">
              <RatingForm orderId={order._id} onSuccess={() => alert('Rating submitted')} />
            </div>
          )}

          <div className="flex justify-center">
            <Link href={`/pages/chat?orderId=${order._id}`} passHref>
              <div className="flex items-center p-3 gap-3 rounded-lg bg-orange-100 hover:bg-orange-200 transition cursor-pointer">
                <div className="lg:w-12 lg:h-12 h-5 w-5 p-2 rounded-lg bg-orange-600 flex items-center justify-center">
                  <MessageSquare className="lg:w-6 lg:h-6 h-3 w-3 text-white" />
                </div>
                <span className="text-orange-800 p-2 text-sm lg:text-lg font-medium">Chat with Seller</span>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {showRetractForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Request Refund</h3>
            <textarea
              value={retractReason}
              onChange={(e) => setRetractReason(e.target.value)}
              placeholder="Reason for retracting funds (e.g., item not delivered, damaged)"
              className="w-full p-2 border rounded-lg mb-4 text-gray-700"
              rows={4}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowRetractForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRetractFunds}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Submit Refund Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}