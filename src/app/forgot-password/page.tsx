
"use client";

import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ShopFlowLogo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
        toast({ variant: "destructive", title: "Email is required." });
        return;
    }
    setIsLoading(true);
    try {
        await sendPasswordResetEmail(auth, email);
        toast({
            title: "Password Reset Email Sent",
            description: "If an account with this email exists, a reset link has been sent.",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Forgot Password</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email to receive a reset link.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                We'll send a password reset link to your email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" onClick={handlePasswordReset} disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Remembered your password?{" "}
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
        <h2 className="mt-6 text-4xl font-bold font-headline text-center">ShopFlow</h2>
        <p className="mt-2 text-lg text-muted-foreground text-center">
          The All-in-One POS and Inventory Solution.
        </p>
      </div>
    </div>
  )
}
