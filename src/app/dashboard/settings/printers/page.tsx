
"use client";

import { useState, useEffect } from "react";
import { Loader2, Network } from "lucide-react";
import { doc } from "firebase/firestore";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/settings-context";
import type { Shop } from "@/contexts/settings-context";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function SettingsPrintersPage() {
    const { settings: initialShopSettings, loading: settingsLoading, shopDocRef: initialShopDocRef } = useSettings();
    const { toast } = useToast();
    const firestore = useFirestore();

    const [shopSettings, setShopSettings] = useState<Partial<Shop>>({});
    const [isSaving, setIsSaving] = useState(false);
    
    const shopDocRef = useMemoFirebase(() => {
        if(initialShopDocRef) {
            return initialShopDocRef
        }
        if (initialShopSettings) {
            return doc(firestore, 'shops', initialShopSettings.id);
        }
        return null;
    }, [firestore, initialShopSettings, initialShopDocRef]);
    

    useEffect(() => {
        if (initialShopSettings) {
            setShopSettings({
                printerIpAddress: initialShopSettings.printerIpAddress || '',
                printerPort: initialShopSettings.printerPort || 9100,
            });
        }
    }, [initialShopSettings]);

    const handleSettingsSave = async () => {
        if (!shopDocRef) return;

        setIsSaving(true);
        try {
            await updateDocumentNonBlocking(shopDocRef, shopSettings);
            toast({
                title: "Printer Settings Saved",
                description: "Your printer configuration has been updated.",
            });
        } catch (error) {
             toast({
                title: "Error Saving Settings",
                description: "Could not update your printer settings.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (settingsLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Network Printer Configuration</CardTitle>
                <CardDescription>
                Set up a network-connected receipt printer for direct printing.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="printer-ip">Printer IP Address</Label>
                        <Input 
                            id="printer-ip" 
                            placeholder="192.168.1.100" 
                            value={shopSettings.printerIpAddress || ''} 
                            onChange={(e) => setShopSettings({...shopSettings, printerIpAddress: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="printer-port">Port</Label>
                        <Input 
                            id="printer-port" 
                            type="number" 
                            placeholder="9100" 
                            value={shopSettings.printerPort || ''} 
                            onChange={(e) => setShopSettings({...shopSettings, printerPort: parseInt(e.target.value, 10) || 9100})}
                        />
                    </div>
                </div>
                <div className="flex items-center p-4 bg-muted/50 rounded-lg">
                    <Network className="h-8 w-8 mr-4 text-muted-foreground" />
                    <div>
                        <h4 className="font-semibold">How does this work?</h4>
                        <p className="text-sm text-muted-foreground">
                            Enter the local IP address of your ESC/POS compatible receipt printer. The application will send print jobs directly to this address over your local network.
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSettingsSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Printer Settings"}
                </Button>
            </CardFooter>
        </Card>
    )
}
