"use client";
import { marketPrices } from "../../lib/mp";

export default function PriceTicker() {
  const items = [...marketPrices, ...marketPrices]; // duplicate for seamless loop

  return (
    <div className="bg-ruz-dark text-black overflow-hidden border-y border-ruz-green/30">
      <div className="flex items-center">
        {/* Label pill */}
        <div className="flex-shrink-0 bg-ruz-orange px-4 py-2.5 flex items-center gap-2 z-10">
          <span className="text-xs font-display font-700 uppercase tracking-widest whitespace-nowrap">
            📊 Market Prices
          </span>
        </div>

        {/* Scrolling track */}
        <div className="overflow-hidden flex-1">
          <div className="ticker-track py-2.5 px-4">
            {items.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 mr-10 whitespace-nowrap">
                <span className="text-base leading-none">{item.emoji}</span>
                <span className="font-body text-sm text-green-900">
                  {item.name}
                </span>
                <span className="font-display font-600 text-ruz-amber text-sm">
                  ₦{item.price.toLocaleString()}
                </span>
                <span className="text-white/40 text-xs">{item.unit}</span>
                <span className="text-white/20 ml-4">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}