
"use client"

import { useState } from 'react';
import { collection, doc } from 'firebase/firestore';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { useSettings } from '@/contexts/settings-context';
import type { Customer } from '@/lib/data-types';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddCustomerForm } from '@/components/add-customer-form';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { EditCustomerForm } from '@/components/edit-customer-form';

export default function CustomersPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { settings } = useSettings();
    const shopId = settings?.id;

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const customersCollectionRef = useMemoFirebase(() => {
        if (shopId) {
            return collection(firestore, 'shops', shopId, 'customers');
        }
        return null;
    }, [firestore, shopId]);

    const { data: customersData } = useCollection<Customer>(customersCollectionRef);

    const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'totalSpent' | 'lastSeen' | 'avatarUrl'>) => {
        if (!customersCollectionRef || !shopId) return;
        const newCustomer = {
        ...customerData,
        shopId,
        totalSpent: 0,
        lastSeen: new Date().toISOString(),
        avatarUrl: `https://picsum.photos/seed/${customerData.name}/100/100`
        };
        addDocumentNonBlocking(customersCollectionRef, newCustomer);
        toast({ title: "Customer Added", description: `${customerData.name} has been added to your customer list.` });
        setIsAddDialogOpen(false);
    };

    const handleEditCustomer = (customerId: string, customerData: Partial<Omit<Customer, 'id'>>) => {
        if (!customersCollectionRef) return;
        const customerDocRef = doc(customersCollectionRef, customerId);
        updateDocumentNonBlocking(customerDocRef, customerData);
        toast({ title: "Customer Updated", description: "The customer's details have been updated." });
        setIsEditDialogOpen(false);
        setSelectedCustomer(null);
    }

    const handleDeleteCustomer = (customerId: string) => {
        if (!customersCollectionRef) return;
        const customerDocRef = doc(customersCollectionRef, customerId);
        deleteDocumentNonBlocking(customerDocRef);
        toast({ title: "Customer Deleted", description: "The customer has been removed." });
    }

    const openEditDialog = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsEditDialogOpen(true);
    }
    
  return (
    <>
    <Card>
    <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Customers</CardTitle>
            <CardDescription>
                Manage your customers and view their purchase history.
            </CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Customer
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <AddCustomerForm onCustomerAdded={handleAddCustomer} />
            </DialogContent>
        </Dialog>
    </CardHeader>
    <CardContent>
        <DataTable 
            columns={columns({ onEdit: openEditDialog, onDelete: handleDeleteCustomer })} 
            data={customersData || []} 
        />
    </CardContent>
    </Card>

    <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        if (!open) setSelectedCustomer(null);
        setIsEditDialogOpen(open);
    }}>
        <DialogContent>
             <DialogHeader>
                <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
                <EditCustomerForm
                    customer={selectedCustomer}
                    onCustomerUpdated={handleEditCustomer}
                />
            )}
        </DialogContent>
    </Dialog>
    </>
  )
}
