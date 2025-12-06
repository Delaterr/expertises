
"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSettings } from "@/contexts/settings-context";
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import type { Transaction } from "@/lib/data-types";
import { Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";


export function RecentDebts() {
  const { settings } = useSettings();
  const firestore = useFirestore();

  const shopId = settings?.id;

  const transactionsQuery = useMemoFirebase(() => {
    if (shopId) {
      return query(
        collection(firestore, 'shops', shopId, 'transactions'),
        where('isDebt', '==', true),
        orderBy('date', 'desc'),
        limit(5)
      );
    }
    return null;
  }, [firestore, shopId]);

  const { data: debts, isLoading: debtsLoading } = useCollection<Transaction>(transactionsQuery);

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

  if (debtsLoading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
        </div>
    )
  }
  
  if (!debts || debts.length === 0) {
      return <div className="text-center text-sm text-muted-foreground">No recent debts found.</div>
  }

  return (
    <div className="space-y-8">
        {debts.map((debt) => {
            const customerName = debt.customerName || 'Walk-in Customer';
            
            return (
                 <div className="flex items-center" key={debt.id}>
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://picsum.photos/seed/${debt.customerId || debt.id}/100/100`} alt="Avatar" />
                        <AvatarFallback>{getInitials(customerName)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{customerName}</p>
                        <p className="text-sm text-muted-foreground">
                            {debt.date?.toDate ? debt.date.toDate().toLocaleDateString() : 'Recent'}
                        </p>
                    </div>
                    <div className="ml-auto font-medium text-right">
                        <div className="text-destructive">{formatCurrency(debt.amountDue || 0)}</div>
                        <div className="text-xs text-muted-foreground">Due</div>
                    </div>
                </div>
            )
        })}
    </div>
  )
}
