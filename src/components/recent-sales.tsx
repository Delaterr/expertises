
"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSettings } from "@/contexts/settings-context";
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { Transaction } from "@/lib/data-types";
import { Loader2 } from "lucide-react";


export function RecentSales() {
  const { settings } = useSettings();
  const firestore = useFirestore();

  const shopId = settings?.id;

  const transactionsQuery = useMemoFirebase(() => {
    if (shopId) {
      return query(
        collection(firestore, 'shops', shopId, 'transactions'),
        orderBy('date', 'desc'),
        limit(10)
      );
    }
    return null;
  }, [firestore, shopId]);

  const { data: sales, isLoading: salesLoading } = useCollection<Transaction>(transactionsQuery);

  const getInitials = (name: string) => {
    if (!name) return 'C';
    return name.split(' ').map(n => n[0]).join('')
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: settings?.currency || "USD",
    }).format(amount);
  }

  if (salesLoading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
        </div>
    )
  }
  
  if (!sales || sales.length === 0) {
      return <div className="text-center text-sm text-muted-foreground">No recent sales found.</div>
  }

  return (
    <div className="space-y-8">
        {sales.map((sale) => {
            const customerName = sale.customerName || 'Walk-in Customer';
            const customerEmail = 'customer@example.com'; // This is a placeholder
            
            return (
                 <div className="flex items-center" key={sale.id}>
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://picsum.photos/seed/${sale.customerId || sale.id}/100/100`} alt="Avatar" />
                        <AvatarFallback>{getInitials(customerName)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{customerName}</p>
                        <p className="text-sm text-muted-foreground">
                            {customerEmail}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">+{formatCurrency(sale.totalAmount)}</div>
                </div>
            )
        })}
    </div>
  )
}
