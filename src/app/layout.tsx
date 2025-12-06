import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { SettingsProvider } from '@/contexts/settings-context';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'ShopFlow',
  description: 'The all-in-one solution for POS, Inventory, and Menu management.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <SettingsProvider>
              {children}
              <Toaster />
          </SettingsProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
