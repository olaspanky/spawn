// "use client"
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Head from 'next/head';
// import { PaystackButton } from '@paystack/inline-js';

// interface FormData {
//   email: string;
//   amount: string;
//   firstName: string;
//   lastName: string;
//   phone: string;
// }

// export default function CheckoutPage() {
//   const router = useRouter();
//   const [formData, setFormData] = useState<FormData>({
//     email: '',
//     amount: '5000', // Default amount in kobo (5000 = ₦50)
//     firstName: '',
//     lastName: '',
//     phone: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [paymentSuccess, setPaymentSuccess] = useState(false);

//   // useEffect(() => {
//   //   // Check for payment success in URL query params
//   //   if (router.query.reference) {
//   //     verifyPayment(router.query.reference as string);
//   //   }
//   // }, [router.query]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const verifyPayment = async (reference: string) => {
//     try {
//       const response = await fetch('/api/verify-payment', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ reference }),
//       });

//       const data = await response.json();

//       if (data.status) {
//         setPaymentSuccess(true);
//         // You can redirect to a success page or show a success message
//       }
//     } catch (error) {
//       console.error('Payment verification failed:', error);
//     }
//   };

//   const handlePaystackPayment = () => {
//     setLoading(true);
    
//     const paystack = new (window as any).PaystackPop();
//     paystack.newTransaction({
//       key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
//       email: formData.email,
//       amount: parseFloat(formData.amount) * 100, // Convert to kobo
//       firstname: formData.firstName,
//       lastname: formData.lastName,
//       phone: formData.phone,
//       onSuccess: (transaction: any) => {
//         setLoading(false);
//         // You can handle the success here or let the useEffect handle it
//         router.push(`/checkout?reference=${transaction.reference}`);
//       },
//       onCancel: () => {
//         setLoading(false);
//         // Handle payment cancellation
//         alert('Payment was cancelled');
//       },
//     });
//   };

//   if (paymentSuccess) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//             <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
//           <p className="text-gray-600 mb-6">Thank you for your purchase. Your transaction was completed successfully.</p>
//           <button
//             onClick={() => router.push('/')}
//             className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
//           >
//             Return Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Head>
//         <title>Checkout | Your Brand</title>
//         <script src="https://js.paystack.co/v1/inline.js"></script>
//       </Head>

//       <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
//           <div className="md:flex">
//             <div className="p-8 w-full">
//               <div className="flex justify-between items-center mb-8">
//                 <h1 className="text-2xl font-bold text-gray-800">Complete Payment</h1>
//                 <div className="flex items-center">
//                   <span className="text-sm font-medium text-gray-500 mr-2">Secure</span>
//                   <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                     <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
//                   </svg>
//                 </div>
//               </div>

//               <div className="space-y-6">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
//                       First Name
//                     </label>
//                     <input
//                       type="text"
//                       id="firstName"
//                       name="firstName"
//                       value={formData.firstName}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
//                       Last Name
//                     </label>
//                     <input
//                       type="text"
//                       id="lastName"
//                       name="lastName"
//                       value={formData.lastName}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
//                     Phone Number
//                   </label>
//                   <input
//                     type="tel"
//                     id="phone"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
//                     Amount (₦)
//                   </label>
//                   <input
//                     type="number"
//                     id="amount"
//                     name="amount"
//                     value={formData.amount}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                     required
//                   />
//                 </div>

//                 <div className="pt-4">
//                   <button
//                     onClick={handlePaystackPayment}
//                     disabled={loading}
//                     className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
//                   >
//                     {loading ? (
//                       <>
//                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Processing...
//                       </>
//                     ) : (
//                       'Pay Now'
//                     )}
//                   </button>
//                 </div>

//                 <div className="flex items-center justify-center space-x-2">
//                   <span className="h-px w-16 bg-gray-300"></span>
//                   <span className="text-sm text-gray-500">OR</span>
//                   <span className="h-px w-16 bg-gray-300"></span>
//                 </div>

//                 <div className="grid grid-cols-3 gap-3">
//                   <button
//                     type="button"
//                     className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                   >
//                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                       <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
//                     </svg>
//                   </button>
//                   <button
//                     type="button"
//                     className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                   >
//                     <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                       <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
//                     </svg>
//                   </button>
//                   <button
//                     type="button"
//                     className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                   >
//                     <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                       <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }