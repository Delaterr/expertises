
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, LocateFixed } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import { currencies } from "@/lib/currencies";
import { useSettings } from "@/contexts/settings-context";
import type { Shop } from "@/contexts/settings-context";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function SettingsProfilePage() {
    const { settings: initialShopSettings, loading: settingsLoading, shopDocRef: initialShopDocRef } = useSettings();
    const { toast } = useToast();
    const firestore = useFirestore();

    const [shopSettings, setShopSettings] = useState<Shop | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
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
            setShopSettings(initialShopSettings);
            setImagePreview(initialShopSettings.heroImageUrl || null);
        }
    }, [initialShopSettings]);

    const handleSettingsSave = async () => {
        if (!shopSettings || !shopDocRef) return;

        setIsSaving(true);
        // Image upload is temporarily disabled to prevent crash
        const settingsToSave = {
            ...shopSettings,
            // heroImageUrl: imagePreview || shopSettings.heroImageUrl,
        };

        try {
            await updateDocumentNonBlocking(shopDocRef, settingsToSave);
            toast({
                title: "Settings Saved",
                description: "Your shop settings have been updated.",
            });
        } catch (error) {
             toast({
                title: "Error Saving Settings",
                description: "Could not update your shop settings.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleLocate = () => {
        if (!navigator.geolocation) {
            toast({
                variant: "destructive",
                title: "Geolocation Not Supported",
                description: "Your browser does not support geolocation.",
            });
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                if(shopSettings) {
                    setShopSettings({ ...shopSettings, latitude, longitude });
                     // Also save it directly to Firestore
                    if(shopDocRef) {
                        updateDocumentNonBlocking(shopDocRef, { latitude, longitude });
                    }
                    toast({
                        title: "Location Fetched",
                        description: `Coordinates set to: Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
                    });
                }
                setIsLocating(false);
            },
            (error) => {
                console.error(error);
                 toast({
                    variant: "destructive",
                    title: "Could Not Get Location",
                    description: "Please ensure location services are enabled in your browser.",
                });
                setIsLocating(false);
            }
        );
    };

    if (settingsLoading || !shopSettings) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Card>
        <CardHeader>
            <CardTitle>Shop Profile</CardTitle>
            <CardDescription>
            Manage your shop's public information and settings.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Shop Hero Image</Label>
                {imagePreview && (
                    <div className="w-full aspect-video relative">
                        <Image src={imagePreview} alt="Shop hero image" fill className="rounded-md object-cover border"/>
                    </div>
                )}
                <p className="text-sm text-muted-foreground">
                    Shop hero image editing is temporarily disabled.
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="shop-name">Shop Name</Label>
                <Input id="shop-name" value={shopSettings.name} onChange={(e) => setShopSettings({...shopSettings, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                    <Select value={shopSettings.currency} onValueChange={(value) => setShopSettings({...shopSettings, currency: value})}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent>
                        {currencies.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                    <Input id="address" value={shopSettings.address} onChange={(e) => setShopSettings({...shopSettings, address: e.target.value})} />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8" onClick={handleLocate} disabled={isLocating}>
                        {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
            {shopSettings.latitude && shopSettings.longitude && (
                <div className="text-sm text-muted-foreground">
                    Current Coordinates: {shopSettings.latitude.toFixed(4)}, {shopSettings.longitude.toFixed(4)}
                </div>
            )}
        </CardContent>
        <CardFooter>
            <Button onClick={handleSettingsSave} disabled={isSaving}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
        </CardFooter>
        </Card>
    )
}
