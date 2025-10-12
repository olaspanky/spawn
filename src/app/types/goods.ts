export interface Measurement {
  unit: string;
  value: number;
  customUnit?: string;
}

export interface PackageItem {
  name: string;
  quantity: number;
  description?: string;
}

export interface Purchase {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  items: {
    storeId: string;
    item: {
      _id: string;
      name: string;
      price: number;
      quantity: number;
    };
  }[];
  totalAmount: number;
  serviceCharge: number;
  deliveryFee: number;
  dropOffLocation: string;
  addressDetails: string;
  paymentReference: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Good {
  _id: string;
  name: string;
  description: string;
  measurement: Measurement;
  price: number;
  category: 'market_area' | 'package_deals' | 'drinks' | 'provisions_groceries' | 'meal_prep' | 'frozen_foods';
  image?: string;
  available: boolean;
  isPackageDeal: boolean;
  packageItems: PackageItem[];
  discountPercentage: number;
  tags: string[];
  rating: {
    average: number;
    count: number;
  };
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  formattedPrice: string;
  categoryDisplay: string;
  measurementDisplay: string;
}

export const CATEGORIES = {
  MARKET_AREA: 'market_area',
  PACKAGE_DEALS: 'package_deals',
  DRINKS: 'drinks',
  PROVISIONS_GROCERIES: 'provisions_groceries',
  MEAL_PREP: 'meal_prep',
  FROZEN_FOODS: 'frozen_foods'
} as const;

export type Category = typeof CATEGORIES[keyof typeof CATEGORIES];

export const MEASUREMENT_UNITS = [
  'kg', 'g', 'lbs', 'pieces', 'liters', 'ml', 'custom'
] as const;