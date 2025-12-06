
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSettings } from "@/contexts/settings-context";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { Transaction } from "@/lib/data-types";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

export function RecentInvoices() {
  const { settings } = useSettings();
  const firestore = useFirestore();

  const shopId = settings?.id;

  const transactionsQuery = useMemoFirebase(() => {
    if (shopId) {
      return query(
        collection(firestore, 'shops', shopId, 'transactions'),
        orderBy('date', 'desc'),
        limit(5)
      );
    }
    return null;
  }, [firestore, shopId]);

  const { data: sales, isLoading: salesLoading } = useCollection<Transaction>(transactionsQuery);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: settings?.currency || "USD",
    }).format(amount);
  }

  return (
    <Card>
        <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>The last 5 sales made in the store.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/sales">
                    View All
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
            {salesLoading && <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/></div>}
            {!salesLoading && (!sales || sales.length === 0) && <div className="text-center text-sm text-muted-foreground">No invoices yet.</div>}
            <div className="space-y-4">
                {sales?.map(sale => (
                    <div key={sale.id} className="grid grid-cols-3 items-center gap-4">
                        <div className="col-span-2">
                            <p className="font-medium text-sm truncate">{sale.customerName || 'Walk-in Customer'}</p>
                            <p className="text-xs text-muted-foreground">#{sale.id.substring(0,7)}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-sm">{formatCurrency(sale.totalAmount)}</p>
                            <Badge variant={sale.isDebt ? 'secondary' : 'default'} className="mt-1 text-xs capitalize">{sale.paymentMethod}</Badge>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
  )
}
