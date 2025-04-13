// types/store.ts
export interface Owner {
    id: string;
    name: string;
    email?: string;
  }
  
  export interface StoreItem {
    name: string;
    price: number;
    quantity: number;
    // Add image or other fields if needed later
  }
  
  export interface PackageDeal {
    id: string;
    name: string;
    price: number;
    discountPercentage?: number;
    active: boolean;
    items: { item: string; quantity: number }[]; // `item` is the item name for embedded items
  }
  
  export interface Store {
    id: string;
    name: string;
    description: string;
    storeImage?: string;
    location: string;
    owner: Owner;
    items: StoreItem[];
    packageDeals: PackageDeal[];
  }v