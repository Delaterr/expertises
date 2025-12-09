import { PlaceHolderImages } from './placeholder-images';
import type { Product, DetailedSale, Transaction, UserProfile } from './data-types';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const user: UserProfile = {
  id: 'user_1',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@shopflow.com',
  avatar: 'https://picsum.photos/seed/300/100/100'
};

export let products: Product[] = [
  {
    id: "prod_1",
    shopId: 'shop_1',
    name: "Espresso Machine",
    description: "A high-quality espresso machine for home baristas. Built with stainless steel and a powerful pump to deliver the perfect shot every time. Features a built-in grinder and steam wand for lattes and cappuccinos.",
    salesPrice: 499.99,
    purchasePrice: 250.00,
    initialQuantity: 15,
    quantity: 15,
    categoryId: "cat_1",
    imageUrl: findImage('prod_espresso_machine'),
    imageHint: "espresso machine",
    unit: 'pcs',
    variants: [],
  },
  {
    id: "prod_2",
    shopId: 'shop_1',
    name: "Artisanal Coffee Beans",
    description: "A 250g bag of single-origin, medium-roast beans from the highlands of Ethiopia. Expect notes of citrus, bergamot, and dark chocolate for a complex and satisfying cup.",
    salesPrice: 18.50,
    purchasePrice: 8.00,
    initialQuantity: 80,
    quantity: 80,
    categoryId: "cat_2",
    imageUrl: findImage('prod_coffee_beans'),
    imageHint: "coffee beans",
    unit: 'kg',
    variants: [
      { name: "Grind", value: "Whole Bean", additionalPrice: 0 },
      { name: "Grind", value: "Espresso", additionalPrice: 0 },
      { name: "Grind", value: "Filter", additionalPrice: 0 },
    ],
  },
  // ... other products
];

export const sales: Transaction[] = [
  {
    id: 'sale_1',
    shopId: 'shop_1',
    date: new Date().toISOString(),
    totalAmount: 1999.00,
    paymentMethod: 'card',
    sellerId: 'user_1'
  },
  {
    id: 'sale_2',
    shopId: 'shop_1',
    date: new Date().toISOString(),
    totalAmount: 39.00,
    paymentMethod: 'cash',
    sellerId: 'user_2'
  },
   // ... other sales
];

export const detailedSales: DetailedSale[] = [
    {
        id: "trans_1",
        invoiceId: "INV001",
        customerName: "Liam Johnson",
        customerEmail: "liam@example.com",
        status: "Paid",
        date: "2023-11-23",
        totalAmount: 250,
        sellerId: 'user_1',
        shopId: 'shop_1',
        paymentMethod: 'card'
    },
    {
        id: "trans_2",
        invoiceId: "INV002",
        customerName: "Olivia Smith",
        customerEmail: "olivia@example.com",
        status: "Pending",
        date: "2023-11-20",
        totalAmount: 150,
        sellerId: 'user_1',
        shopId: 'shop_1',
        paymentMethod: 'card'
    },
    // ... other detailed sales
];

export const teamMembers = [
  {
    id: 'user_1',
    name: 'Admin User',
    email: 'admin@shopflow.com',
    role: 'Owner (Admin)',
    avatar: user.avatar,
  },
  {
    id: 'user_2',
    name: 'Jane Doe',
    email: 'jane.d@shopflow.com',
    role: 'Stock Manager',
    avatar: 'https://picsum.photos/seed/210/100/100',
  },
  {
    id: 'user_3',
    name: 'John Smith',
    email: 'john.s@shopflow.com',
    role: 'POS Seller',
    avatar: 'https://picsum.photos/seed/211/100/100',
  },
];
