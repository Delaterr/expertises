
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { Loader2, MapPin, ArrowLeft } from "lucide-react";

import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import type { Shop } from "@/contexts/settings-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Haversine formula to calculate distance between two lat/lng points
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

export default function ShopLocationPage() {
  const params = useParams();
  const shopId = params.shopId as string;
  const firestore = useFirestore();
  const router = useRouter();

  const [customerLocation, setCustomerLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const shopDocRef = useMemoFirebase(() => {
    if (shopId) {
      return doc(firestore, "shops", shopId);
    }
    return null;
  }, [firestore, shopId]);

  const {
    data: shop,
    isLoading: shopLoading,
    error: shopError,
  } = useDoc<Shop>(shopDocRef);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomerLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(
            "Could not get your location. Please enable location services in your browser."
          );
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (customerLocation && shop?.latitude && shop?.longitude) {
      const dist = getDistance(
        customerLocation.lat,
        customerLocation.lng,
        shop.latitude,
        shop.longitude
      );
      setDistance(dist);
    }
  }, [customerLocation, shop]);
  
  if (shopLoading) {
      return <div className="flex flex-col gap-4 items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> <p className="text-muted-foreground">Loading Location...</p></div>
  }
  
  if (shopError || !shop) {
       return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-4xl font-bold mb-4">Shop Not Found</h1>
                <p className="text-muted-foreground">The shop at this URL could not be found. Please check the address and try again.</p>
                {shopError && <pre className="mt-4 text-xs text-left bg-muted p-4 rounded-md w-full max-w-lg overflow-auto"><code>{shopError.message}</code></pre>}
                 <Button onClick={() => router.push('/')} className="mt-6">Go Home</Button>
            </div>
        )
  }

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${
    shop.longitude - 0.01
  }%2C${shop.latitude - 0.01}%2C${
    shop.longitude + 0.01
  }%2C${shop.latitude + 0.01}&layer=mapnik&marker=${shop.latitude}%2C${
    shop.longitude
  }`;

  return (
    <div className="min-h-screen bg-muted/40">
        <header className="bg-background border-b sticky top-0 z-10">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                 <Button variant="ghost" asChild>
                    <Link href={`/store/${shopId}/menu`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Menu
                    </Link>
                </Button>
                <h1 className="text-xl font-bold">{shop.name} - Location</h1>
            </div>
        </header>
        <main className="container mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <MapPin className="h-6 w-6 text-primary" />
                        Our Location
                    </CardTitle>
                    <CardDescription>{shop.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {locationError && (
                        <p className="text-destructive">{locationError}</p>
                    )}
                    {distance !== null ? (
                        <p className="text-lg">
                            You are approximately{" "}
                            <span className="font-bold text-primary">
                                {distance.toFixed(1)} km
                            </span>{" "}
                            away.
                        </p>
                    ) : (
                        !locationError && <p>Calculating distance...</p>
                    )}

                    <div className="aspect-video w-full">
                        <iframe
                            width="100%"
                            height="100%"
                            className="border-0 rounded-md"
                            loading="lazy"
                            allowFullScreen
                            src={mapSrc}
                        ></iframe>
                    </div>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
