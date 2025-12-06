
"use client";

import { useMemo } from "react";
import { collection } from "firebase/firestore";
import {
  LayoutGrid,
  TrendingUp,
  DollarSign,
  Package,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SalesChart } from "@/components/sales-chart";
import { RecentSales } from "@/components/recent-sales";
import { useSettings } from "@/contexts/settings-context";
import { DateRangePicker } from "@/components/date-range-picker";
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { Product } from "@/lib/data-types";
import type { Transaction } from "@/lib/data-types";
import { RecentProducts } from "@/components/recent-products";

export default function DashboardPage() {
  const { settings } = useSettings();
  const auth = useAuth();
  const firestore = useFirestore();

  const shopId = settings?.id;

  const productsCollectionRef = useMemoFirebase(() => {
    if (shopId) {
      return collection(
        firestore,
        "shops",
        shopId,
        "products"
      );
    }
    return null;
  }, [firestore, shopId]);

  const categoriesCollectionRef = useMemoFirebase(() => {
    if (shopId) {
      return collection(
        firestore,
        "shops",
        shopId,
        "categories"
      );
    }
    return null;
  }, [firestore, shopId]);

  const transactionsCollectionRef = useMemoFirebase(() => {
    if (shopId) {
      return collection(
        firestore,
        "shops",
        shopId,
        "transactions"
      );
    }
    return null;
  }, [firestore, shopId]);

  const { data: products } = useCollection<Product>(productsCollectionRef);
  const { data: categories } = useCollection(categoriesCollectionRef);
  const { data: sales } = useCollection<Transaction>(transactionsCollectionRef);

  const totalRevenue = sales?.reduce((acc, sale) => acc + sale.totalAmount, 0) || 0;
  const totalCost = products?.reduce((acc, product) => acc + (product.purchasePrice * (product.quantity > 0 ? 10 : 0)), 0) || 0; // simplified
  const monthlyProfit = totalRevenue - totalCost;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings?.currency || "USD",
    }).format(amount);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <DateRangePicker />
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Profit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlyProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              +15.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Categories
            </CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.length || 0}</div>
            <p className="text-xs text-muted-foreground">+2 new this month</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 mt-8">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Transactions Overview</CardTitle>
            <CardDescription>
              A visual summary of recent transaction trends.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              You made {sales?.length || 0} sales this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
       <div className="grid gap-4 md:gap-8 lg:grid-cols-3 mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Recent transactions from your store.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground p-8">Feature coming soon</div>
            </CardContent>
        </Card>
        <RecentProducts />
        <Card>
            <CardHeader>
                <CardTitle>Recent Debts</CardTitle>
                <CardDescription>Recent transactions marked as debt.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground p-8">Feature coming soon</div>
            </CardContent>
        </Card>
       </div>
    </>
  );
}
