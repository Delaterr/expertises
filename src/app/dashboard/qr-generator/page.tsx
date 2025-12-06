
"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { collection } from 'firebase/firestore';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Product } from '../inventory/columns';
import { useReactToPrint } from 'react-to-print';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { useSettings } from '@/contexts/settings-context';

const PrintableQR = ({ product, qrCodeUrl }: { product: Product, qrCodeUrl: string }) => {
    return (
      <div className="flex flex-col items-center p-4 border rounded-lg bg-white text-black">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.code || product.id}</p>
        {qrCodeUrl && <Image src={qrCodeUrl} alt={`QR Code for ${product.name}`} width={200} height={200} />}
      </div>
    );
};


export default function QrGeneratorPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { settings } = useSettings();

  const shopId = settings?.id;

  const productsCollectionRef = useMemoFirebase(() => {
    if (shopId) {
      return collection(firestore, 'shops', shopId, 'products');
    }
    return null;
  }, [firestore, shopId]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsCollectionRef);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  useEffect(() => {
    if (selectedProduct) {
      // Prioritize barcode (SKU) for the QR code value, fall back to ID
      const valueToEncode = selectedProduct.code || selectedProduct.id;
      QRCode.toDataURL(valueToEncode, { width: 300, margin: 2 })
        .then(url => {
          setQrCodeUrl(url);
        })
        .catch(err => {
          console.error(err);
          setQrCodeUrl(null);
        });
    } else {
      setQrCodeUrl(null);
    }
  }, [selectedProduct]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${selectedProduct?.name}-QRCode`
  });


  return (
    <Card>
      <CardHeader>
        <CardTitle>QR & Barcode Generator</CardTitle>
        <CardDescription>
          Select a product to generate a printable QR code for its barcode (SKU) or internal ID.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-8">
        <div className="w-full max-w-sm">
          <Select
            onValueChange={setSelectedProductId}
            disabled={productsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={productsLoading ? "Loading products..." : "Select a product"} />
            </SelectTrigger>
            <SelectContent>
              {products?.map(product => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProduct && qrCodeUrl ? (
          <div className="flex flex-col items-center gap-4">
             <div ref={printRef} className="p-4">
                <PrintableQR product={selectedProduct} qrCodeUrl={qrCodeUrl} />
            </div>
            <Button onClick={handlePrint}>Print QR Code</Button>
          </div>
        ) : selectedProductId ? (
          <p>Generating QR Code...</p>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 min-h-[300px]">
            <h3 className="text-xl font-bold tracking-tight">
              No Product Selected
            </h3>
            <p className="text-muted-foreground">
              Please choose a product from the list above to generate a QR code.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    