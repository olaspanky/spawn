"use client";
import { useState, useRef } from "react";
import { serviceConfig, contactDetails } from "../../lib/mp";

type ServiceType = "timeframe" | "express";

export default function OrderForm() {
  const [service, setService] = useState<ServiceType>("timeframe");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const cfg = serviceConfig[service];
  const fee = cfg.fee;

  const handleFile = (f: File | null) => {
    if (!f) return;
    const allowedTypes = ["image/", "application/pdf", "text/"];
    if (allowedTypes.some(type => f.type.startsWith(type)) || f.name.endsWith(".docx")) {
      setFile(f);
    } else {
      alert("Please upload an image, PDF, or text file.");
    }
  };

  const buildWhatsAppMessage = () => {
    const serviceLabel = service === "express" ? "⚡ Express (1hr)" : "🕐 Timeframe";
    return encodeURIComponent(
      `Hello MarketRuz!\n\n` +
      `👤 Name: ${name}\n` +
      `📞 Phone: ${phone}\n` +
      `📍 Address: ${address}\n` +
      `🛒 Service: ${serviceLabel} — Fee: ₦${fee}\n` +
      (notes ? `📝 Notes: ${notes}\n` : "") +
      `\nI'll attach my shopping list shortly.`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🎉</div>
        <h3 className="font-display font-bold text-3xl mb-3 text-ruz-dark">Order received!</h3>
        <p className="text-ruz-muted max-w-xs mx-auto mb-8">
          Click below to continue on WhatsApp. Attach your shopping list there.
        </p>
        <a
          href={`https://wa.me/${contactDetails.whatsapp}?text=${buildWhatsAppMessage()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white font-semibold px-8 py-4 rounded-2xl hover:bg-[#1ebe5a] transition-all active:scale-[0.97]"
        >
          Open WhatsApp
        </a>
        <button
          onClick={() => setSubmitted(false)}
          className="block mx-auto mt-6 text-sm text-ruz-muted underline"
        >
          Edit order
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service Selection */}
      <div className="grid grid-cols-2 gap-4">
        {(["timeframe", "express"] as ServiceType[]).map((s) => {
          const isActive = service === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setService(s)}
              className={`p-5 rounded-3xl border-2 text-left transition-all ${
                isActive
                  ? s === "express"
                    ? "border-orange-500 bg-orange-50"
                    : "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <p className={`font-semibold ${isActive ? (s === "express" ? "text-orange-600" : "text-emerald-600") : "text-ruz-dark"}`}>
                {s === "express" ? "⚡ Express" : "🕐 Timeframe"}
              </p>
              <p className="text-xs text-ruz-muted mt-1">
                {s === "express" ? `₦${fee} • Within 1 hour` : `₦${fee} • Scheduled`}
              </p>
            </button>
          );
        })}
      </div>

      {/* Service Info Box */}
      {service === "timeframe" && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm text-emerald-700">
          🌅 Morning: Order before 12 PM → Delivered by 2 PM<br />
          🌆 Evening: Delivered 7 PM – 9 PM
        </div>
      )}
      {service === "express" && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-sm text-orange-700">
          ⚡ Express delivery within 1 hour after confirmation.
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="w-full rounded-2xl border border-gray-200 px-5 py-3.5 focus:border-emerald-500 focus:outline-none"
        />
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="w-full rounded-2xl border border-gray-200 px-5 py-3.5 focus:border-emerald-500 focus:outline-none"
        />
        <input
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Delivery address in Lagos"
          className="w-full rounded-2xl border border-gray-200 px-5 py-3.5 focus:border-emerald-500 focus:outline-none"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requests or notes..."
          rows={3}
          className="w-full rounded-2xl border border-gray-200 px-5 py-3.5 focus:border-emerald-500 focus:outline-none resize-y"
        />
      </div>

      {/* File Upload */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-gray-300 hover:border-emerald-300 rounded-3xl p-8 text-center cursor-pointer transition-colors"
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.txt,.docx"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3 text-emerald-600">
            📎 <span className="font-medium truncate">{file.name}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="text-red-400 hover:text-red-600 ml-2"
            >
              ✕
            </button>
          </div>
        ) : (
          <div>
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium text-ruz-dark">Upload your shopping list</p>
            <p className="text-sm text-ruz-muted mt-1">Photo, PDF, or text file</p>
          </div>
        )}
      </div>

      {/* Fee Summary */}
      <div className="bg-gray-50 border border-gray-100 rounded-3xl p-5 flex justify-between items-center">
        <div>
          <p className="text-xs text-ruz-muted">Service fee</p>
          <p className="text-2xl font-bold text-ruz-dark">₦{fee.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ruz-muted">Items cost</p>
          <p className="text-sm text-ruz-muted">Calculated after review</p>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-ruz-green hover:bg-emerald-700 active:bg-emerald-800 text-white font-display font-bold py-4 rounded-2xl transition-all text-lg shadow-lg shadow-emerald-900/20"
      >
        Continue on WhatsApp →
      </button>
    </form>
  );
}