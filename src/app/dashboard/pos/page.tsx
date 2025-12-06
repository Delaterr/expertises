
"use client";

import Image from "next/image";
import * as React from "react";
import { PlusCircle, MinusCircle, X, Search, QrCode, UserPlus } from "lucide-react";
import { collection, serverTimestamp, doc, writeBatch, increment } from "firebase/firestore";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/contexts/settings-context";
import type { Product } from "@/app/dashboard/inventory/columns";
import { QrScanner } from "@/components/qr-scanner";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Label } from "@/components/ui/label";
import type { Customer } from "@/lib/data-types";
import { AddCustomerForm } from "@/components/add-customer-form";
import { Badge } from "@/components/ui/badge";

type CartItem = Product & { cartQuantity: number };
type PaymentMethod = "cash" | "card" | "mobile_money" | "debt";

export default function PosPage() {
  const { settings } = useSettings();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const userId = auth.currentUser?.uid;
  const shopId = settings?.id;

  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("card");
  const [addCustomerOpen, setAddCustomerOpen] = React.useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null);
  const [amountPaid, setAmountPaid] = React.useState(0);


  const productsCollectionRef = useMemoFirebase(() => {
    if (shopId) return collection(firestore, "shops", shopId, "products");
    return null;
  }, [firestore, shopId]);

  const categoriesCollectionRef = useMemoFirebase(() => {
    if (shopId) return collection(firestore, "shops", shopId, "categories");
    return null;
  }, [firestore, shopId]);

  const customersCollectionRef = useMemoFirebase(() => {
    if (shopId) return collection(firestore, "shops", shopId, "customers");
    return null;
  }, [firestore, shopId]);

  const { data: productsData } = useCollection<Product>(productsCollectionRef);
  const { data: categoriesData } = useCollection(categoriesCollectionRef);
  const { data: customersData } = useCollection<Customer>(customersCollectionRef);
  
  const subtotal = cart.reduce((acc, item) => acc + item.salesPrice * item.cartQuantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const amountDue = total - amountPaid;

  const categories = ["All", ...(categoriesData?.map((c: any) => c.name) || [])];
  const filteredProducts = productsData?.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.cartQuantity >= product.quantity) {
            toast({ variant: "destructive", title: "Out of Stock", description: `Cannot add more ${product.name} to cart.` });
            return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      if (product.quantity > 0) {
        return [...prevCart, { ...product, cartQuantity: 1 }];
      } else {
        toast({ variant: "destructive", title: "Out of Stock", description: `${product.name} cannot be added to cart.` });
        return prevCart;
      }
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart((prevCart) => {
      const itemInCart = prevCart.find((item) => item.id === productId);
      const productStock = productsData?.find(p => p.id === productId)?.quantity || 0;
      if (newQuantity > productStock) {
        toast({ variant: "destructive", title: "Stock Limit Exceeded", description: `Only ${productStock} items in stock.` });
        return prevCart;
      }
      if (newQuantity <= 0) return prevCart.filter((item) => item.id !== productId);
      return prevCart.map((item) =>
        item.id === productId ? { ...item, cartQuantity: newQuantity } : item
      );
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings?.currency || "USD",
    }).format(amount);
  };

  const findProductByCode = async (scannedCode: string) => {
    if (!productsData) return null;
    return productsData.find((p) => p.code === scannedCode || p.id === scannedCode) || null;
  };

  const handleScan = async (scannedCode: string) => {
    setScannerOpen(false);
    const product = await findProductByCode(scannedCode);
    if (product) {
      addToCart(product);
      toast({ title: "Product Added", description: `${product.name} has been added to the cart.` });
    } else {
      toast({ variant: "destructive", title: "Product Not Found", description: "Scanned code does not match any product." });
    }
  };

  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'totalSpent' | 'lastSeen' | 'avatarUrl'>) => {
    if (!customersCollectionRef || !shopId) return;
    const newCustomer = {
      ...customerData,
      shopId,
      totalSpent: 0,
      lastSeen: new Date().toISOString(),
      avatarUrl: `https://picsum.photos/seed/${customerData.name}/100/100`
    };
    addDocumentNonBlocking(customersCollectionRef, newCustomer);
    toast({ title: "Customer Added", description: `${customerData.name} has been added to your customer list.` });
    setAddCustomerOpen(false);
  };
  
  const handleCheckout = async () => {
    if (!userId || !shopId || !auth.currentUser || !productsCollectionRef) return;
    
    const batch = writeBatch(firestore);

    const transactionsCollectionRef = collection(firestore, 'shops', shopId, 'transactions');
    const transactionRef = doc(transactionsCollectionRef); 
    const selectedCustomer = customersData?.find(c => c.id === selectedCustomerId);

    const newTransaction = {
        shopId: shopId,
        date: serverTimestamp(),
        totalAmount: total,
        paymentMethod: paymentMethod,
        sellerId: userId,
        sellerName: auth.currentUser.displayName || auth.currentUser.email || "Unknown",
        items: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.cartQuantity,
            price: item.salesPrice,
        })),
        customerId: selectedCustomerId,
        customerName: selectedCustomer?.name || 'N/A',
        isDebt: paymentMethod === 'debt',
        amountPaid: paymentMethod === 'debt' ? amountPaid : total,
        amountDue: paymentMethod === 'debt' ? amountDue : 0,
    };

    batch.set(transactionRef, newTransaction);
    
    for (const item of cart) {
        const productRef = doc(productsCollectionRef, item.id);
        batch.update(productRef, { quantity: increment(-item.cartQuantity) });
    }

    try {
        await batch.commit();

        toast({ title: "Sale Completed", description: "The transaction has been recorded and stock updated." });
        setCart([]);
        setSelectedCustomerId(null);
        setPaymentMethod('card');
        setAmountPaid(0);

        // Redirect to the new receipt page
        router.push(`/dashboard/sales/${transactionRef.id}/receipt`);

    } catch (error) {
        console.error("Checkout failed: ", error);
        toast({
            variant: "destructive",
            title: "Checkout Failed",
            description: "There was an error processing the sale. Please try again.",
        });
    }
  }

  React.useEffect(() => {
    if (paymentMethod !== 'debt') {
      setAmountPaid(total);
    } else {
       setAmountPaid(0);
    }
  }, [paymentMethod, total]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-lg bg-background pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <QrCode className="h-5 w-5" />
                <span className="sr-only">Scan QR Code</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Scan Product QR Code</DialogTitle>
                <DialogDescription>
                  Center the product's QR code or barcode within the frame.
                </DialogDescription>
              </DialogHeader>
              {scannerOpen && <QrScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />}
            </DialogContent>
          </Dialog>
        </div>
        <Tabs defaultValue="All">
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))}
          </TabsList>
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(searchTerm ? filteredProducts : productsData || [])
                  .filter((p) => category === "All" || p.category === category)
                  .map((product) => {
                    const isOutOfStock = product.quantity <= 0;
                    return (
                        <Card key={product.id} className={`overflow-hidden ${isOutOfStock ? 'opacity-50 ' : 'cursor-pointer hover:shadow-lg transition-shadow'}`} onClick={isOutOfStock ? undefined : () => addToCart(product)}>
                            <CardContent className="p-0 relative">
                                <Image
                                alt={product.name}
                                className="aspect-square w-full object-cover"
                                height={300}
                                src={product.imageUrl}
                                width={300}
                                data-ai-hint={product.imageHint}
                                />
                                {isOutOfStock && (
                                    <Badge variant="destructive" className="absolute top-2 left-2">Out of Stock</Badge>
                                )}
                            </CardContent>
                            <CardFooter className="flex-col items-start p-4">
                                <p className="text-xs font-semibold text-primary uppercase tracking-wider">{product.category}</p>
                                <h3 className="font-semibold text-sm mt-1">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">{formatCurrency(product.salesPrice)}</p>
                                <div className="w-full flex justify-between items-center mt-2">
                                     <span className="text-xs text-muted-foreground">{product.quantity} in stock</span>
                                    <Button className="h-8" size="sm" onClick={(e) => { e.stopPropagation(); addToCart(product); }} disabled={isOutOfStock}>Add</Button>
                                </div>
                            </CardFooter>
                        </Card>
                    )
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Cart</CardTitle>
            <CardDescription>Review items and complete the sale.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center">Your cart is empty.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <Image alt={item.name} className="rounded-md" height={64} src={item.imageUrl} style={{ aspectRatio: "64/64", objectFit: "cover" }} width={64} />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(item.salesPrice)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}><MinusCircle className="h-4 w-4" /></Button>
                    <span>{item.cartQuantity}</span>
                    <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}><PlusCircle className="h-4 w-4" /></Button>
                  </div>
                  <Button size="icon" variant="ghost" className="text-muted-foreground" onClick={() => updateQuantity(item.id, 0)}><X className="h-4 w-4" /></Button>
                </div>
              ))
            )}
            <Separator />
            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label>Customer</Label>
                    <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
                        <DialogTrigger asChild>
                             <Button variant="outline" size="sm" className="h-7 gap-1"><UserPlus className="h-3.5 w-3.5" />New</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
                            <AddCustomerForm onCustomerAdded={handleAddCustomer} />
                        </DialogContent>
                    </Dialog>
                </div>
                <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId || ''}>
                    <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="walk_in">Walk-in Customer</SelectItem>
                        {customersData?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex items-center justify-between"><span>Tax (8%)</span><span>{formatCurrency(tax)}</span></div>
              <Separator />
              <div className="flex items-center justify-between font-semibold text-lg"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select onValueChange={(value: PaymentMethod) => setPaymentMethod(value)} defaultValue={paymentMethod}>
                    <SelectTrigger id="payment-method"><SelectValue placeholder="Select payment method" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="debt">Debt</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {paymentMethod === 'debt' && (
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                        <Label htmlFor="amount-paid">Amount Paid</Label>
                        <Input id="amount-paid" type="number" value={amountPaid} onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} placeholder="0.00" />
                    </div>
                    <div className="space-y-2 text-right">
                         <Label>Amount Due</Label>
                         <p className="text-2xl font-bold">{formatCurrency(amountDue)}</p>
                    </div>
                </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" disabled={cart.length === 0} onClick={handleCheckout}>
              Complete Sale
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
