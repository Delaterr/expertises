
"use client";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShopFlowLogo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useAuth,
  useFirestore,
} from "@/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";
import { doc, collection, serverTimestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getDeviceLocation = async (): Promise<{ address: string; currency: string; latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject("Geolocation is not supported by your browser.");
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Fetch address from coordinates
          const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const geoData = await geoResponse.json();
          const address = geoData.display_name || 'Address not found';
          const countryCode = geoData.address.country_code;

          // Fetch currency from country code
          const countryResponse = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
          const countryData = await countryResponse.json();
          const currency = Object.keys(countryData[0].currencies)[0] || 'USD';
          
          resolve({ address, currency, latitude, longitude });
        } catch (error) {
          console.error("Error fetching location data:", error);
          // Fallback to defaults if APIs fail
          resolve({ address: '123 Demo Street, USA', currency: 'USD', latitude: 34.0522, longitude: -118.2437 });
        }
      }, (error) => {
        console.error("Geolocation error:", error);
        // Fallback to defaults if user denies permission
        resolve({ address: '123 Demo Street, USA', currency: 'USD', latitude: 34.0522, longitude: -118.2437 });
      });
    });
  };


  const handleSignup = async (userCredential: UserCredential) => {
    const user = userCredential.user;
    if (!user) return;

    setIsLoading(true);
    toast({ title: "Setting up your account...", description: "Just a moment while we get things ready." });

    try {
        // 1. Update auth profile
        if (name && !user.displayName) {
          await updateProfile(user, { displayName: name });
        }
        const finalName = name || user.displayName;

        // 2. Create user document in Firestore
        const userDocRef = doc(firestore, "users", user.uid);
        setDocumentNonBlocking(userDocRef, {
          id: user.uid,
          email: user.email,
          firstName: finalName?.split(" ")[0] || "",
          lastName: finalName?.split(" ").slice(1).join(" ") || "",
        }, {});

        // Grant Super Admin Role on first signup.
        const adminRoleDocRef = doc(firestore, 'roles_admin', user.uid);
        setDocumentNonBlocking(adminRoleDocRef, {
          createdAt: serverTimestamp(),
          role: 'super_admin'
        }, {});

        // 3. Get location and create shop
        const { address, currency, latitude, longitude } = await getDeviceLocation();

        const shopCollectionRef = collection(firestore, "shops");
        const shopRef = doc(shopCollectionRef); // Create a new doc with a random ID
        setDocumentNonBlocking(shopRef, {
            id: shopRef.id,
            name: `${finalName}'s Cafe`,
            address: address,
            latitude: latitude,
            longitude: longitude,
            currency: currency,
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            heroImageUrl: "https://images.unsplash.com/photo-1494346480775-936a9f0d0877?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxjYWZlJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzYzMjc5NjIyfDA&ixlib=rb-4.1.0&q=80&w=1080",
            members: {
              [user.uid]: 'owner'
            }
        }, {});

        toast({
          title: "Sign-up Successful",
          description: "Welcome to ShopFlow! We've created a default shop for you.",
        });

        router.push("/dashboard");

    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Setup Failed",
            description: error.message || "Could not complete your account setup.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!name || !email || !password) {
      toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: "Please fill in all fields.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await handleSignup(userCredential);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: error.message || "An unexpected error occurred.",
      });
       setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await handleSignup(userCredential);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description:
          error.message || "Could not sign up with Google. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">
              Create an account
            </h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription>
                Join ShopFlow to manage your business with ease.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    placeholder="John Doe"
                    required
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  onClick={handleEmailSignup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Create an account"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  Sign up with Google
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                  Log in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center flex-col p-8">
        <ShopFlowLogo className="h-24 w-24 text-primary" />
        <h2 className="mt-6 text-4xl font-bold font-headline text-center">
          ShopFlow
        </h2>
        <p className="mt-2 text-lg text-muted-foreground text-center">
          The All-in-One POS and Inventory Solution.
        </p>
      </div>
    </div>
  );
}
