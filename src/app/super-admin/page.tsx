'use client';

import { Shield, Store, Users, DollarSign, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Shop } from '@/contexts/settings-context';
import type { UserProfile } from '@/lib/data-types';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SuperAdminPage() {
    const firestore = useFirestore();

    const shopsCollectionRef = useMemoFirebase(() => collection(firestore, 'shops'), [firestore]);
    const usersCollectionRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);

    const recentShopsQuery = useMemoFirebase(() => query(shopsCollectionRef, orderBy('createdAt', 'desc'), limit(5)), [shopsCollectionRef]);
    const recentUsersQuery = useMemoFirebase(() => query(usersCollectionRef, orderBy('email'), limit(5)), [usersCollectionRef]);


    const { data: shops, isLoading: shopsLoading } = useCollection<Shop>(shopsCollectionRef);
    const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersCollectionRef);

    const { data: recentShops, isLoading: recentShopsLoading } = useCollection<Shop>(recentShopsQuery);
    const { data: recentUsers, isLoading: recentUsersLoading } = useCollection<UserProfile>(recentUsersQuery);

    const getInitials = (name: string) => {
        if (!name) return '?';
        return name.split(' ').map((n) => n[0]).join('');
    };


  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
            Welcome! Here is an overview of the platform.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shopsLoading ? '...' : shops?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total number of shops registered on the platform.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
               {usersLoading ? '...' : users?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
                Total number of registered users.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform Revenue (TBD)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $0.00
            </div>
            <p className="text-xs text-muted-foreground">
              Future metric: Total revenue processed across all shops.
            </p>
          </CardContent>
        </Card>
      </div>
       <div className="grid gap-4 md:gap-8 lg:grid-cols-2 mt-8">
            <Card>
                <CardHeader className='flex flex-row items-center'>
                    <div className='grid gap-2'>
                        <CardTitle>Recent Shops</CardTitle>
                        <CardDescription>The last 5 shops created.</CardDescription>
                    </div>
                     <Button asChild size="sm" className="ml-auto gap-1">
                        <Link href="/super-admin/shops">
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {recentShopsLoading ? <p>Loading...</p> : recentShops?.map(shop => (
                            <div key={shop.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={shop.heroImageUrl} alt={shop.name} />
                                    <AvatarFallback>{shop.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{shop.name}</p>
                                    <p className="text-sm text-muted-foreground">{shop.address}</p>
                                </div>
                                <div className="ml-auto font-medium text-sm">{shop.currency}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className='flex flex-row items-center'>
                     <div className='grid gap-2'>
                        <CardTitle>Recent Users</CardTitle>
                        <CardDescription>The last 5 users that registered.</CardDescription>
                    </div>
                     <Button asChild size="sm" className="ml-auto gap-1">
                        <Link href="/super-admin/users">
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                 <CardContent>
                    <div className='space-y-4'>
                        {recentUsersLoading ? <p>Loading...</p> : recentUsers?.map(user => (
                             <div key={user.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.avatar} alt={user.firstName} />
                                    <AvatarFallback>{getInitials(user.firstName)}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
       </div>
    </>
  );
}
