
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
import type { UserProfile } from '@/lib/data-types';

export default function SuperAdminUsersPage() {
    const firestore = useFirestore();

    const usersCollectionRef = useMemoFirebase(() => {
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: usersData } = useCollection<UserProfile>(usersCollectionRef);

  return (
    <Card>
    <CardHeader>
        <CardTitle>Manage All Users</CardTitle>
        <CardDescription>
            View, edit, or manage all users registered on the platform.
        </CardDescription>
    </CardHeader>
    <CardContent>
        <DataTable columns={columns} data={usersData || []} />
    </CardContent>
    </Card>
  )
}
