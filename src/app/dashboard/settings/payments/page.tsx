
"use client";

import { CreditCard, KeyRound } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";

// Simple inline SVG for PayPal icon
const PayPalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0070BA]">
        <path d="M7.72 10.16a1.08 1.08 0 0 1-.6 1.8l-2.4.45a1.08 1.08 0 0 0-.6 1.8l2.4.45a1.08 1.08 0 0 1 .6 1.8l-.45 2.4a1.08 1.08 0 0 0 1.8.6l2.4-.45a1.08 1.08 0 0 1 1.8.6l.45 2.4a1.08 1.08 0 0 0 1.8-.6l.45-2.4a1.08 1.08 0 0 1 1.8-.6l2.4.45a1.08 1.08 0 0 0 1.8-.6l.45-2.4a1.08 1.08 0 0 1 .6-1.8l2.4-.45a1.08 1.08 0 0 0 .6-1.8l-2.4-.45a1.08 1.08 0 0 1-.6-1.8l.45-2.4a1.08 1.08 0 0 0-1.8-.6l-2.4.45a1.08 1.08 0 0 1-1.8-.6L13 2.16a1.08 1.08 0 0 0-1.8.6l-.45 2.4a1.08 1.08 0 0 1-1.8.6l-2.4-.45a1.08 1.08 0 0 0-1.8.6z"/>
    </svg>
);

// Simple inline SVG for Mobile Money
const MobileMoneyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
        <path d="M12 18h.01"></path>
    </svg>
);

export default function SettingsPaymentsPage() {
    return (
        <Card>
        <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
            Connect payment gateways to accept payments from your customers.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {/* PayPal */}
            <div className="flex items-start gap-6">
                <PayPalIcon />
                <div className="flex-grow">
                    <h4 className="text-lg font-semibold">PayPal</h4>
                    <p className="text-sm text-muted-foreground">
                        Enable customers to pay with their PayPal account.
                    </p>
                    <div className="mt-4 space-y-2">
                            <Label htmlFor="paypal-client-id">PayPal Client ID</Label>
                            <Input id="paypal-client-id" placeholder="Enter your PayPal Client ID" />
                    </div>
                </div>
                <Button variant="outline">Connect</Button>
            </div>

            <Separator />

                {/* Mobile Money */}
            <div className="flex items-start gap-6">
                <MobileMoneyIcon />
                <div className="flex-grow">
                    <h4 className="text-lg font-semibold">Mobile Money</h4>
                    <p className="text-sm text-muted-foreground">
                        Accept payments via various mobile money providers.
                    </p>
                    <div className="mt-4 space-y-2">
                            <Label htmlFor="mobile-money-key">Mobile Money API Key</Label>
                            <Input id="mobile-money-key" placeholder="Enter your Mobile Money API Key" />
                    </div>
                </div>
                <Button variant="outline">Connect</Button>
            </div>

            <Separator />

            {/* Stripe / Credit Card */}
            <div className="flex items-start gap-6">
                <CreditCard className="h-6 w-6"/>
                    <div className="flex-grow">
                    <h4 className="text-lg font-semibold">Credit & Debit Cards (Stripe)</h4>
                    <p className="text-sm text-muted-foreground">
                        Accept all major credit and debit cards via Stripe.
                    </p>
                    <div className="mt-4 space-y-2">
                            <Label htmlFor="stripe-key">Stripe API Key</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="stripe-key" placeholder="sk_live_..." className="pl-8" />
                            </div>
                    </div>
                </div>
                <Button variant="outline">Connect</Button>
            </div>
        </CardContent>
        <CardFooter>
                <Button>Save Payment Settings</Button>
        </CardFooter>
        </Card>
    )
}
