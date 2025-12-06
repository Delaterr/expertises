
"use client";

import Image from "next/image"
import { useState } from "react"
import Link from "next/link";
import { useParams } from "next/navigation"
import { QrCode, Search, LayoutGrid, ShoppingCart, LogOut, Loader2, MapPin } from 'lucide-react'
import { collection, doc } from "firebase/firestore";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
    CardDescription
  } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import type { Product } from "@/app/dashboard/inventory/columns";
import type { Shop } from "@/contexts/settings-context"
import { CartSheet } from "@/components/cart-sheet";
import { useToast } from "@/hooks/use-toast";
import { ProductDetailDialog } from "@/components/product-detail-dialog";
import { useAuth, useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { signOut } from "firebase/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShopFlowLogo } from "@/components/icons";

type Category = {
    id: string;
    name: string;
    imageUrl: string;
}

type CartItem = Product & { cartQuantity: number };

export default function PublicMenuPage() {
    const params = useParams();
    const { toast } = useToast();
    const firestore = useFirestore();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();

    const shopId = params.shopId as string;
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const shopDocRef = useMemoFirebase(() => {
        if (shopId) {
            return doc(firestore, 'shops', shopId);
        }
        return null;
    }, [firestore, shopId]);

    const productsCollectionRef = useMemoFirebase(() => {
         if (shopId) {
            return collection(firestore, 'shops', shopId, 'products');
        }
        return null;
    }, [firestore, shopId])

     const categoriesCollectionRef = useMemoFirebase(() => {
         if (shopId) {
            return collection(firestore, 'shops', shopId, 'categories');
        }
        return null;
    }, [firestore, shopId])

    const { data: shop, isLoading: shopLoading, error: shopError } = useDoc<Shop>(shopDocRef);
    const { data: products, isLoading: productsLoading, error: productsError } = useCollection<Product>(productsCollectionRef);
    const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCollection<Category>(categoriesCollectionRef);
    
    const loading = shopLoading || productsLoading || categoriesLoading;
    const error = shopError || productsError || categoriesError;

    const defaultHeroImage = "https://images.unsplash.com/photo-1494346480775-936a9f0d0877?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxjYWZlJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzYzMjc5NjIyfDA&ixlib=rb-4.1.0&q=80&w=1080";
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${typeof window !== 'undefined' ? window.location.href : ''}`;

    const filteredProducts = (products || []).filter((product) => {
        const productCategory = categories?.find(c => c.id === product.categoryId)?.name
        const matchesCategory = selectedCategory ? productCategory === selectedCategory : true;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const formatCurrency = (amount: number) => {
        if (!shop?.currency) return `$${amount.toFixed(2)}`;
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: shop.currency,
        }).format(amount);
    };

    const addToCart = (product: Product) => {
        setCart((prevCart) => {
          const existingItem = prevCart.find((item) => item.id === product.id);
          if (existingItem) {
            return prevCart.map((item) =>
              item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
            );
          }
          return [...prevCart, { ...product, cartQuantity: 1 }];
        });
        toast({
            title: "Added to Cart",
            description: `${product.name} has been added to your cart.`,
        });
    };
    
    const updateCartQuantity = (productId: string, newQuantity: number) => {
        setCart((prevCart) => {
          if (newQuantity <= 0) {
            return prevCart.filter((item) => item.id !== productId);
          }
          return prevCart.map((item) =>
            item.id === productId ? { ...item, cartQuantity: newQuantity } : item
          );
        });
    };

    const handleSignOut = async () => {
        await signOut(auth);
        toast({
            title: "Signed Out",
            description: "You have been successfully signed out.",
        });
    }

    const cartItemCount = cart.reduce((total, item) => total + item.cartQuantity, 0);

    if (loading) {
        return <div className="flex flex-col gap-4 items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> <p className="text-muted-foreground">Loading Menu...</p></div>
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <h1 className="text-4xl font-bold mb-4">Error Loading Menu</h1>
                <p className="text-muted-foreground">Could not load shop data. The link may be incorrect or the shop may no longer exist.</p>
                 <pre className="mt-4 text-xs text-left bg-muted p-4 rounded-md w-full max-w-lg overflow-auto"><code>{error.message}</code></pre>
            </div>
        )
    }
    
    if (!shop && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <h1 className="text-4xl font-bold mb-4">Shop Not Found</h1>
                <p className="text-muted-foreground">The shop at this URL could not be found. Please check the address and try again.</p>
            </div>
        )
    }

    return (
        <div className="bg-background">
             <CartSheet 
                open={isCartOpen}
                onOpenChange={setIsCartOpen}
                cartItems={cart}
                onUpdateQuantity={updateCartQuantity}
                currency={shop?.currency || 'USD'}
            />

            <ProductDetailDialog 
                product={selectedProduct}
                open={!!selectedProduct}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setSelectedProduct(null);
                    }
                }}
                onAddToCart={(product) => {
                    addToCart(product);
                    setSelectedProduct(null);
                }}
                currency={shop?.currency || 'USD'}
            />

             {/* Floating Cart Button */}
             <Button 
                className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50" 
                size="icon"
                onClick={() => setIsCartOpen(true)}
            >
                <ShoppingCart className="h-8 w-8" />
                {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 block h-6 w-6 transform translate-x-1/4 -translate-y-1/4 rounded-full bg-destructive text-destructive-foreground text-xs font-bold ring-2 ring-background">
                        {cartItemCount}
                    </span>
                )}
                <span className="sr-only">Open Cart</span>
            </Button>


            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-14 items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <ShopFlowLogo className="h-6 w-6 text-primary" />
                        <span className="font-bold sm:inline-block">ShopFlow</span>
                    </Link>
                    <nav className="flex flex-1 items-center justify-end space-x-4">
                        {user ? (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                                    <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                                    <LogOut className="h-5 w-5" />
                                    <span className="sr-only">Sign Out</span>
                                </Button>
                            </div>
                        ) : !isUserLoading && (
                             <Button asChild variant="ghost">
                                <Link href="/login">Shop Owner Login</Link>
                            </Button>
                        )}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline"><QrCode className="mr-2 h-4 w-4" /> Share Menu</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto">
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-sm font-medium">Scan to view menu</p>
                                <Image src={qrCodeUrl} alt="QR Code for menu" width={150} height={150} />
                            </div>
                            </PopoverContent>
                        </Popover>
                    </nav>
                </div>
            </header>

            <div className="relative">
                <Image 
                    src={shop?.heroImageUrl || defaultHeroImage}
                    alt="Store hero image" 
                    width={1200} 
                    height={400} 
                    className="w-full h-48 lg:h-64 object-cover" 
                    data-ai-hint="cafe interior"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <h1 className="text-4xl lg:text-6xl font-bold text-white font-headline capitalize">{shop?.name}</h1>
                </div>
                 <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm p-2 rounded-md text-sm">
                    <Link href={`/store/${shopId}/location`} className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{shop?.address}</span>
                    </Link>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <aside className="md:col-span-1">
                        <div className="sticky top-24">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><LayoutGrid className="h-5 w-5"/> Categories</h3>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search products..."
                                    className="w-full rounded-lg bg-background pl-8 mb-4"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {categoriesLoading ? <p>Loading categories...</p> : (
                                <ul className="space-y-2">
                                    <li>
                                        <Button 
                                            variant={selectedCategory === null ? "secondary" : "ghost"}
                                            className="w-full justify-start h-auto"
                                            onClick={() => setSelectedCategory(null)}
                                        >
                                            All Categories
                                        </Button>
                                    </li>
                                    {(categories || []).map((category) => (
                                        <li key={category.id}>
                                            <Button 
                                                variant={selectedCategory === category.name ? "secondary" : "ghost"}
                                                className="w-full justify-start h-auto"
                                                onClick={() => setSelectedCategory(category.name)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Image src={"https://picsum.photos/seed/cat/40/40"} alt={category.name} width={40} height={40} className="rounded-md object-cover aspect-square"/>
                                                    <span>{category.name}</span>
                                                </div>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </aside>

                    <div className="md:col-span-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                <Card key={product.id} className="overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedProduct(product)}>
                                    <CardContent className="p-0">
                                        <Image
                                            alt={product.name}
                                            className="aspect-video w-full object-cover"
                                            height={225}
                                            src={product.imageUrl}
                                            width={400}
                                            data-ai-hint={product.imageHint}
                                        />
                                    </CardContent>
                                    <CardHeader className="flex-grow">
                                        <CardTitle>{product.name}</CardTitle>
                                        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                                    </CardHeader>
                                    <CardFooter className="flex justify-between items-center">
                                        <p className="font-semibold text-lg">{formatCurrency(product.salesPrice)}</p>
                                        <Button onClick={(e) => { e.stopPropagation(); addToCart(product); }}>Add to Cart</Button>
                                    </CardFooter>
                                </Card>
                            ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <h3 className="text-xl font-semibold">No Products Found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="text-center py-6 border-t">
                <p className="text-muted-foreground">Powered by ShopFlow</p>
            </footer>
        </div>
    )
}

