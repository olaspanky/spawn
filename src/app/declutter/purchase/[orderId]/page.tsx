"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { getOrderById, releaseFunds, retractFunds } from '@/app/lib/api';
import Link from 'next/link';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon, ShieldCheckIcon, StarIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import MeetupForm from '@/app/components/MeetupForm';
import RatingForm from '@/app/components/RatingForm';
import { MessageSquare, Package, Calendar, CreditCard, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Order } from '@/app/types/chat';
import Navbar from "@/app/components/Nav";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-gray-900">
        <div className="p-8 rounded-xl bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 relative">
              <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-indigo-400 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-t-2 border-r-2 border-blue-400 animate-spin animation-delay-150"></div>
              <div className="absolute inset-4 rounded-full border-t-2 border-b-2 border-purple-400 animate-spin animation-delay-300"></div>
            </div>
            <p className="mt-4 text-indigo-200 font-medium">Loading order details...</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-900 to-gray-900">
        <div className="p-8 max-w-md text-center rounded-xl bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-2xl">
          <div className="inline-flex p-4 rounded-full bg-rose-900 bg-opacity-30 mb-4">
            <AlertCircle className="h-10 w-10 text-rose-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-all duration-300 ease-in-out transform hover:scale-105">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Return to Homepage
          </Link>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-gray-900">
        <div className="p-8 max-w-md text-center rounded-xl bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-2xl">
          <div className="inline-flex p-4 rounded-full bg-indigo-900 bg-opacity-30 mb-4">
            <Package className="h-10 w-10 text-indigo-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Order Not Found</h2>
          <p className="text-gray-300 mb-6">We couldn't find the order you're looking for.</p>
          <Link href="/purchases" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all duration-300 ease-in-out transform hover:scale-105">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Purchases
          </Link>
        </div>
      </div>
    );

  const isBuyer = user?.id === (typeof order.buyer === 'string' ? order.buyer : order.buyer._id);
  const seller = typeof order.seller === 'string' ? { username: 'Unknown', verified: false } : (order.seller as unknown as { username: string; verified: boolean; rating?: number; ratingCount?: number; scamReports?: number; });
  const scamLikely = 'scamReports' in seller && typeof seller.scamReports === 'number' && seller.scamReports >= 3;

  const getStatusColor = () => {
    switch (order.trackingStatus) {
      case 'paid': return 'bg-emerald-500';
      case 'meeting_scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-purple-500';
      case 'refunded': return 'bg-rose-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (order.trackingStatus) {
      case 'paid': return <CreditCard className="h-6 w-6" />;
      case 'meeting_scheduled': return <Calendar className="h-6 w-6" />;
      case 'completed': return <CheckCircleIcon className="h-6 w-6" />;
      case 'refunded': return <ExclamationCircleIcon className="h-6 w-6" />;
      default: return <ClockIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans text-gray-800">
       <div className="hidden lg:flex items-center"> 
            <Navbar searchTerm="" setSearchTerm={() => {}} />
            </div>
      <div className="max-w-7xl mx-auto  sm:px-6 lg:px-8">
        
        {/* Status Banner */}
     
        {/* Main Content */}
        <div className="bg-white lg:rounded-2xl  overflow-hidden">
          {/* Order Progress */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex justify-between items-center max-w-3xl mx-auto">
              <div className="flex flex-col items-center">
                <div className={`lg:h-10 lg:w-10 h-5 w-5 rounded-full flex items-center justify-center ${order.trackingStatus === 'paid' || order.trackingStatus === 'meeting_scheduled' || order.trackingStatus === 'completed' ? 'bg-white text-indigo-600' : 'bg-white bg-opacity-30 text-white'}`}>
                  <CreditCard className="lg:h-5 lg:w-5 h-3 w-3" />
                </div>
                <span className="mt-2 text-[8px] lg:text-xs font-medium text-white">Paid</span>
              </div>
              
              <div className={`h-1 flex-1 mx-2 ${order.trackingStatus === 'meeting_scheduled' || order.trackingStatus === 'completed' ? 'bg-white' : 'bg-white bg-opacity-30'}`}></div>
              
              <div className="flex flex-col items-center">
                <div className={`lg:h-10 lg:w-10 h-5 w-5 rounded-full flex items-center justify-center ${order.trackingStatus === 'meeting_scheduled' || order.trackingStatus === 'completed' ? 'bg-white text-indigo-600' : 'bg-white bg-opacity-30 text-white'}`}>
                  <Calendar className="lg:h-5 lg:w-5 h-3 w-3" />
                </div>
                <span className="mt-2 text-[8px] lg:text-xs font-medium text-white">Scheduled</span>
              </div>
              
              <div className={`h-1 flex-1 mx-2 ${order.trackingStatus === 'completed' ? 'bg-white' : 'bg-white bg-opacity-30'}`}></div>
              
              <div className="flex flex-col items-center">
                <div className={`lg:h-10 lg:w-10 h-5 w-5 rounded-full flex items-center justify-center ${order.trackingStatus === 'completed' ? 'bg-white text-indigo-600' : 'bg-white bg-opacity-30 text-white'}`}>
                  <CheckCircleIcon className="lg:h-5 lg:w-5 h-3 w-3" />
                </div>
                <span className="mt-2 text-[8px] lg:text-xs font-medium text-white">Completed</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Left Column - Gallery */}
            <div className="lg:w-1/2 lg:p-6">
              <div className="overflow-hidden shadow-lg">
                <ImageGallery images={order.item.images} title={order.item.title} />
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:w-1/2 lg:p-6  p-1 lg:space-y-6 space-y-2">
              {/* Product Title & Price */}
              <div>
                <h1 className="lg:text-3xl text-xl font-bold text-gray-800">{order.item.title}</h1>
                <div className=" flex items-center">
                  <div className="lg:px-4 py-2 ">
                    <span className="lg:text-2xl text-xl font-bold text-gray-800">₦{order.price.toLocaleString()}</span>
                  </div>
                  <div className="ml-4 px-3 py-1 rounded-full flex items-center space-x-1 text-sm font-medium" style={{ backgroundColor: getStatusColor(), color: 'white' }}>
                    {getStatusIcon()}
                    <span className="ml-1 capitalize">{order.trackingStatus.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div className="lg:text-2xl text-xs px-2">
              
                <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <Package className="h-5 w-5 mr-2 text-indigo-500" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500"> Item Details</span>
                      <p className="text-gray-600 whitespace-pre-line leading-relaxed">{order.item.description}</p>
                      </div>
                  </div>
              </div>

              {/* Seller Information */}
              <div className="lg:text-2xl text-xs px-2">
              <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <ShieldCheckIcon className="h-5 w-5 mr-2 text-indigo-500" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500"> Seller Information</span>
                      <p className="text-gray-600 whitespace-pre-line leading-relaxed">{seller.username}</p>
                      {seller.verified && (
                    <div className="ml-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-full flex items-center lg:text-2xl text-xs font-medium">
                      <ShieldCheckIcon className="h-4 w-4 mr-1" />
                      Verified
                    </div>
                  )}

{seller.rating && (
                  <div className="mt-2 flex items-center text-yellow-600">
                    <StarIcon className="h-5 w-5 mr-1" />
                    <span className="font-medium">{seller.rating.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">({seller.ratingCount} reviews)</span>
                  </div>
                )}
                
                {scamLikely && (
                  <div className="mt-2 bg-red-100 text-red-600 px-3 py-1 rounded-full inline-flex items-center text-sm font-medium">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Scam Warning
                  </div>
                )}
                      </div>
                  </div>




              </div>

              {/* Order Information */}
              <div className="rounded-xl lg:text-2xl text-xs p-2 lg:p-6 border border-gray-200 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Order Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <Package className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Order ID</span>
                      <p className="text-gray-800 font-medium">{order._id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Payment Ref</span>
                      <p className="text-gray-800 font-medium">{order.paymentReference}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <Calendar className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Order Placed</span>
                      <p className="text-gray-800 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Last Updated</span>
                      <p className="text-gray-800 font-medium">{new Date(order.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                {order.meetingDetails && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Meeting Details</h4>
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-800">{order.meetingDetails.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-800">{new Date(order.meetingDetails.time).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="border-t border-gray-200 lg:px-8 lg:py-8 bg-gray-50">
            {isBuyer && order.trackingStatus === 'paid' && (
              <div className="max-w-lg mx-auto lg:text-2xl text-xs">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Schedule Meetup</h3>
                  <MeetupForm orderId={order._id} onSuccess={() => setOrder({ ...order, trackingStatus: 'meeting_scheduled' })} />
                  <p className=" text-gray-500 mt-4 text-center">
                    After proposing a meetup, coordinate with the seller via chat to confirm the details.
                  </p>
                </div>
              </div>
            )}

            {isBuyer && order.trackingStatus === 'meeting_scheduled' && (
              <div className="max-w-lg mx-auto space-y-4">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Complete Transaction</h3>
                  <p className="text-gray-600 mb-6">
                    Once you've received the item and you're satisfied, release the funds to the seller. If there's any issue, you can request a refund.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleReleaseFunds}
                      className="py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Release Funds
                    </button>
                    <button
                      onClick={() => setShowRetractForm(true)}
                      className="py-3 px-6 bg-gray-100 text-gray-700 border border-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-200 transition-all duration-300 flex items-center justify-center"
                    >
                      <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                      Request Refund
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isBuyer && order.trackingStatus === 'completed' && !seller.rating && (
              <div className="max-w-lg mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <StarIcon className="h-5 w-5 mr-2 text-yellow-500" />
                    Rate Your Experience
                  </h3>
                  <RatingForm orderId={order._id} onSuccess={() => alert('Rating submitted')} />
                </div>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <Link href={`/pages/chat?orderId=${order._id}`} passHref>
                <div className="flex items-center p-4 px-6 gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-semibold">Chat with Seller</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Retract Funds Modal */}
      {showRetractForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Request Refund</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for your refund request. This will help us review your case more efficiently.</p>
            <textarea
              value={retractReason}
              onChange={(e) => setRetractReason(e.target.value)}
              placeholder="Why are you requesting a refund? (e.g., item not as described, seller didn't show up)"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              rows={4}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowRetractForm(false)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRetractFunds}
                className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium transition-colors shadow-md"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}