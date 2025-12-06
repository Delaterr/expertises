
"use client"

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { useSettings } from '@/contexts/settings-context';
import type { DetailedSale } from '@/lib/data-types';

export default function SalesPage() {
    const auth = useAuth();
    const firestore = useFirestore();
    const { settings } = useSettings();
    const shopId = settings?.id;

    const transactionsCollectionRef = useMemoFirebase(() => {
        if (shopId) {
            return collection(firestore, 'shops', shopId, 'transactions');
        }
        return null;
    }, [firestore, shopId]);

    const { data: salesData } = useCollection<DetailedSale>(transactionsCollectionRef);

  return (
    <Tabs defaultValue="all">
        <div className="flex items-center">
            <TabsList>
                <TabsTrigger value="all">All Sales</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="all">
            <Card>
            <CardHeader>
                <CardTitle>Sales History</CardTitle>
                <CardDescription>
                A list of all transactions from your store.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={salesData || []} />
            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="reports">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Reports</CardTitle>
                    <CardDescription>
                        Generate and view detailed sales reports.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 min-h-[400px]">
                        <h3 className="text-2xl font-bold tracking-tight">
                        Advanced Reporting Coming Soon
                        </h3>
                        <p className="text-muted-foreground">
                        This section will allow you to generate, view, and export custom sales reports.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="invoices">
            <Card>
                <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>
                        Manage and track all customer invoices.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 min-h-[400px]">
                        <h3 className="text-2xl font-bold tracking-tight">
                        Invoice Management Coming Soon
                        </h3>
                        <p className="text-muted-foreground">
                        This section will allow you to view, download, and send customer invoices.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="alerts">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Alerts</CardTitle>
                    <CardDescription>
                        Notifications for important sales events.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 min-h-[400px]">
                        <h3 className="text-2xl font-bold tracking-tight">
                        Alerts System Coming Soon
                        </h3>
                        <p className="text-muted-foreground">
                        This section will notify you of chargebacks, low stock based on sales, and other critical events.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  )
}

    