


export type Product = {
  id: string;
  shopId: string;
  name: string;
  description: string;
  salesPrice: number;
  purchasePrice: number;
  initialQuantity: number;
  quantity: number;
  categoryId: string;
  imageUrl: string;
  imageHint: string;
  unit: string;
  variants: { name: string; value: string; additionalPrice: number }[];
  code?: string;
  lowStockThreshold?: number;
  createdAt?: any; // Added for sorting recent products
};

export type Transaction = {
    id: string;
    shopId: string;
    date: any; // Can be Timestamp or serverTimestamp()
    totalAmount: number;
    paymentMethod: string;
    sellerId: string;
    sellerName?: string;
    items: {
        productId: string;
        productName: string;
        quantity: number;
        price: number;
    }[];
    customerId?: string | null;
    customerName?: string;
    isDebt?: boolean;
    amountPaid?: number;
    amountDue?: number;
}

// This type is now more aligned with the actual transaction data
export type DetailedSale = Transaction & {
  // invoiceId is now the transaction id
  status: "Paid" | "Pending" | "Failed"; // This can be a simulated or future field
};


export type UserProfile = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
}

export type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
    totalSpent: number;
    lastSeen: string; // ISO date string
}

    