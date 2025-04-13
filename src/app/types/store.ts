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
  
// types/store.ts
export interface Store {
  id: string;
  name: string;
  description: string;
  storeImage?: string;
  location: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  packageDeals: {
    id: string;
    name: string;
    price: number;
    discountPercentage?: number;
    active: boolean;
    items: { item: string; quantity: number }[];
  }[];
}

  export interface StoreDetailsProps {
    store: {
      id: string;
      name: string;
      description: string;
      storeImage: string;
      location: string;
      owner: {
        id: string;
        name: string;
        email: string;
      };
      items: {
        name: string;
        price: number;
        quantity: number;
      }[];
      packageDeals: {
        id: string;
        name: string;
        price: number;
        discountPercentage: number;
        active: boolean;
        items: any[];
      }[];
    };
  }