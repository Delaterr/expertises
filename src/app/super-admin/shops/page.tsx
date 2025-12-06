
"use client"

import { collection } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Shop } from '@/contexts/settings-context';

export default function SuperAdminShopsPage() {
    const firestore = useFirestore();

    const shopsCollectionRef = useMemoFirebase(() => {
        return collection(firestore, 'shops');
    }, [firestore]);

    const { data: shopsData } = useCollection<Shop>(shopsCollectionRef);

  return (
    <Card>
    <CardHeader>
        <CardTitle>Manage All Shops</CardTitle>
        <CardDescription>
            View, edit, or manage all shops registered on the platform.
        </CardDescription>
    </CardHeader>
    <CardContent>
        <DataTable columns={columns} data={shopsData || []} />
    </CardContent>
    </Card>
  )
}
