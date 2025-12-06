
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, QrCode } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { QrScanner } from "./qr-scanner";


const productSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  salesPrice: z.coerce.number().min(0, { message: "Price must be positive." }),
  purchasePrice: z.coerce.number().min(0, { message: "Price must be positive." }),
  quantity: z.coerce.number().min(0, { message: "Quantity must be positive." }),
  lowStockThreshold: z.coerce.number().min(0, { message: "Threshold must be positive." }).optional().default(10),
  category: z.string().min(1, { message: "Please select a category." }),
  unit: z.string().min(1, { message: "Please select a unit." }),
  image: z.any().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductFormProps {
  onProductAdded: (product: ProductFormValues) => void;
  categories: {id: string, name: string}[];
}

const units = ["pcs", "kg", "g", "L", "ml"];

export function AddProductForm({ onProductAdded, categories }: AddProductFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      salesPrice: 0,
      purchasePrice: 0,
      quantity: 0,
      lowStockThreshold: 10,
      category: "",
      unit: "pcs"
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleScan = (scannedCode: string) => {
    form.setValue("code", scannedCode);
    setScannerOpen(false);
    toast({
        title: "Code Scanned",
        description: `Product code set to: ${scannedCode}`,
    });
  };

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
        onProductAdded(data);
        toast({
            title: "Product Added",
            description: `${data.name} has been successfully added.`,
        });
        form.reset();
        setImagePreview(null);
    } catch (error) {
        console.error(error);
        toast({ title: "Submission Failed", description: "Could not add the product. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
     <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
         <FormField
           control={form.control}
           name="name"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Product Name</FormLabel>
               <FormControl>
                 <Input placeholder="e.g., T-Shirt" {...field} />
               </FormControl>
               <FormMessage />
             </FormItem>
           )}
         />
        <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Barcode (SKU)</FormLabel>
                <div className="flex gap-2">
                    <FormControl>
                        <Input placeholder="e.g., 123456789012" {...field} />
                    </FormControl>
                    <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" type="button">
                                <QrCode className="h-5 w-5" />
                                <span className="sr-only">Scan Barcode</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Scan Barcode/QR Code</DialogTitle>
                            </DialogHeader>
                            <QrScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
                <FormMessage />
                </FormItem>
            )}
        />
         <FormField
           control={form.control}
           name="description"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Description</FormLabel>
               <FormControl>
                 <Textarea placeholder="A brief description of the product." {...field} />
               </FormControl>
               <FormMessage />
             </FormItem>
           )}
         />
         <div className="grid grid-cols-2 gap-4">
           <FormField
             control={form.control}
             name="salesPrice"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Sales Price</FormLabel>
                 <FormControl>
                   <Input type="number" step="0.01" placeholder="0.00" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <FormField
             control={form.control}
             name="purchasePrice"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Purchase Price</FormLabel>
                 <FormControl>
                   <Input type="number" step="0.01" placeholder="0.00" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
         </div>
          <div className="grid grid-cols-2 gap-4">
             <FormField
             control={form.control}
             name="quantity"
             render={({ field }) => (
                 <FormItem>
                 <FormLabel>Stock Quantity</FormLabel>
                 <FormControl>
                     <Input type="number" placeholder="0" {...field} />
                 </FormControl>
                 <FormMessage />
                 </FormItem>
             )}
             />
              <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Low Stock Threshold</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
         </div>
         <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {units.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
         </div>
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              {imagePreview && (
                <div className="w-full">
                    <Image 
                        src={imagePreview} 
                        alt="Product image preview" 
                        width={200} 
                        height={200} 
                        className="object-cover rounded-md border mx-auto"
                    />
                </div>
              )}
              <FormControl>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Add Product"}
         </Button>
       </form>
     </Form>
  );
}
