
import type { Transaction } from '@/lib/data-types';
import type { Shop } from '@/contexts/settings-context';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ReceiptProps {
    transaction: Transaction;
    shop: Shop;
}

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return new Date().toLocaleString();
    return timestamp.toDate().toLocaleString();
}

// Template 1: Classic Dot-Matrix Style
export const ReceiptTemplate1 = ({ transaction, shop }: ReceiptProps) => {
    const commonClasses = "bg-white text-black p-4 font-mono text-xs w-full max-w-xs mx-auto";
    const subtotal = transaction.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.08; // Assuming 8% tax

    return (
        <div className={cn(commonClasses, "border-2 border-dashed border-gray-300")}>
            <div className="text-center mb-2">
                <h3 className="font-bold text-sm uppercase">{shop.name}</h3>
                <p>{shop.address}</p>
                <p>{formatDate(transaction.date)}</p>
            </div>
            <hr className="border-dashed my-2"/>
            <div className="flex justify-between font-bold"><span>ITEM</span><span>TOTAL</span></div>
             <hr className="border-dashed my-1"/>
            {transaction.items.map(item => (
                <div key={item.productId} className="flex justify-between">
                    <span>{item.productName} x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity, shop.currency)}</span>
                </div>
            ))}
            <hr className="border-dashed my-2"/>
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal, shop.currency)}</span></div>
            <div className="flex justify-between"><span>Tax (8%)</span><span>{formatCurrency(tax, shop.currency)}</span></div>
            <hr className="border-dashed my-2"/>
            <div className="flex justify-between font-bold text-base"><span>TOTAL</span><span>{formatCurrency(transaction.totalAmount, shop.currency)}</span></div>
            <p className="text-center mt-4">Thank you for your purchase!</p>
        </div>
    );
};

// Template 2: Modern Dark Mode
export const ReceiptTemplate2 = ({ transaction, shop }: ReceiptProps) => {
    const commonClasses = "p-6 font-sans text-sm w-full max-w-sm mx-auto";
    const subtotal = transaction.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;

    return (
        <div className={cn(commonClasses, "bg-gray-800 text-white rounded-lg shadow-lg")}>
            <div className="text-center mb-6">
                <h3 className="font-bold text-xl tracking-widest uppercase">{shop.name}</h3>
                <p className="text-gray-400 text-xs">{formatDate(transaction.date)}</p>
            </div>
            <div className="space-y-2">
                 {transaction.items.map(item => (
                    <div key={item.productId} className="flex justify-between items-center border-b border-gray-700 pb-2">
                        <div>
                            <p>{item.productName}</p>
                            <p className="text-gray-400 text-xs">{item.quantity} x {formatCurrency(item.price, shop.currency)}</p>
                        </div>
                        <p>{formatCurrency(item.price * item.quantity, shop.currency)}</p>
                    </div>
                ))}
            </div>
            <div className="mt-4 space-y-2 pt-2 border-t-2 border-gray-600">
                <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>{formatCurrency(subtotal, shop.currency)}</span></div>
                <div className="flex justify-between text-gray-300"><span>Tax (8%)</span><span>{formatCurrency(tax, shop.currency)}</span></div>
                <div className="flex justify-between text-lg font-bold mt-2"><span>Total</span><span>{formatCurrency(transaction.totalAmount, shop.currency)}</span></div>
            </div>
        </div>
    );
};


// Template 3: Minimalist
export const ReceiptTemplate3 = ({ transaction, shop }: ReceiptProps) => {
    const commonClasses = "bg-white text-gray-800 p-6 font-sans text-sm w-full max-w-sm mx-auto";
    const subtotal = transaction.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    return (
        <div className={cn(commonClasses, "border border-gray-200 rounded-lg")}>
             <p className="text-2xl font-semibold mb-1">{shop.name}</p>
             <p className="text-xs text-gray-500 mb-4">{formatDate(transaction.date)}</p>
             <div className="space-y-1">
                {transaction.items.map(item => (
                    <p key={item.productId}>{item.productName} ({item.quantity}) .......... {formatCurrency(item.price * item.quantity, shop.currency)}</p>
                ))}
             </div>
             <br/>
             <p className="text-right text-gray-600">Subtotal: {formatCurrency(subtotal, shop.currency)}</p>
             <p className="text-right text-gray-600">Tax: {formatCurrency(tax, shop.currency)}</p>
             <p className="text-right font-bold text-lg mt-1">TOTAL: {formatCurrency(transaction.totalAmount, shop.currency)}</p>
        </div>
    );
};

// Template 4: Compact Thermal
export const ReceiptTemplate4 = ({ transaction, shop }: ReceiptProps) => {
    const commonClasses = "bg-white text-black p-2 font-mono text-[10px] w-full max-w-[58mm] mx-auto";
    const subtotal = transaction.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${transaction.id}`;


    return (
        <div className={cn(commonClasses)}>
            <p className="text-center font-bold text-xs">{shop.name}</p>
            <p className="text-center">{shop.address}</p>
            <p className="text-center">{formatDate(transaction.date)}</p>
            <p>---------------------------------</p>
            {transaction.items.map(item => (
                 <p key={item.productId} className="flex justify-between">
                     <span>{item.productName.substring(0,12)} ({item.quantity})</span>
                     <span>{formatCurrency(item.price * item.quantity, shop.currency)}</span>
                </p>
            ))}
            <p>---------------------------------</p>
             <p className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotal, shop.currency)}</span></p>
             <p className="flex justify-between"><span>Tax:</span><span>{formatCurrency(tax, shop.currency)}</span></p>
            <p className="font-bold text-right text-xs">TOTAL: {formatCurrency(transaction.totalAmount, shop.currency)}</p>
             <p>---------------------------------</p>
             <div className="flex justify-center my-2">
                <Image src={qrCodeUrl} alt="Transaction QR Code" width={80} height={80} />
             </div>
             <p className="text-center">Scan for details</p>
        </div>
    );
};
