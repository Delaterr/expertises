
"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useSettings } from "@/contexts/settings-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { Shop } from "@/contexts/settings-context";


const templates = [
  { id: "template1", name: "Classic" },
  { id: "template2", name: "Modern" },
  { id: "template3", name: "Minimal" },
  { id: "template4", name: "Compact" },
];

const ReceiptPreview = ({ templateId, shop, isSelected }: { templateId: string, shop: Shop, isSelected: boolean }) => {
    const commonClasses = "bg-white text-black p-4 rounded-lg shadow-md font-mono text-xs w-full max-w-xs mx-auto";
    switch(templateId) {
        case 'template1':
            return (
                <div className={cn(commonClasses, "border-2 border-dashed border-gray-300")}>
                    <div className="text-center mb-2">
                        <h3 className="font-bold text-sm uppercase">{shop.name}</h3>
                        <p>{shop.address}</p>
                    </div>
                    <hr className="border-dashed my-2"/>
                    <div className="flex justify-between"><span>ITEM</span><span>PRICE</span></div>
                    <div className="flex justify-between"><span>Sample Product</span><span>$10.00</span></div>
                    <div className="flex justify-between"><span>Another Item</span><span>$5.50</span></div>
                    <hr className="border-dashed my-2"/>
                    <div className="flex justify-between font-bold"><span>TOTAL</span><span>$15.50</span></div>
                    <p className="text-center mt-2">Thank you!</p>
                </div>
            )
        case 'template2':
            return (
                <div className={cn(commonClasses, "bg-gray-800 text-white")}>
                    <div className="text-center mb-4">
                        <h3 className="font-bold text-lg tracking-widest">{shop.name}</h3>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between"><span>Sample Product</span><span>$10.00</span></div>
                         <div className="flex justify-between"><span>Another Item</span><span>$5.50</span></div>
                    </div>
                    <hr className="border-gray-600 my-3"/>
                    <div className="flex justify-between text-lg font-bold"><span>Total</span><span>$15.50</span></div>
                </div>
            )
        case 'template3':
            return (
                <div className={cn(commonClasses, "text-gray-700")}>
                     <p className="text-lg font-semibold mb-2">{shop.name}</p>
                     <p>Sample Product .......... $10.00</p>
                     <p>Another Item .......... $5.50</p>
                     <br/>
                     <p className="text-right font-bold text-base">TOTAL: $15.50</p>
                </div>
            )
        case 'template4':
             return (
                <div className={cn(commonClasses, "p-2")}>
                    <p className="text-center font-bold">{shop.name}</p>
                    <p className="text-center text-[10px]">{new Date().toLocaleString()}</p>
                    <p>---------------------------------</p>
                    <p>Sample Prod.........$10.00</p>
                    <p>Another.............$5.50</p>
                    <p>---------------------------------</p>
                    <p className="font-bold text-right">TOTAL: $15.50</p>
                </div>
            )
        default:
            return <div className={commonClasses}>Preview not available</div>;
    }
}


export default function SettingsReceiptsPage() {
    const { settings, loading, shopDocRef } = useSettings();
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (settings) {
            setSelectedTemplate(settings.receiptTemplate || 'template1');
        }
    }, [settings]);

    const handleSave = async () => {
        if (!shopDocRef || !selectedTemplate) return;
        setIsSaving(true);
        try {
            await updateDocumentNonBlocking(shopDocRef, { receiptTemplate: selectedTemplate });
            toast({
                title: "Template Saved",
                description: `Your receipt template has been updated to "${templates.find(t => t.id === selectedTemplate)?.name}".`,
            });
        } catch (error) {
            console.error("Error saving template:", error);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "Could not save your selected template.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !settings) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipt Templates</CardTitle>
        <CardDescription>
          Choose a template for your printed and emailed receipts. Your selection will be applied to all future transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {templates.map(template => {
                const isSelected = selectedTemplate === template.id;
                return (
                    <div key={template.id} className="space-y-4">
                        <h3 className="text-lg font-semibold text-center">{template.name}</h3>
                        <div 
                            className={cn(
                                "p-6 border-2 rounded-xl cursor-pointer relative transition-all",
                                isSelected ? "border-primary shadow-lg" : "border-muted hover:border-muted-foreground/50"
                            )}
                            onClick={() => setSelectedTemplate(template.id)}
                        >
                            <ReceiptPreview templateId={template.id} shop={settings} isSelected={isSelected}/>
                            {isSelected && (
                                <CheckCircle2 className="absolute top-2 right-2 h-6 w-6 text-primary bg-background rounded-full" />
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving || settings.receiptTemplate === selectedTemplate}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save Template"}
        </Button>
      </CardFooter>
    </Card>
  );
}

    