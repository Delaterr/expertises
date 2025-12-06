
"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSettings } from "@/contexts/settings-context";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { Product } from "@/lib/data-types";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function RecentProducts() {
  const { settings } = useSettings();
  const firestore = useFirestore();

  const shopId = settings?.id;

  const productsQuery = useMemoFirebase(() => {
    if (shopId) {
      // Assuming products have a 'createdAt' field. 
      // This is added in inventory/page.tsx but not in the type def.
      // We will add it to make this work.
      return query(
        collection(firestore, 'shops', shopId, 'products'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
    }
    return null;
  }, [firestore, shopId]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);
  
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
                <CardTitle>Recently Added Products</CardTitle>
                <CardDescription>The newest items in your inventory.</CardDescription>
            </div>
             <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/inventory">
                    View All
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
            {productsLoading && <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/></div>}
            {!productsLoading && (!products || products.length === 0) && <div className="text-center text-sm text-muted-foreground">No products added recently.</div>}
            <div className="space-y-4">
                {products?.map(product => (
                    <div key={product.id} className="flex items-center gap-4">
                        <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="rounded-md object-cover aspect-square"/>
                        <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                        <p className="ml-auto font-semibold text-sm">{formatCurrency(product.salesPrice)}</p>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
  )
}
