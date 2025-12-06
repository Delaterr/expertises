
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection } from 'firebase/firestore';
import { Loader2, Store, User, Search } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Shop } from '@/contexts/settings-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShopFlowLogo } from '@/components/icons';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const shopsCollectionRef = useMemoFirebase(
    () => collection(firestore, 'shops'),
    [firestore]
  );

  const {
    data: shops,
    isLoading: shopsLoading,
    error: shopsError,
  } = useCollection<Shop>(shopsCollectionRef);

  const filteredShops =
    shops?.filter((shop) =>
      shop.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="bg-background min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ShopFlowLogo className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">ShopFlow</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <Button asChild>
                <Link href="/login">
                  <User className="mr-2 h-4 w-4" /> Owner Login
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="relative h-[400px] w-full bg-cover bg-center text-white md:h-[500px]">
          <Image
            src="https://picsum.photos/seed/shopflowbanner/2560/800"
            alt="A banner showing a collage of products"
            fill
            className="object-cover"
            priority
            data-ai-hint="various products"
          />
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
              Discover Local Shops
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-lg text-gray-200 md:text-xl">
              Browse menus from a variety of shops and find your next favorite
              item.
            </p>
            <div className="mt-8 w-full max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search for a shop..."
                  className="w-full rounded-full bg-white/90 p-4 pl-12 text-black placeholder:text-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="-mt-16 container mx-auto px-4 z-10 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <Card className="p-6 flex flex-col items-center justify-center col-span-full hover:shadow-lg transition-shadow">
                    <Store className="h-10 w-10 text-primary mb-2" />
                    <h3 className="font-semibold">Find Your Favorite product or Local Shop here</h3>
                </Card>
            </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {shopsLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          {shopsError && (
            <div className="text-center text-red-500">
              <p>Error loading shops: {shopsError.message}</p>
            </div>
          )}
          {!shopsLoading && !shopsError && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredShops.length > 0 ? (
                filteredShops.map((shop) => (
                  <Link key={shop.id} href={`/store/${shop.id}/menu`} passHref>
                    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl cursor-pointer h-full flex flex-col">
                      <CardContent className="p-0">
                        <div className="relative w-full aspect-video">
                          <Image
                            alt={shop.name}
                            className="object-cover"
                            src={
                              shop.heroImageUrl ||
                              'https://picsum.photos/seed/shop/400/225'
                            }
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            data-ai-hint="shop storefront"
                          />
                        </div>
                      </CardContent>
                      <CardHeader className="flex-grow">
                        <CardTitle className="flex items-center gap-2">
                          <Store className="h-5 w-5 text-primary" /> {shop.name}
                        </CardTitle>
                        <CardDescription>{shop.address}</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="secondary" className="w-full">
                          View Menu
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <h3 className="text-2xl font-semibold">No Shops Found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchTerm
                      ? 'No shops match your search.'
                      : 'Check back later to see new shops as they are added.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <footer className="border-t">
        <div className="container mx-auto py-6 text-center text-muted-foreground">
          <p>Powered by ShopFlow</p>
        </div>
      </footer>
    </div>
  );
}
