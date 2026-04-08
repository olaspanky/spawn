"use client";
import PriceTicker from "@/app/components/ojs/Priceticker";
import OrderForm from "@/app/components/ojs/OrderForm";
import HowItWorks from "@/app/components/ojs/Howitworks";
import PriceBoard from "@/app/components/ojs/Priceboard";
import { contactDetails } from "@/app/lib/mp";

export default function Home() {
  const waLink = `https://wa.me/${contactDetails.whatsapp}?text=${encodeURIComponent(contactDetails.whatsappMessage)}`;

  return (
    <main className="min-h-screen bg-white">
      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛒</span>
            <span className="font-display font-bold text-2xl text-ruz-dark tracking-tight">
              Market<span className="text-ruz-green">Ruz</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${contactDetails.phone}`}
              className="hidden md:flex items-center gap-2 text-ruz-muted hover:text-ruz-dark transition-colors text-sm"
            >
              📞 {contactDetails.phone}
            </a>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all active:scale-95"
            >
              <span>💬</span>
              WhatsApp
            </a>
          </div>
        </div>
      </nav>

      {/* ── Price Ticker ─────────────────────────────────── */}
      <PriceTicker />

      {/* ── Hero + Order Form ────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-2 lg:px-6 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Hero Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              NOW TAKING ORDERS
            </div>

            <h1 className="font-display font-bold text-5xl md:text-6xl leading-[1.05] tracking-tighter text-ruz-dark mb-6">
              Fresh from the<br />market, straight<br />to your <span className="text-ruz-green">door</span>.
            </h1>

            <p className="text-xl text-ruz-muted max-w-lg mb-10">
              Send your shopping list. We buy fresh from LOCAL markets and deliver fast.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="bg-white border border-emerald-200 rounded-3xl px-5 py-4 flex-1 min-w-[180px]">
                <div className="text-emerald-600 text-xl mb-1">⚡</div>
                <p className="font-semibold text-ruz-dark">Express Delivery</p>
                <p className="text-sm text-ruz-muted">Within 1 hour • ₦1,500</p>
              </div>

              <div className="bg-white border border-amber-200 rounded-3xl px-5 py-4 flex-1 min-w-[180px]">
                <div className="text-amber-600 text-xl mb-1">🕒</div>
                <p className="font-semibold text-ruz-dark">Scheduled Runs</p>
                <p className="text-sm text-ruz-muted">Morning / Evening slots • ₦800</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-2xl flex items-center justify-center text-lg">🌅</div>
                <div><strong>Before 12 PM</strong> → Delivered by 2 PM</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-2xl flex items-center justify-center text-lg">🌆</div>
                <div><strong>Evening slot:</strong> 7 PM – 9 PM</div>
              </div>
            </div>
          </div>

          {/* Order Form Card */}
          <div className="bg-white border border-gray-100 shadow-xl shadow-gray-100/80 rounded-3xl p-3 lg:p-10">
            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl text-ruz-dark">Place your order</h2>
              <p className="text-ruz-muted text-sm mt-1">We'll reply with a price estimate on WhatsApp</p>
            </div>
            <OrderForm />
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <HowItWorks />

      {/* ── Price Board ──────────────────────────────────── */}
      <PriceBoard />

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-ruz-dark text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🛒</span>
              <span className="font-display font-bold text-2xl tracking-tight">
                Market<span className="text-ruz-lime">Ruz</span>
              </span>
            </div>
            <p className="text-white/50 text-sm">Fresh market runs • Delivered fast in LOCAL</p>
          </div>

          <div className="flex gap-4">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold px-6 py-3 rounded-2xl transition-all"
            >
              💬 WhatsApp Us
            </a>
            <a
              href={`tel:${contactDetails.phone}`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-2xl transition-all"
            >
              📞 Call Now
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-xs">
          © {new Date().getFullYear()} MarketRuz. All rights reserved.
        </div>
      </footer>
    </main>
  );
}