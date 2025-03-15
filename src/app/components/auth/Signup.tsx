// app/signup/page.tsx
"use client";

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// export default function SignupPage() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
  
//     try {
//       const response = await fetch("https://spawnback.onrender.com/api/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });
  
//       const data = await response.json();
  
//       if (!response.ok) {
//         throw new Error(data.message || "Signup failed");
//       }
  
//       // Ensure localStorage is available before accessing it
//       if (typeof window !== "undefined") {
//         localStorage.setItem("token", data.token);
//       }
  
//       router.push("/");
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
//         <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Account</h1>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Username
//             </label>
//             <input
//               type="text"
//               required
//               className="w-full px-4 py-2 text-black border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//               value={formData.username}
//               onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Email
//             </label>
//             <input
//               type="email"
//               required
//               className="w-full px-4 py-2 text-black border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//               value={formData.email}
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Password
//             </label>
//             <input
//               type="password"
//               required
//               minLength={6}
//               className="w-full px-4 py-2 border text-black bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//               value={formData.password}
//               onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//             />
//           </div>

//           {error && <p className="text-red-600 text-sm">{error}</p>}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
//           >
//             {loading ? 'Creating Account...' : 'Sign Up'}
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-gray-600">
//           Already have an account?{' '}
//           <Link href="/declutter/login" className="text-orange-600 hover:underline">
//             Log in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

import React, { useEffect } from 'react';

const ZohoWebForm: React.FC = () => {
  useEffect(() => {
    // Load the analytics script dynamically
    const script = document.createElement('script');
    script.src = 'https://crm.zohopublic.com/crm/WebFormAnalyticsServeServlet?rid=56901fe96d4e2a0863f7b35bc52cacef0b37a8295a840273ba9b2cce9565f231816200dbc47651f37e77ce55a0058e48gid15da7e95dfb4beaac913b59a0b7ee7fac521eae58838c5b24ce813cec97cfedbgidb15462ae4bccaed39f965572c47d83cf04f8202e7687ae7279b63ed9771a8afagide1fcfd3c709fa4b1555930be67750e51955986747b7ac80f249d00fb097916c5&tw=e5dcef9c73c5ef014b12021265ea56e3969af99a255f0c368ef88d88ccacd89b';
    script.async = true;
    script.id = 'wf_anal';
    document.body.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (checkMandatory(form)) {
      form.submit();
    }
  };

  const checkMandatory = (form: HTMLFormElement): boolean => {
    const mandatoryFields = ['Last Name'];
    for (const field of mandatoryFields) {
      const fieldElement = form[field] as HTMLInputElement;
      if (!fieldElement.value.trim()) {
        alert(`${field} cannot be empty.`);
        fieldElement.focus();
        return false;
      }
    }
    return validateEmail(form);
  };

  const validateEmail = (form: HTMLFormElement): boolean => {
    const emailFields = form.querySelectorAll('[ftype="email"]');
    for (const field of emailFields) {
      const emailValue = (field as HTMLInputElement).value.trim();
      if (emailValue) {
        const atpos = emailValue.indexOf('@');
        const dotpos = emailValue.lastIndexOf('.');
        if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= emailValue.length) {
          alert('Please enter a valid email address.');
          (field as HTMLInputElement).focus();
          return false;
        }
      }
    }
    return true;
  };

  return (
    <div id="crmWebToEntityForm" className="bg-white text-black max-w-xl mx-auto p-6">
      <form
        id="webform6686787000000520019"
        action="https://crm.zoho.com/crm/WebToLeadForm"
        name="WebToLeads6686787000000520019"
        method="POST"
        onSubmit={handleSubmit}
        acceptCharset="UTF-8"
        className="space-y-4"
      >
        <input type="hidden" name="xnQsjsdp" value="f38ab4bc9fbd8218900dd56f391a3ec3364de10d5076798b5d75bb9ac77e7789" />
        <input type="hidden" name="zc_gad" id="zc_gad" value="" />
        <input type="hidden" name="xmIwtLD" value="8ea2b64f97dd968b3d4e7d91e23eb0aa891e8565ba4df7e2492d17b6dfb5c1b29496c72d73bef92e7b8182234cd091bb" />
        <input type="hidden" name="actionType" value="TGVhZHM=" />
        <input type="hidden" name="returnURL" value="null" />

        <div className="text-lg font-bold mb-4">Kareem Form</div>

        <div className="flex flex-col md:flex-row md:items-center mb-4">
          <label htmlFor="First_Name" className="w-full md:w-1/3 mb-2 md:mb-0 md:mr-4 text-sm">
            First Name
          </label>
          <input
            type="text"
            id="First_Name"
            name="First Name"
            maxLength={40}
            className="flex-1 border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center mb-4">
          <label htmlFor="Last_Name" className="w-full md:w-1/3 mb-2 md:mb-0 md:mr-4 text-sm">
            Last Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="Last_Name"
            name="Last Name"
            maxLength={80}
            className="flex-1 border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center mb-4">
          <label htmlFor="Email" className="w-full md:w-1/3 mb-2 md:mb-0 md:mr-4 text-sm">
            Email
          </label>
          <input
            type="text"
            id="Email"
            name="Email"
            maxLength={100}
            className="flex-1 border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center mb-4">
          <label htmlFor="Phone" className="w-full md:w-1/3 mb-2 md:mb-0 md:mr-4 text-sm">
            Phone
          </label>
          <input
            type="text"
            id="Phone"
            name="Phone"
            maxLength={30}
            className="flex-1 border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center mb-4">
          <label htmlFor="Country" className="w-full md:w-1/3 mb-2 md:mb-0 md:mr-4 text-sm">
            Country
          </label>
          <input
            type="text"
            id="Country"
            name="Country"
            maxLength={100}
            className="flex-1 border rounded px-2 py-1"
          />
        </div>

        <div className="flex justify-between">
          <input
            type="submit"
            id="formsubmit"
            value="Submit"
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
          />
          <input
            type="reset"
            value="Reset"
            className="border px-4 py-2 rounded cursor-pointer"
          />
        </div>
      </form>
    </div>
  );
};

export default ZohoWebForm;
