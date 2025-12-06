
'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Home, Users, Store, LogOut, PanelLeft } from 'lucide-react';

import { useAuth, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { ShopFlowLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const userId = auth.currentUser?.uid;

  const adminRoleDocRef = useMemoFirebase(
    () => (userId ? doc(firestore, 'roles_admin', userId) : null),
    [firestore, userId]
  );

  const { data: adminRole, isLoading: isAdminLoading } = useDoc(adminRoleDocRef);

  useEffect(() => {
    // If done loading and user is not an admin, redirect.
    if (!isAdminLoading && !adminRole) {
      router.replace('/super-admin/login');
    }
  }, [adminRole, isAdminLoading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/super-admin/login');
  };

  if (isAdminLoading || !adminRole) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/super-admin"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Shield className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Super Admin</span>
          </Link>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/super-admin"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/super-admin/shops"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Store className="h-5 w-5" />
                  <span className="sr-only">Shops</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Shops</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/super-admin/users"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Users className="h-5 w-5" />
                  <span className="sr-only">Users</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Users</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="md:h-8 md:w-8">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                 <Link
                    href="/super-admin"
                    className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                    <Shield className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">Super Admin</span>
                </Link>
                <Link href="/super-admin" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                    <Home className="h-5 w-5" />
                    Dashboard
                </Link>
                 <Link href="/super-admin/shops" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                    <Store className="h-5 w-5" />
                    Shops
                </Link>
                <Link href="/super-admin/users" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                    <Users className="h-5 w-5" />
                    Users
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="ml-auto">
             <UserNav />
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
