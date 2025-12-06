
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Product } from "@/app/dashboard/inventory/columns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: Product & { variants: any[] }) => void;
  currency: string;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  onAddToCart,
  currency,
}: ProductDetailDialogProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { value: string, additionalPrice: number }>>({});
  const [totalPrice, setTotalPrice] = useState(product?.salesPrice || 0);

  useEffect(() => {
    if (product) {
      // Pre-select the first variant for each option
      const initialSelections: Record<string, { value: string, additionalPrice: number }> = {};
      if (product.variants && product.variants.length > 0) {
        const uniqueVariantNames = Array.from(new Set(product.variants.map(v => v.name)));
        uniqueVariantNames.forEach(name => {
            const firstVariant = product.variants.find(v => v.name === name);
            if (firstVariant) {
                initialSelections[name] = { value: firstVariant.value, additionalPrice: firstVariant.additionalPrice };
            }
        });
      }
      setSelectedVariants(initialSelections);
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      const basePrice = product.salesPrice;
      const additionalPrice = Object.values(selectedVariants).reduce(
        (acc, variant) => acc + (variant.additionalPrice || 0),
        0
      );
      setTotalPrice(basePrice + additionalPrice);
    }
  }, [product, selectedVariants]);

  const handleVariantChange = (variantName: string, value: string) => {
    const variant = product?.variants.find(v => v.name === variantName && v.value === value);
    if (variant) {
        setSelectedVariants(prev => ({
            ...prev,
            [variantName]: { value: variant.value, additionalPrice: variant.additionalPrice },
        }));
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
        const finalProduct = {
            ...product,
            salesPrice: totalPrice,
            // You might want to store selected variants in the cart item as well
            variants: Object.entries(selectedVariants).map(([name, selection]) => ({
                name,
                value: selection.value,
            })),
        };
        // @ts-ignore
        onAddToCart(finalProduct);
    }
  };

  if (!product) {
    return null;
  }
  
  const uniqueVariantNames = product.variants ? Array.from(new Set(product.variants.map(v => v.name))) : [];


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
            <div className="relative w-full h-64 mb-4">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    className="rounded-md object-cover"
                    fill
                    sizes="(max-width: 640px) 100vw, 480px"
                    data-ai-hint={product.imageHint}
                />
            </div>
            <DialogTitle className="text-2xl">{product.name}</DialogTitle>
            <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
            {uniqueVariantNames.map(name => (
                <div key={name}>
                    <Label className="text-md font-medium">{name}</Label>
                    <RadioGroup 
                        value={selectedVariants[name]?.value} 
                        onValueChange={(value) => handleVariantChange(name, value)}
                        className="mt-2 flex flex-wrap gap-2"
                    >
                        {product.variants.filter(v => v.name === name).map(variant => (
                            <div key={variant.value}>
                                <RadioGroupItem value={variant.value} id={`${product.id}-${name}-${variant.value}`} className="sr-only" />
                                <Label htmlFor={`${product.id}-${name}-${variant.value}`}>
                                    <Badge variant={selectedVariants[name]?.value === variant.value ? "default" : "outline"} className="cursor-pointer text-base">
                                        {variant.value}
                                        {variant.additionalPrice > 0 && ` (+${formatCurrency(variant.additionalPrice, currency)})`}
                                    </Badge>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            ))}
        </div>

        <DialogFooter>
            <div className="w-full flex justify-between items-center">
                <span className="text-2xl font-bold">{formatCurrency(totalPrice, currency)}</span>
                <Button type="button" size="lg" onClick={handleAddToCart}>Add to Cart</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
