
"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, DocumentReference, query, where, doc } from "firebase/firestore";

export interface Shop {
    id: string;
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    currency: string;
    ownerId: string;
    heroImageUrl?: string;
    members?: Record<string, string>; // e.g., { [userId]: 'admin' }
    receiptTemplate?: string;
    printerIpAddress?: string;
    printerPort?: number;
}

interface SettingsContextValue {
  settings: Shop | null;
  loading: boolean;
  shopDocRef: DocumentReference | null;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const userId = auth.currentUser?.uid;

  // Query the root /shops collection for shops owned by the current user.
  const shopsQuery = useMemoFirebase(() => {
    if (userId) {
      return query(
        collection(firestore, 'shops'),
        where('ownerId', '==', userId)
      );
    }
    return null;
  }, [firestore, userId]);
  

  const { data: shops, isLoading: loading, error } = useCollection<Shop>(shopsQuery);

  const settings = useMemo(() => {
    if (shops && shops.length > 0) {
      // For now, we assume the user manages the first shop they own.
      return shops[0];
    }
    return null;
  }, [shops]);
  
  const shopDocRef = useMemoFirebase(() => {
     if (settings?.id) {
       return doc(firestore, "shops", settings.id);
     }
     return null;
  }, [firestore, settings]);


  const value = {
      settings,
      loading,
      shopDocRef
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
