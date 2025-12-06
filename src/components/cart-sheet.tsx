
"use client";

import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, MinusCircle, X, ShoppingCart } from "lucide-react";
import type { Product } from "@/app/dashboard/inventory/columns";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUser } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

type CartItem = Product & { cartQuantity: number };

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  currency: string;
}

export function CartSheet({
  open,
  onOpenChange,
  cartItems,
  onUpdateQuantity,
  currency,
}: CartSheetProps) {
    const { toast } = useToast();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(amount);
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.salesPrice * item.cartQuantity, 0);

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            toast({
                title: "Signed In",
                description: "You are now signed in.",
            });
        } catch (error) {
            console.error("Google sign-in error:", error);
            toast({
                variant: "destructive",
                title: "Sign-In Failed",
                description: "Could not sign in with Google. Please try again.",
            });
        }
    };


    const handleCheckout = () => {
        if (!user) {
            handleGoogleSignIn();
            return;
        }

        // Proceed with checkout logic for logged-in user
        onOpenChange(false);
        toast({
            title: "Checkout Simulated",
            description: "In a real app, this would proceed to payment.",
        })
    }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            Review your items and proceed to checkout.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-24 w-24 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground">Add some products to get started.</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
              <div className="flex flex-col gap-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <Image
                      alt={item.name}
                      className="rounded-md aspect-square object-cover"
                      height={64}
                      src={item.imageUrl}
                      width={64}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.salesPrice)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => onUpdateQuantity(item.id, item.cartQuantity - 1)}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span className="w-6 text-center">{item.cartQuantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => onUpdateQuantity(item.id, item.cartQuantity + 1)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => onUpdateQuantity(item.id, 0)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {cartItems.length > 0 && (
          <SheetFooter className="pt-4">
            <div className="w-full space-y-4">
              <Separator />
              <div className="flex items-center justify-between font-semibold text-lg">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isUserLoading}>
                {isUserLoading ? "Loading..." : (user ? "Proceed to Checkout" : "Sign In to Checkout")}
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
