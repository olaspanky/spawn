import bag from '../../../public/assets/bag1.webp';
import bag2 from '../../../public/assets/bag2.webp';
import iphone from '../../../public/assets/iphone1.jpg';
import iphone2 from '../../../public/assets/iphone2.jpeg';
import mac from '../../../public/assets/mac1.webp';
import mac2 from '../../../public/assets/mac2.avif';
import s21 from '../../../public/assets/s21.jpg';
import s212 from '../../../public/assets/s212.jpeg';
import snk from '../../../public/assets/snk2.jpeg';
import snk2 from '../../../public/assets/snk2.png';
import sofa1 from '../../../public/assets/sofa1.webp';
import sofa2 from '../../../public/assets/sofa2.webp';
import table from '../../../public/assets/table2.jpeg';
import table2 from '../../../public/assets/table2.jpg';
import wallet from '../../../public/assets/wallet1.jpeg';
import wallet2 from '../../../public/assets/wallet2.jpeg';
import imageph from '../../../public/assets/imagesph.jpeg';

  export const recentItems = [
    { id: '1', title: 'iPhone 12 Pro', price: '₦250,000', location: 'Lagos', category: 'Electronics', image: iphone, image2: iphone2 },
    { id: '2', title: 'Designer Handbag', price: '₦45,000', location: 'Abuja', category: 'Fashion', image: bag, image2: bag2 },
    { id: '3', title: 'Sofa Set', price: '₦120,000', location: 'Ibadan', category: 'Furniture', image: sofa1, image2: sofa2 },
    { id: '4', title: 'Samsung Galaxy S21', price: '₦300,000', location: 'Kano', category: 'Electronics', image: s21, image2: s212 },
    { id: '5', title: 'Nike Air Max Sneakers', price: '₦35,000', location: 'Port Harcourt', category: 'Fashion', image: snk, image2: snk2 },
    { id: '6', title: 'Wooden Dining Table', price: '₦80,000', location: 'Enugu', category: 'Furniture', image: table, image2: table2 },
    { id: '7', title: 'MacBook Pro 16-inch', price: '₦900,000', location: 'Lagos', category: 'Electronics', image: mac, image2: mac2 },
    { id: '8', title: 'Leather Wallet', price: '₦10,000', location: 'Abuja', category: 'Fashion', image: wallet, image2: wallet2 },
    { id: '9', title: 'Electric Guitar', price: '₦150,000', location: 'Ibadan', category: 'Other', image: imageph, image2: imageph },
    // ... rest of items with categories
  ] as const;
  
  export type ItemType = typeof recentItems[number];
  export type CategoryType = ItemType['category'];
