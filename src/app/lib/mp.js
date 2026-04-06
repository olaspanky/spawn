/**
 * ============================================================
 *  MARKETRUZ — MARKET PRICES CONFIG
 *  Edit this file to update prices or add new items.
 *
 *  HOW TO ADD AN ITEM:
 *  {
 *    name: "Item Name",
 *    emoji: "🥦",           // pick a relevant emoji
 *    unit: "per kg",        // unit of measurement
 *    price: 1200,           // price in Naira (₦)
 *    category: "Vegetables" // group items by category
 *  }
 *
 *  HOW TO UPDATE A PRICE:
 *  Just change the `price` value and save the file.
 * ============================================================
 */

export const marketPrices = [
  // ── Staples ──────────────────────────────────────────────
  {
    name: "Tomatoes",
    emoji: "🍅",
    unit: "per basket",
    price: 3500,
    category: "Vegetables",
  },
  {
    name: "Onions",
    emoji: "🧅",
    unit: "per kg",
    price: 800,
    category: "Vegetables",
  },
  {
    name: "Pepper (Tatashe)",
    emoji: "🫑",
    unit: "per kg",
    price: 1200,
    category: "Vegetables",
  },
  {
    name: "Ugu (Fluted Pumpkin)",
    emoji: "🥬",
    unit: "per bunch",
    price: 300,
    category: "Vegetables",
  },
  {
    name: "Spinach",
    emoji: "🌿",
    unit: "per bunch",
    price: 200,
    category: "Vegetables",
  },
  {
    name: "Carrots",
    emoji: "🥕",
    unit: "per kg",
    price: 900,
    category: "Vegetables",
  },

  // ── Protein ──────────────────────────────────────────────
  {
    name: "Chicken (Whole)",
    emoji: "🍗",
    unit: "per kg",
    price: 3800,
    category: "Protein",
  },
  {
    name: "Beef",
    emoji: "🥩",
    unit: "per kg",
    price: 4500,
    category: "Protein",
  },
  {
    name: "Tilapia Fish",
    emoji: "🐟",
    unit: "per kg",
    price: 3000,
    category: "Protein",
  },
  {
    name: "Mackerel (Titus)",
    emoji: "🐠",
    unit: "per piece",
    price: 1500,
    category: "Protein",
  },
  {
    name: "Eggs",
    emoji: "🥚",
    unit: "per crate",
    price: 3200,
    category: "Protein",
  },

  // ── Grains & Carbs ───────────────────────────────────────
  {
    name: "Rice (Local)",
    emoji: "🍚",
    unit: "per 5kg",
    price: 6000,
    category: "Grains",
  },
  {
    name: "Garri (White)",
    emoji: "🌾",
    unit: "per paint bucket",
    price: 1800,
    category: "Grains",
  },
  {
    name: "Yam",
    emoji: "🍠",
    unit: "per tuber",
    price: 2500,
    category: "Grains",
  },
  {
    name: "Plantain",
    emoji: "🍌",
    unit: "per bunch",
    price: 2000,
    category: "Grains",
  },
  {
    name: "Spaghetti",
    emoji: "🍝",
    unit: "per pack (500g)",
    price: 700,
    category: "Grains",
  },

  // ── Spices & Condiments ──────────────────────────────────
  {
    name: "Crayfish",
    emoji: "🦐",
    unit: "per cup",
    price: 800,
    category: "Spices",
  },
  {
    name: "Maggi Cubes",
    emoji: "🧂",
    unit: "per pack (100 cubes)",
    price: 600,
    category: "Spices",
  },
  {
    name: "Palm Oil",
    emoji: "🫙",
    unit: "per litre",
    price: 1400,
    category: "Spices",
  },
  {
    name: "Groundnut Oil",
    emoji: "🛢️",
    unit: "per litre",
    price: 1800,
    category: "Spices",
  },

  // ── Fruits ───────────────────────────────────────────────
  {
    name: "Watermelon",
    emoji: "🍉",
    unit: "per piece",
    price: 2500,
    category: "Fruits",
  },
  {
    name: "Pawpaw",
    emoji: "🍈",
    unit: "per piece",
    price: 600,
    category: "Fruits",
  },
  {
    name: "Banana",
    emoji: "🍌",
    unit: "per hand",
    price: 400,
    category: "Fruits",
  },
  {
    name: "Orange",
    emoji: "🍊",
    unit: "per dozen",
    price: 800,
    category: "Fruits",
  },
];

/**
 * ============================================================
 *  CONTACT DETAILS — Update these as needed
 * ============================================================
 */
export const contactDetails = {
  whatsapp: "2348012345678", // number with country code, no +
  phone: "+234 801 234 5678",
  whatsappMessage: "Hello MarketRuz! I'd like to place an order.",
};

/**
 * ============================================================
 *  SERVICE CONFIG — Fees and timeframe windows
 * ============================================================
 */
export const serviceConfig = {
  timeframe: {
    fee: 800,
    window1: { cutoff: "12:00 PM", delivery: "by 2:00 PM" },
    window2: { delivery: "7:00 PM – 9:00 PM" },
  },
  express: {
    fee: 1500,
    deliveryTime: "within 1 hour",
  },
};