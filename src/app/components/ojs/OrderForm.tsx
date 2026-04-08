"use client";
import { useState, useRef } from "react";
import { serviceConfig, contactDetails } from "../../lib/mp";

type ServiceType = "timeframe" | "express";

type SubmittedOrder = {
  _id: string;
  name: string;
  status: string;
};

export default function OrderForm() {
  const [service, setService] = useState<ServiceType>("timeframe");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState<SubmittedOrder | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const cfg = serviceConfig[service];
  const fee = cfg.fee;

  const handleFile = (f: File | null) => {
    if (!f) return;
    const allowedTypes = ["image/", "application/pdf", "text/"];
    if (
      allowedTypes.some((type) => f.type.startsWith(type)) ||
      f.name.endsWith(".docx")
    ) {
      setFile(f);
    } else {
      alert("Please upload an image, PDF, or text file.");
    }
  };

  const buildWhatsAppMessage = (orderId: string) => {
    const serviceLabel =
      service === "express" ? "⚡ Express (1hr)" : "🕐 Timeframe";
    return encodeURIComponent(
      `Hello MarketRuz!\n\n` +
        `🧾 Order ID: ${orderId}\n` +
        `👤 Name: ${name}\n` +
        `📞 Phone: ${phone}\n` +
        `📍 Address: ${address}\n` +
        `🛒 Service: ${serviceLabel} — Fee: ₦${fee.toLocaleString()}\n` +
        (notes ? `📝 Notes: ${notes}\n` : "") +
        `\nI'll attach my shopping list shortly.`
    );
  };

  const uploadFile = async (f: File): Promise<object> => {
    const formData = new FormData();
    formData.append("file", f);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
      { method: "POST", body: formData }
    );
    if (!res.ok) throw new Error("File upload failed");
    const data = await res.json();
    return data.file; // { url, publicId, originalName, mimeType }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let fileMeta: object | null = null;
      if (file) {
        fileMeta = await uploadFile(file);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            phone,
            address,
            service,
            notes,
            file: fileMeta,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit order");
      }

      setOrder(data.data);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setOrder(null);
    setName("");
    setPhone("");
    setAddress("");
    setNotes("");
    setFile(null);
    setService("timeframe");
    setError(null);
  };

  // ── Success screen ──
  if (submitted && order) {
    return (
      <div className="text-center lg:py-12 p-2 lg:px-4">
        <div className="text-6xl mb-6">🎉</div>
        <h3 className="font-display font-bold text-3xl mb-3 text-ruz-dark">
          Order received!
        </h3>
        <p className="text-ruz-muted max-w-xs mx-auto mb-2 leading-relaxed">
          Click below to continue on WhatsApp and attach your shopping list.
        </p>
        <p className="text-xs text-ruz-muted mb-8">
          Order ID:{" "}
          <span className="font-mono text-ruz-dark">{order._id}</span>
        </p>
        <a
          href={`https://wa.me/${contactDetails.whatsapp}?text=${buildWhatsAppMessage(order._id)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.97]"
        >
          Open WhatsApp
        </a>
        <button
          onClick={handleReset}
          className="block mx-auto mt-6 text-sm text-ruz-muted underline"
        >
          Place another order
        </button>
      </div>
    );
  }

  // ── Order form ──
  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1">
      {/* Service Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(["timeframe", "express"] as ServiceType[]).map((s) => {
          const isActive = service === s;
          const serviceFee = serviceConfig[s].fee;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setService(s)}
              className={`p-6 rounded-3xl border-2 text-left transition-all active:scale-[0.98] ${
                isActive
                  ? s === "express"
                    ? "border-orange-500 bg-orange-50 shadow-sm"
                    : "border-emerald-500 bg-emerald-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <p
                className={`font-display font-semibold text-lg ${
                  isActive
                    ? s === "express"
                      ? "text-orange-600"
                      : "text-emerald-600"
                    : "text-ruz-dark"
                }`}
              >
                {s === "express" ? "⚡ Express Delivery" : "🕐 Scheduled Run"}
              </p>
              <p className="text-sm text-ruz-muted mt-2 leading-snug">
                {s === "express"
                  ? `₦${serviceFee.toLocaleString()} • Within 1 hour`
                  : `₦${serviceFee.toLocaleString()} • Morning or Evening slot`}
              </p>
            </button>
          );
        })}
      </div>

      {/* Service Info */}
      {service === "timeframe" && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 text-sm text-emerald-700 leading-relaxed">
          🌅 <strong>Morning:</strong> Order before 12 PM → Delivered by 2 PM
          <br />
          🌆 <strong>Evening:</strong> Delivered between 7 PM – 9 PM
        </div>
      )}
      {service === "express" && (
        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-5 text-sm text-orange-700">
          ⚡ Your items will be delivered within 1 hour after we confirm the
          order.
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-5">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-base focus:border-emerald-500 focus:outline-none"
        />
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-base focus:border-emerald-500 focus:outline-none"
        />
        <input
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Delivery address in LOCAL"
          className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-base focus:border-emerald-500 focus:outline-none"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requests or notes (optional)"
          rows={3}
          className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-base focus:border-emerald-500 focus:outline-none resize-y"
        />
      </div>

      {/* File Upload */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-3xl p-10 text-center cursor-pointer transition-all active:bg-gray-50"
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.txt,.docx"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
        {file ? (
          <div className="flex flex-col items-center gap-3 text-emerald-600">
            <span className="text-3xl">📎</span>
            <div className="font-medium text-center break-all px-4">
              {file.name}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="text-red-500 hover:text-red-600 text-sm mt-2"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div>
            <p className="text-5xl mb-4">📋</p>
            <p className="font-semibold text-ruz-dark text-lg">
              Upload your shopping list
            </p>
            <p className="text-ruz-muted mt-2 text-sm">
              Photo, PDF, or text file accepted
            </p>
          </div>
        )}
      </div>

      {/* Fee Summary */}
      <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ruz-muted">
            Service + Delivery Fee
          </p>
          <p className="text-3xl font-bold text-ruz-dark mt-1">
            ₦{fee.toLocaleString()}
          </p>
        </div>
        <div className="text-right text-sm text-ruz-muted">
          Items cost will be calculated
          <br />
          after we review your list
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ruz-green hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-display font-bold py-4 rounded-2xl transition-all text-lg shadow-lg shadow-emerald-900/20 active:scale-[0.985]"
      >
        {loading ? "Submitting…" : "Continue on WhatsApp →"}
      </button>
    </form>
  );
}